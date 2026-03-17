-- Grant SELECT on api schema views to anon and authenticated roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT SELECT ON api.biblical_knowledge_base TO anon, authenticated;
GRANT SELECT ON api.comprehensive_biblical_texts TO anon, authenticated;
GRANT SELECT ON api.biblical_financial_crossref TO anon, authenticated;