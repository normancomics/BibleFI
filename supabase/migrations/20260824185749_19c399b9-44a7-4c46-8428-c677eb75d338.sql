CREATE OR REPLACE FUNCTION api.validate_agent_cron_secret(p_secret text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
  SELECT public.validate_cron_job_secret('agent-ops', p_secret);
$$;

REVOKE ALL ON FUNCTION api.validate_agent_cron_secret(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.validate_agent_cron_secret(text) TO service_role;