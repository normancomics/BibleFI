CREATE OR REPLACE VIEW api.biblical_original_texts AS
SELECT id, book, chapter, verse, kjv_text, hebrew_text, greek_text, aramaic_text,
       strong_numbers, original_words, morphology, financial_relevance,
       financial_keywords, defi_keywords, created_at, updated_at
FROM public.biblical_original_texts;

GRANT SELECT ON api.biblical_original_texts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON api.biblical_original_texts TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.biblical_original_texts TO service_role;