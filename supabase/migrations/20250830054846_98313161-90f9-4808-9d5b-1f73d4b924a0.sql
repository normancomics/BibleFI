-- Fix search path for existing functions to address security warnings
ALTER FUNCTION public.search_biblical_knowledge(query_embedding vector, match_threshold double precision, match_count integer) 
SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public;