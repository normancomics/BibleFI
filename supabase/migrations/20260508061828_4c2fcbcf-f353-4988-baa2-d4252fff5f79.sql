-- 1. Seed CRON_SECRET into vault (matches what we will set in edge-function env)
SELECT vault.create_secret('7a89aed61591b2a8018305762a8da32b3a6848396aa730b788d1c188dd22d419', 'CRON_SECRET', 'Shared secret used by pg_cron jobs to authenticate with sovereign-agent edge functions');

-- 2. Drop broken jobs
SELECT cron.unschedule('biblical-wisdom-weekly');
SELECT cron.unschedule('church-aggregator-daily');
SELECT cron.unschedule('church-seeder-daily');
SELECT cron.unschedule('church-seeder-every-4h');
SELECT cron.unschedule('church-seeder-verify-daily');
SELECT cron.unschedule('church-validator-every-6h');
SELECT cron.unschedule('church-verify-enrich-daily');
SELECT cron.unschedule('defi-watchdog-every-30m');
SELECT cron.unschedule('market-correlator-every-45m');
SELECT cron.unschedule('scripture-scanner-every-2h');
SELECT cron.unschedule('wisdom-crossref-daily');
SELECT cron.unschedule('wisdom-expander-every-3h');

-- 3. Re-schedule with x-cron-secret pulled from vault
SELECT cron.schedule('biblical-wisdom-weekly', '0 2 * * 0', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-aggregator',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"seed"}'::jsonb
  );
$crn$);

SELECT cron.schedule('church-aggregator-daily', '0 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-aggregator',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:=concat('{"mode":"discover","region":"', (ARRAY['us_southeast','us_northeast','us_west','us_midwest','us_south','africa','europe','latin_america'])[1 + (extract(doy from now())::int % 8)], '"}')::jsonb
  );
$crn$);

SELECT cron.schedule('church-seeder-daily', '45 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-seeder-agent',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"seed"}'::jsonb
  );
$crn$);

SELECT cron.schedule('church-seeder-every-4h', '10 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-seeder-agent',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"seed"}'::jsonb
  );
$crn$);

SELECT cron.schedule('church-seeder-verify-daily', '40 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-seeder-agent',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"verify"}'::jsonb
  );
$crn$);

SELECT cron.schedule('church-validator-every-6h', '15 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-validator',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"validate"}'::jsonb
  );
$crn$);

SELECT cron.schedule('church-verify-enrich-daily', '30 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-aggregator',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"verify"}'::jsonb
  );
$crn$);

SELECT cron.schedule('defi-watchdog-every-30m', '*/30 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/defi-market-watchdog',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"scan"}'::jsonb
  );
$crn$);

SELECT cron.schedule('market-correlator-every-45m', '*/45 * * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/market-wisdom-correlator',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"correlate"}'::jsonb
  );
$crn$);

SELECT cron.schedule('scripture-scanner-every-2h', '0 */2 * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-financial-scanner',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"scan","batchSize":15}'::jsonb
  );
$crn$);

SELECT cron.schedule('wisdom-crossref-daily', '0 6 * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-expander',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"crossref"}'::jsonb
  );
$crn$);

SELECT cron.schedule('wisdom-expander-every-3h', '0 */3 * * *', $crn$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-expander',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='CRON_SECRET' LIMIT 1)),
    body:='{"mode":"expand"}'::jsonb
  );
$crn$);
