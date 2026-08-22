CREATE OR REPLACE FUNCTION public.trigger_agent_function(p_function text, p_body jsonb DEFAULT '{}'::jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault, net, pg_catalog
AS $$
DECLARE
  v_secret text;
  v_req_id bigint;
BEGIN
  IF p_function !~ '^[a-z0-9-]{3,60}$' THEN
    RAISE EXCEPTION 'invalid function name';
  END IF;

  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'AGENT_OPS_CRON_SECRET'
  LIMIT 1;

  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'AGENT_OPS_CRON_SECRET missing from vault';
  END IF;

  SELECT net.http_post(
    url := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/' || p_function,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_secret
    ),
    body := coalesce(p_body, '{}'::jsonb),
    timeout_milliseconds := 55000
  ) INTO v_req_id;

  RETURN v_req_id;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_agent_function(text, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_agent_function(text, jsonb) TO service_role;