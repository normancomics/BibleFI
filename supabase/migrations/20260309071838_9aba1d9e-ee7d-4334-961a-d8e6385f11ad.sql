
-- Scripture Integrity Validator: Every 4 hours
SELECT cron.schedule(
  'scripture-validator-every-4h',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-integrity-validator',
    headers:=jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)),
    body:='{"mode": "validate_kjv", "batchSize": 20}'::jsonb
  ) as request_id;
  $$
);

-- Scripture Integrity Validator: Full audit weekly (Sundays 1 AM UTC)
SELECT cron.schedule(
  'scripture-validator-full-audit-weekly',
  '0 1 * * 0',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-integrity-validator',
    headers:=jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)),
    body:='{"mode": "full_audit", "batchSize": 50}'::jsonb
  ) as request_id;
  $$
);

-- DeFi Opportunity Scanner: Every 15 minutes (live market monitoring)
SELECT cron.schedule(
  'defi-opportunity-scanner-every-15m',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/defi-opportunity-scanner',
    headers:=jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)),
    body:='{"mode": "scan"}'::jsonb
  ) as request_id;
  $$
);

-- Scripture Financial Scanner: Full Bible mode every 6 hours
SELECT cron.schedule(
  'scripture-full-bible-every-6h',
  '30 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-financial-scanner',
    headers:=jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)),
    body:='{"mode": "full_bible", "batchSize": 5}'::jsonb
  ) as request_id;
  $$
);
