-- Fix search_path for the biblical knowledge search functions
-- Using correct signature with vector type

ALTER FUNCTION public.search_biblical_knowledge(vector, double precision, integer) 
SET search_path = public, pg_catalog;

ALTER FUNCTION public.search_comprehensive_biblical_knowledge(vector, double precision, integer) 
SET search_path = public, pg_catalog;