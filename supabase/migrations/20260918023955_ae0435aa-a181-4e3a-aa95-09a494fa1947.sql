-- Seeder gateway: PostgREST exposes only the `api` schema, so scripture seeding
-- writes through this SECURITY DEFINER function.
-- "Thy word is a lamp unto my feet" — Psalm 119:105
CREATE OR REPLACE FUNCTION api.upsert_bible_verses(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  affected integer;
BEGIN
  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RETURN 0;
  END IF;

  WITH incoming AS (
    SELECT
      (row_data->>'book_name')::text AS book_name,
      (row_data->>'chapter')::integer AS chapter,
      (row_data->>'verse')::integer AS verse,
      (row_data->>'text')::text AS text,
      (row_data->>'version')::text AS version,
      COALESCE((row_data->>'testament')::text, 'Old') AS testament,
      COALESCE((row_data->>'financial_relevance')::integer, 5) AS financial_relevance,
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(row_data->'wisdom_category', '[]'::jsonb))),
        '{}'::text[]
      ) AS wisdom_category
    FROM jsonb_array_elements(p_rows) AS row_data
    WHERE row_data->>'book_name' IS NOT NULL
      AND row_data->>'text' IS NOT NULL
      AND row_data->>'version' IS NOT NULL
  ), written AS (
    INSERT INTO public.bible_verses AS bv (
      book_name, chapter, verse, text, version, testament, financial_relevance, wisdom_category
    )
    SELECT book_name, chapter, verse, text, version, testament, financial_relevance, wisdom_category
    FROM incoming
    ON CONFLICT (book_name, chapter, verse, version) DO UPDATE
      SET text = EXCLUDED.text,
          testament = EXCLUDED.testament,
          financial_relevance = EXCLUDED.financial_relevance,
          wisdom_category = EXCLUDED.wisdom_category,
          updated_at = now()
    RETURNING 1
  )
  SELECT count(*)::integer INTO affected FROM written;

  RETURN COALESCE(affected, 0);
END;
$$;

REVOKE ALL ON FUNCTION api.upsert_bible_verses(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION api.upsert_bible_verses(jsonb) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION api.upsert_bible_verses(jsonb) TO service_role;