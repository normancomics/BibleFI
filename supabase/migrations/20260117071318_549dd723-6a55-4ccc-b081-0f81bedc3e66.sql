-- Fix api.global_churches view permissions
-- The service_role should have full access to the api schema

-- Grant usage on api schema to service_role
GRANT USAGE ON SCHEMA api TO service_role;

-- Grant select on the view to service_role
GRANT SELECT ON api.global_churches TO service_role;

-- Also grant to postgres role (used by edge functions)
GRANT SELECT ON api.global_churches TO postgres;

-- Ensure the view can access the underlying table
GRANT SELECT ON public.global_churches TO service_role;
GRANT SELECT ON public.global_churches TO postgres;