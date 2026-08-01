CREATE TABLE IF NOT EXISTS public.mcp_rate_limits (
  bucket_key text NOT NULL,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);

GRANT ALL ON public.mcp_rate_limits TO service_role;

ALTER TABLE public.mcp_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_mcp_rate_limit(p_key text, p_max integer DEFAULT 30, p_window_seconds integer DEFAULT 60)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_count integer;
BEGIN
  v_window := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);

  INSERT INTO public.mcp_rate_limits (bucket_key, window_start, request_count)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET request_count = public.mcp_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  DELETE FROM public.mcp_rate_limits
  WHERE window_start < now() - (p_window_seconds * 10) * interval '1 second';

  RETURN jsonb_build_object(
    'allowed', v_count <= p_max,
    'count', v_count,
    'limit', p_max,
    'retry_after', GREATEST(1, CEIL(extract(epoch FROM (v_window + (p_window_seconds * interval '1 second')) - now()))::int)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_mcp_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_mcp_rate_limit(text, integer, integer) TO service_role;