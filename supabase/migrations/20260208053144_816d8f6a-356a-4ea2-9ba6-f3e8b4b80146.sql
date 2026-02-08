-- Expose biblical_knowledge_base and comprehensive_biblical_texts via api schema
CREATE OR REPLACE VIEW api.biblical_knowledge_base AS
SELECT * FROM public.biblical_knowledge_base;

CREATE OR REPLACE VIEW api.comprehensive_biblical_texts AS
SELECT * FROM public.comprehensive_biblical_texts;

CREATE OR REPLACE VIEW api.biblical_financial_crossref AS
SELECT * FROM public.biblical_financial_crossref;

-- Grant service role access
GRANT SELECT, INSERT, UPDATE, DELETE ON api.biblical_knowledge_base TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.comprehensive_biblical_texts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.biblical_financial_crossref TO service_role;