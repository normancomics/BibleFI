-- 1. Deduplicate then enforce one row per verse per version
DELETE FROM public.bible_verses a
USING public.bible_verses b
WHERE a.id > b.id
  AND a.book_name = b.book_name
  AND a.chapter = b.chapter
  AND a.verse = b.verse
  AND a.version = b.version;

CREATE UNIQUE INDEX IF NOT EXISTS bible_verses_unique_ref_version
  ON public.bible_verses (book_name, chapter, verse, version);

CREATE INDEX IF NOT EXISTS bible_verses_version_idx ON public.bible_verses (version);

-- 2. Service role (edge function seeder) may write
GRANT SELECT, INSERT, UPDATE ON public.bible_verses TO service_role;
GRANT SELECT ON public.bible_verses TO anon, authenticated;

-- 3. Expose read-only view through the api schema used by PostgREST
CREATE OR REPLACE VIEW api.bible_verses
WITH (security_invoker = true) AS
SELECT id, book_name, chapter, verse, text, version, testament,
       financial_relevance, wisdom_category, defi_keywords, created_at, updated_at
FROM public.bible_verses;

GRANT SELECT ON api.bible_verses TO anon, authenticated, service_role;