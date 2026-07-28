-- Client-side error capture for beta.
--
-- The app had NO error monitoring: a throw in any route produced a white
-- screen with nothing recorded anywhere. This gives beta visibility using the
-- Supabase project already in place (no third-party account required).
--
-- Writes go through api.log_client_error (SECURITY DEFINER) so anonymous
-- visitors can report crashes without any table grants. Reads are admin-only.

CREATE TABLE IF NOT EXISTS public.client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- 'react' (boundary), 'unhandledrejection', 'window.onerror', 'manual'
  source text NOT NULL,
  severity text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  component_stack text,
  route text,
  user_agent text,
  release text,
  -- stable hash of message+top stack frame, for grouping duplicates
  fingerprint text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_client_errors_created
  ON public.client_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_errors_fingerprint
  ON public.client_error_logs (fingerprint, created_at DESC);

ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.client_error_logs FROM anon, authenticated;

CREATE POLICY "Admins can read client error logs"
  ON public.client_error_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.client_error_logs TO authenticated;

-- Anonymous-callable reporter. All inputs are truncated so a crash loop can't
-- bloat the table, and the function never raises (an error reporter that
-- throws is worse than no reporter).
CREATE OR REPLACE FUNCTION api.log_client_error(
  p_source text,
  p_message text,
  p_severity text DEFAULT 'error',
  p_stack text DEFAULT NULL,
  p_component_stack text DEFAULT NULL,
  p_route text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_release text DEFAULT NULL,
  p_fingerprint text DEFAULT NULL,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.client_error_logs
    (source, severity, message, stack, component_stack, route,
     user_agent, release, fingerprint, context)
  VALUES (
    left(coalesce(p_source, 'unknown'), 40),
    left(coalesce(p_severity, 'error'), 20),
    left(coalesce(p_message, '(no message)'), 2000),
    left(p_stack, 8000),
    left(p_component_stack, 8000),
    left(p_route, 300),
    left(p_user_agent, 400),
    left(p_release, 100),
    left(p_fingerprint, 64),
    CASE WHEN pg_column_size(coalesce(p_context, '{}'::jsonb)) > 8192
         THEN '{}'::jsonb ELSE coalesce(p_context, '{}'::jsonb) END
  );
EXCEPTION WHEN OTHERS THEN
  -- Never let telemetry break the caller.
  NULL;
END;
$$;

REVOKE ALL ON FUNCTION api.log_client_error(text, text, text, text, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.log_client_error(text, text, text, text, text, text, text, text, text, jsonb) TO anon, authenticated, service_role;

-- Admin triage view: most frequent recent crashes, grouped.
CREATE OR REPLACE FUNCTION public.client_error_summary(p_hours integer DEFAULT 24)
RETURNS TABLE (
  fingerprint text,
  occurrences bigint,
  first_seen timestamptz,
  last_seen timestamptz,
  message text,
  route text,
  source text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT e.fingerprint,
         count(*) AS occurrences,
         min(e.created_at) AS first_seen,
         max(e.created_at) AS last_seen,
         (array_agg(e.message ORDER BY e.created_at DESC))[1] AS message,
         (array_agg(e.route ORDER BY e.created_at DESC))[1] AS route,
         (array_agg(e.source ORDER BY e.created_at DESC))[1] AS source
  FROM public.client_error_logs e
  WHERE e.created_at > now() - make_interval(hours => p_hours)
  GROUP BY e.fingerprint
  ORDER BY count(*) DESC;
$$;

REVOKE ALL ON FUNCTION public.client_error_summary(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.client_error_summary(integer) TO authenticated, service_role;

-- Keep the table bounded (beta noise shouldn't accumulate forever).
DO $$
BEGIN
  PERFORM cron.unschedule('client-error-log-cleanup');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'client-error-log-cleanup',
  '15 4 * * *',
  $JOB$DELETE FROM public.client_error_logs WHERE created_at < now() - interval '30 days';$JOB$
);
