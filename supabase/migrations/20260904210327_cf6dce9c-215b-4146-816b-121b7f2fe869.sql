CREATE OR REPLACE VIEW api.strongs_concordance
WITH (security_invoker = true) AS
SELECT
  id,
  strong_number,
  original_word,
  transliteration,
  pronunciation,
  part_of_speech,
  definition,
  root_word,
  language,
  created_at
FROM public.strongs_concordance;

GRANT SELECT ON api.strongs_concordance TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON api.strongs_concordance TO service_role;