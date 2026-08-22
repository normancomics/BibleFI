-- 1. Register a rotating vault-managed secret for the sovereign agent cron jobs
INSERT INTO public.cron_job_secrets (job_name, vault_secret_name, grace_seconds, current_hash)
VALUES ('agent-ops', 'AGENT_OPS_CRON_SECRET', 7200, 'pending-rotation')
ON CONFLICT (job_name) DO NOTHING;

SELECT public.rotate_cron_job_secret('agent-ops');

-- 2. Security-definer validator the agent edge functions call (hash comparison, never returns the secret)
CREATE OR REPLACE FUNCTION public.validate_agent_cron_secret(p_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
  SELECT public.validate_cron_job_secret('agent-ops', p_secret);
$$;

REVOKE ALL ON FUNCTION public.validate_agent_cron_secret(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_agent_cron_secret(text) TO service_role;

-- 3. Point every agent schedule at the new vault secret
DO $$
DECLARE
  j record;
BEGIN
  FOR j IN
    SELECT jobid, jobname, command
    FROM cron.job
    WHERE command LIKE '%''CRON_SECRET''%'
  LOOP
    PERFORM cron.alter_job(
      j.jobid,
      command => replace(j.command, '''CRON_SECRET''', '''AGENT_OPS_CRON_SECRET''')
    );
  END LOOP;
END $$;

-- 4. Restore correct seeding frequencies
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'scripture-full-bible-every-6h'), schedule => '40 * * * *');
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'scripture-scanner-every-2h'),    schedule => '0 */2 * * *');
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'wisdom-expander-every-3h'),      schedule => '20 */3 * * *');
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'church-seeder-every-4h'),        schedule => '10 * * * *');
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'church-aggregator-daily'),       schedule => '0 * * * *');

-- 5. Larger scripture batch per hourly run so full-Bible coverage progresses faster
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'scripture-full-bible-every-6h'),
  command => replace(
    (SELECT command FROM cron.job WHERE jobname = 'scripture-full-bible-every-6h'),
    '"batchSize": 5', '"batchSize": 20'
  )
);