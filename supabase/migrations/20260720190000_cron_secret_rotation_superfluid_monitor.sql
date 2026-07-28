-- Automated rotating cron secret for the superfluid-stream-monitor job.
--
-- Instead of the static shared CRON_SECRET, this job gets its own vault secret
-- (SUPERFLUID_MONITOR_CRON_SECRET) that is rotated automatically every week by
-- pg_cron. The edge function validates the presented secret against sha256
-- hashes stored in public.cron_job_secrets; the previous secret stays valid for
-- a short grace window so in-flight/racing runs never fail during a rotation.

CREATE TABLE IF NOT EXISTS public.cron_job_secrets (
  job_name text PRIMARY KEY,
  vault_secret_name text NOT NULL UNIQUE,
  current_hash text NOT NULL,
  previous_hash text,
  rotated_at timestamptz NOT NULL DEFAULT now(),
  grace_seconds integer NOT NULL DEFAULT 7200
);

-- Service role / SECURITY DEFINER access only: RLS on, no policies.
ALTER TABLE public.cron_job_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cron_job_secrets FROM anon, authenticated;

-- Rotate: generate a fresh 64-hex-char secret, store plaintext in Vault (read
-- by the pg_cron job when building the request header) and hashes here.
CREATE OR REPLACE FUNCTION public.rotate_cron_job_secret(p_job_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault, pg_catalog
AS $$
DECLARE
  v_secret text := encode(gen_random_bytes(32), 'hex');
  v_vault_name text;
  v_secret_id uuid;
BEGIN
  SELECT vault_secret_name INTO v_vault_name
  FROM public.cron_job_secrets WHERE job_name = p_job_name;
  IF v_vault_name IS NULL THEN
    RAISE EXCEPTION 'unknown cron job %', p_job_name;
  END IF;

  SELECT id INTO v_secret_id FROM vault.secrets WHERE name = v_vault_name;
  IF v_secret_id IS NULL THEN
    PERFORM vault.create_secret(v_secret, v_vault_name,
      'Rotating cron secret for ' || p_job_name || ' (managed by rotate_cron_job_secret)');
  ELSE
    PERFORM vault.update_secret(v_secret_id, v_secret);
  END IF;

  UPDATE public.cron_job_secrets
  SET previous_hash = current_hash,
      current_hash  = encode(digest(v_secret, 'sha256'), 'hex'),
      rotated_at    = now()
  WHERE job_name = p_job_name;
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_cron_job_secret(text) FROM PUBLIC, anon, authenticated;

-- Validation used by the edge function (service role only): current secret, or
-- previous secret while still inside the grace window.
CREATE OR REPLACE FUNCTION public.validate_cron_job_secret(p_job_name text, p_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cron_job_secrets s
    WHERE s.job_name = p_job_name
      AND (
        s.current_hash = encode(digest(p_secret, 'sha256'), 'hex')
        OR (
          s.previous_hash IS NOT NULL
          AND s.previous_hash = encode(digest(p_secret, 'sha256'), 'hex')
          AND now() < s.rotated_at + make_interval(secs => s.grace_seconds)
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.validate_cron_job_secret(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_cron_job_secret(text, text) TO service_role;

-- Register the job and mint its first secret.
INSERT INTO public.cron_job_secrets (job_name, vault_secret_name, current_hash)
VALUES ('superfluid-stream-monitor', 'SUPERFLUID_MONITOR_CRON_SECRET', 'uninitialized')
ON CONFLICT (job_name) DO NOTHING;

SELECT public.rotate_cron_job_secret('superfluid-stream-monitor');

-- Re-point the hourly monitor job at the rotating secret.
DO $$
BEGIN
  PERFORM cron.unschedule('superfluid-stream-monitor-hourly');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'superfluid-stream-monitor-hourly',
  '0 * * * *',
  $JOB$
  SELECT net.http_post(
    url := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/superfluid-stream-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPERFLUID_MONITOR_CRON_SECRET' LIMIT 1)
    ),
    body := jsonb_build_object('trigger','cron','at', now())
  ) AS request_id;
  $JOB$
);

-- Weekly automated rotation (Sunday 03:30 UTC, offset from the hourly run).
DO $$
BEGIN
  PERFORM cron.unschedule('rotate-superfluid-monitor-secret');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'rotate-superfluid-monitor-secret',
  '30 3 * * 0',
  $JOB$SELECT public.rotate_cron_job_secret('superfluid-stream-monitor');$JOB$
);
