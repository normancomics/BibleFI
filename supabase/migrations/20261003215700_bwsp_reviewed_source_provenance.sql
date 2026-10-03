ALTER TABLE public.biblical_knowledge_base
  ADD COLUMN IF NOT EXISTS source_translation text,
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_version text,
  ADD COLUMN IF NOT EXISTS provenance_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.biblical_knowledge_base
  ADD CONSTRAINT biblical_knowledge_source_translation_check
    CHECK (source_translation IS NULL OR source_translation IN ('KJV', 'WEB')),
  ADD CONSTRAINT biblical_knowledge_provenance_status_check
    CHECK (provenance_status IN ('unverified', 'verified')),
  ADD CONSTRAINT biblical_knowledge_review_status_check
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  ADD CONSTRAINT biblical_knowledge_reviewed_source_check
    CHECK (
      review_status <> 'approved'
      OR (
        provenance_status = 'verified'
        AND source_translation IN ('KJV', 'WEB')
        AND source_name IS NOT NULL
        AND source_url LIKE 'https://%'
        AND reviewed_at IS NOT NULL
      )
    );

ALTER TABLE public.defi_knowledge_base
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS provenance_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE VIEW api.biblical_knowledge_base AS
SELECT * FROM public.biblical_knowledge_base;

UPDATE public.defi_knowledge_base
SET source_url = documentation_url
WHERE source_url IS NULL AND documentation_url IS NOT NULL;

ALTER TABLE public.defi_knowledge_base
  ADD CONSTRAINT defi_knowledge_provenance_status_check
    CHECK (provenance_status IN ('unverified', 'verified')),
  ADD CONSTRAINT defi_knowledge_review_status_check
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  ADD CONSTRAINT defi_knowledge_reviewed_source_check
    CHECK (
      review_status <> 'approved'
      OR (
        provenance_status = 'verified'
        AND source_name IS NOT NULL
        AND source_url LIKE 'https://%'
        AND reviewed_at IS NOT NULL
      )
    );

CREATE INDEX IF NOT EXISTS idx_bkb_reviewed_embedding
  ON public.biblical_knowledge_base USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL AND review_status = 'approved' AND provenance_status = 'verified';

CREATE INDEX IF NOT EXISTS idx_defi_reviewed_embedding
  ON public.defi_knowledge_base USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL AND review_status = 'approved' AND provenance_status = 'verified';

CREATE OR REPLACE FUNCTION public.match_reviewed_biblical_knowledge(
  query_embedding vector(1536),
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  reference text,
  verse_text text,
  principle text,
  application text,
  category text,
  source_translation text,
  source_name text,
  source_url text,
  source_version text,
  reviewed_at timestamptz,
  similarity double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    bkb.id,
    bkb.reference,
    bkb.verse_text,
    bkb.principle,
    bkb.application,
    bkb.category,
    bkb.source_translation,
    bkb.source_name,
    bkb.source_url,
    bkb.source_version,
    bkb.reviewed_at,
    1 - (bkb.embedding <=> query_embedding) AS similarity
  FROM public.biblical_knowledge_base AS bkb
  WHERE bkb.embedding IS NOT NULL
    AND bkb.source_translation IN ('KJV', 'WEB')
    AND bkb.provenance_status = 'verified'
    AND bkb.review_status = 'approved'
    AND bkb.reviewed_at IS NOT NULL
    AND bkb.source_name IS NOT NULL
    AND bkb.source_url LIKE 'https://%'
    AND 1 - (bkb.embedding <=> query_embedding) > match_threshold
  ORDER BY bkb.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 0), 10);
$$;

CREATE OR REPLACE FUNCTION public.match_reviewed_defi_knowledge(
  query_embedding vector(1536),
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  topic text,
  content text,
  protocol text,
  source_name text,
  source_url text,
  reviewed_at timestamptz,
  similarity double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    dkb.id,
    dkb.topic,
    dkb.content,
    dkb.protocol,
    dkb.source_name,
    dkb.source_url,
    dkb.reviewed_at,
    1 - (dkb.embedding <=> query_embedding) AS similarity
  FROM public.defi_knowledge_base AS dkb
  WHERE dkb.embedding IS NOT NULL
    AND dkb.provenance_status = 'verified'
    AND dkb.review_status = 'approved'
    AND dkb.reviewed_at IS NOT NULL
    AND dkb.source_name IS NOT NULL
    AND dkb.source_url ~* '^https://(docs\.base\.org|base\.org|docs\.superfluid\.org|superfluid\.org|github\.com/normancomics/BibleFI/(blob|tree)/(main|[0-9a-f]{40})/(contracts|contracts_forge))(/|$)'
    AND 1 - (dkb.embedding <=> query_embedding) > match_threshold
  ORDER BY dkb.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 0), 10);
$$;

REVOKE ALL ON FUNCTION public.match_reviewed_biblical_knowledge(vector, double precision, integer)
 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.match_reviewed_defi_knowledge(vector, double precision, integer)
 FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.match_reviewed_biblical_knowledge(vector, double precision, integer)
 TO service_role;
GRANT EXECUTE ON FUNCTION public.match_reviewed_defi_knowledge(vector, double precision, integer)
 TO service_role;

CREATE OR REPLACE FUNCTION api.missing_bible_verse_keys(
  p_refs jsonb,
  p_versions text[]
)
RETURNS TABLE (
  book_name text,
  chapter integer,
  verse integer,
  version text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH requested_refs AS (
    SELECT ref.book_name, ref.chapter, ref.verse
    FROM jsonb_to_recordset(COALESCE(p_refs, '[]'::jsonb))
      AS ref(book_name text, chapter integer, verse integer)
    WHERE ref.book_name IS NOT NULL AND ref.chapter > 0 AND ref.verse > 0
  ),
  allowed_versions AS (
    SELECT requested.version
    FROM unnest(COALESCE(p_versions, ARRAY[]::text[])) AS requested(version)
    WHERE requested.version IN ('KJV', 'WEB')
  )
  SELECT requested_refs.book_name, requested_refs.chapter, requested_refs.verse, allowed_versions.version
  FROM requested_refs
  CROSS JOIN allowed_versions
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.bible_verses AS existing
    WHERE existing.book_name = requested_refs.book_name
      AND existing.chapter = requested_refs.chapter
      AND existing.verse = requested_refs.verse
      AND existing.version = allowed_versions.version
  );
$$;

REVOKE ALL ON FUNCTION api.missing_bible_verse_keys(jsonb, text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION api.missing_bible_verse_keys(jsonb, text[]) TO service_role;
