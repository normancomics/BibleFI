-- Fixed-window rate limiting for edge functions (talent-score, basescan-history).
-- Edge functions call public.check_edge_rate_limit via the service role client;
-- the counter upsert is atomic so concurrent requests are counted correctly.

CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  bucket_key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.edge_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_edge_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_now timestamptz := now();
  v_count integer;
  v_start timestamptz;
BEGIN
  INSERT INTO public.edge_rate_limits AS r (bucket_key, window_start, request_count)
  VALUES (p_key, v_now, 1)
  ON CONFLICT (bucket_key) DO UPDATE SET
    request_count = CASE
      WHEN r.window_start < v_now - make_interval(secs => p_window_seconds) THEN 1
      ELSE r.request_count + 1 END,
    window_start = CASE
      WHEN r.window_start < v_now - make_interval(secs => p_window_seconds) THEN v_now
      ELSE r.window_start END
  RETURNING request_count, window_start INTO v_count, v_start;

  RETURN jsonb_build_object(
    'allowed', v_count <= p_max,
    'remaining', greatest(p_max - v_count, 0),
    'retry_after', CASE
      WHEN v_count <= p_max THEN 0
      ELSE ceil(extract(epoch FROM (v_start + make_interval(secs => p_window_seconds) - v_now)))::integer
    END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_edge_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_edge_rate_limit(text, integer, integer) TO service_role;

-- Prune stale buckets daily so the table stays tiny.
DO $$
BEGIN
  PERFORM cron.unschedule('edge-rate-limit-cleanup');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'edge-rate-limit-cleanup',
  '30 4 * * *',
  $JOB$DELETE FROM public.edge_rate_limits WHERE window_start < now() - interval '2 days';$JOB$
);
