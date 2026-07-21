-- Observability for the public church directory:
--  1. public.church_directory_request_logs — structured client-reported request
--     logs (which view/RPC path was hit, PostgREST error code/message/hint,
--     row counts, durations). Written via api.log_church_directory_request.
--  2. public.diagnose_church_directory() — one-shot diagnostic (service role
--     only, used by the church-directory-debug edge function) that reports
--     which access path works, effective grants, RLS state, and row counts.

CREATE TABLE IF NOT EXISTS public.church_directory_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  request_id text,
  operation text NOT NULL,
  path text NOT NULL,
  success boolean NOT NULL,
  row_count integer,
  duration_ms integer,
  error_code text,
  error_message text,
  error_details text,
  error_hint text,
  client_context jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cdr_logs_created
  ON public.church_directory_request_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cdr_logs_failures
  ON public.church_directory_request_logs (created_at DESC) WHERE success = false;

ALTER TABLE public.church_directory_request_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.church_directory_request_logs FROM anon, authenticated;

CREATE POLICY "Admins can read directory request logs"
  ON public.church_directory_request_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.church_directory_request_logs TO authenticated;

-- Client-callable logger (exposed through the api schema PostgREST uses).
-- All inputs are truncated so anonymous callers cannot bloat the table.
CREATE OR REPLACE FUNCTION api.log_church_directory_request(
  p_operation text,
  p_path text,
  p_success boolean,
  p_row_count integer DEFAULT NULL,
  p_duration_ms integer DEFAULT NULL,
  p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL,
  p_error_details text DEFAULT NULL,
  p_error_hint text DEFAULT NULL,
  p_request_id text DEFAULT NULL,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.church_directory_request_logs
    (operation, path, success, row_count, duration_ms,
     error_code, error_message, error_details, error_hint,
     request_id, client_context)
  VALUES (
    left(coalesce(p_operation, 'unknown'), 40),
    left(coalesce(p_path, 'unknown'), 120),
    coalesce(p_success, false),
    p_row_count,
    p_duration_ms,
    left(p_error_code, 40),
    left(p_error_message, 500),
    left(p_error_details, 500),
    left(p_error_hint, 500),
    left(p_request_id, 64),
    CASE WHEN pg_column_size(coalesce(p_context, '{}'::jsonb)) > 8192
         THEN '{}'::jsonb ELSE coalesce(p_context, '{}'::jsonb) END
  );
END;
$$;

REVOKE ALL ON FUNCTION api.log_church_directory_request(text, text, boolean, integer, integer, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.log_church_directory_request(text, text, boolean, integer, integer, text, text, text, text, text, jsonb) TO anon, authenticated, service_role;

-- Full diagnostic of every access path to the directory. Service role only.
CREATE OR REPLACE FUNCTION public.diagnose_church_directory()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, api, pg_catalog
AS $$
DECLARE
  v_base_count bigint;
  v_base_err text;
  v_fn_count bigint;
  v_fn_err text;
  v_view_count bigint;
  v_view_err text;
  v_policies jsonb;
  v_rls jsonb;
  v_view_options text[];
BEGIN
  BEGIN
    SELECT count(*) INTO v_base_count FROM public.global_churches;
  EXCEPTION WHEN OTHERS THEN v_base_err := SQLSTATE || ': ' || SQLERRM;
  END;

  BEGIN
    SELECT count(*) INTO v_fn_count FROM api.get_public_church_directory();
  EXCEPTION WHEN OTHERS THEN v_fn_err := SQLSTATE || ': ' || SQLERRM;
  END;

  BEGIN
    SELECT count(*) INTO v_view_count FROM api.public_church_directory;
  EXCEPTION WHEN OTHERS THEN v_view_err := SQLSTATE || ': ' || SQLERRM;
  END;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'name', policyname, 'cmd', cmd, 'roles', roles::text[],
    'qual', qual, 'with_check', with_check)), '[]'::jsonb)
  INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'global_churches';

  SELECT jsonb_build_object('enabled', relrowsecurity, 'forced', relforcerowsecurity)
  INTO v_rls
  FROM pg_class WHERE oid = 'public.global_churches'::regclass;

  SELECT reloptions INTO v_view_options
  FROM pg_class WHERE oid = 'api.public_church_directory'::regclass;

  RETURN jsonb_build_object(
    'checked_at', now(),
    'counts', jsonb_build_object(
      'base_table', jsonb_build_object('rows', v_base_count, 'error', v_base_err),
      'definer_function', jsonb_build_object('rows', v_fn_count, 'error', v_fn_err),
      'view', jsonb_build_object('rows', v_view_count, 'error', v_view_err)
    ),
    'grants', jsonb_build_object(
      'api_schema_usage', jsonb_build_object(
        'anon', has_schema_privilege('anon', 'api', 'USAGE'),
        'authenticated', has_schema_privilege('authenticated', 'api', 'USAGE')
      ),
      'view_select', jsonb_build_object(
        'anon', has_table_privilege('anon', 'api.public_church_directory', 'SELECT'),
        'authenticated', has_table_privilege('authenticated', 'api.public_church_directory', 'SELECT')
      ),
      'function_execute', jsonb_build_object(
        'anon', has_function_privilege('anon', 'api.get_public_church_directory()', 'EXECUTE'),
        'authenticated', has_function_privilege('authenticated', 'api.get_public_church_directory()', 'EXECUTE')
      ),
      'base_table_select', jsonb_build_object(
        'anon', has_table_privilege('anon', 'public.global_churches', 'SELECT'),
        'authenticated', has_table_privilege('authenticated', 'public.global_churches', 'SELECT')
      )
    ),
    'rls', jsonb_build_object(
      'global_churches', v_rls,
      'policies', v_policies
    ),
    'view_options', to_jsonb(coalesce(v_view_options, '{}'::text[]))
  );
END;
$$;

REVOKE ALL ON FUNCTION public.diagnose_church_directory() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.diagnose_church_directory() TO service_role;
