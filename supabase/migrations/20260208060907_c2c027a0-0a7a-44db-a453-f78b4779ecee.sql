
-- Make api.biblical_knowledge_base insertable
CREATE OR REPLACE FUNCTION api.insert_biblical_knowledge_base()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.biblical_knowledge_base (verse_text, reference, category, principle, application, defi_relevance, financial_keywords)
  VALUES (NEW.verse_text, NEW.reference, NEW.category, NEW.principle, NEW.application, NEW.defi_relevance, NEW.financial_keywords);
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_insert_biblical_kb
INSTEAD OF INSERT ON api.biblical_knowledge_base
FOR EACH ROW EXECUTE FUNCTION api.insert_biblical_knowledge_base();

-- Make api.comprehensive_biblical_texts insertable
CREATE OR REPLACE FUNCTION api.insert_comprehensive_biblical_texts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.comprehensive_biblical_texts (book, chapter, verse, kjv_text, financial_keywords, financial_relevance)
  VALUES (NEW.book, NEW.chapter, NEW.verse, NEW.kjv_text, NEW.financial_keywords, NEW.financial_relevance);
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_insert_comprehensive_texts
INSTEAD OF INSERT ON api.comprehensive_biblical_texts
FOR EACH ROW EXECUTE FUNCTION api.insert_comprehensive_biblical_texts();

-- Make api.biblical_financial_crossref insertable
CREATE OR REPLACE FUNCTION api.insert_biblical_financial_crossref()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.biblical_financial_crossref (biblical_term, financial_term, defi_concept, relationship_type, explanation, practical_application, risk_consideration)
  VALUES (NEW.biblical_term, NEW.financial_term, NEW.defi_concept, NEW.relationship_type, NEW.explanation, NEW.practical_application, NEW.risk_consideration);
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_insert_biblical_crossref
INSTEAD OF INSERT ON api.biblical_financial_crossref
FOR EACH ROW EXECUTE FUNCTION api.insert_biblical_financial_crossref();

-- Grant permissions
GRANT INSERT ON api.biblical_knowledge_base TO service_role;
GRANT INSERT ON api.comprehensive_biblical_texts TO service_role;
GRANT INSERT ON api.biblical_financial_crossref TO service_role;
