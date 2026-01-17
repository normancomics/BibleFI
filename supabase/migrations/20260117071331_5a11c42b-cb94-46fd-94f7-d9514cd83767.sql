-- Fix function search_path warnings by setting search_path for existing functions
-- This prevents schema injection attacks

ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public;

-- Update search_biblical_knowledge function if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_biblical_knowledge') THEN
        EXECUTE 'ALTER FUNCTION public.search_biblical_knowledge(query_embedding text, match_threshold double precision, match_count integer) SET search_path = public';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Update search_comprehensive_biblical_knowledge function if it exists  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_comprehensive_biblical_knowledge') THEN
        EXECUTE 'ALTER FUNCTION public.search_comprehensive_biblical_knowledge(query_embedding text, match_threshold double precision, match_count integer) SET search_path = public';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;