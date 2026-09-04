SELECT cron.schedule(
  'strongs-concordance-weekly',
  '20 3 * * 1',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/strongs-concordance-seeder',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='AGENT_OPS_CRON_SECRET' LIMIT 1)),
    body:='{"limit":8000}'::jsonb
  );
  $$
);