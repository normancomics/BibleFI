ALTER VIEW api.public_church_directory SET (security_invoker = false);

GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT SELECT ON api.public_church_directory TO anon, authenticated;

REVOKE ALL ON public.global_churches FROM anon;
REVOKE ALL ON public.global_churches FROM authenticated;

GRANT ALL ON api.public_church_directory TO service_role;