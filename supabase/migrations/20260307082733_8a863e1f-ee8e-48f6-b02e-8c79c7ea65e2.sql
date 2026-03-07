
-- Schedule biblical-wisdom-expander: expand knowledge every 3 hours
SELECT cron.schedule(
  'wisdom-expander-every-3h',
  '0 */3 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-expander',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"expand"}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule crossref builder: daily at 6 AM UTC
SELECT cron.schedule(
  'wisdom-crossref-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-expander',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"crossref"}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule church seeder: every 4 hours
SELECT cron.schedule(
  'church-seeder-every-4h',
  '30 */4 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-seeder-agent',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"seed"}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule church data verification: daily at 7 AM UTC
SELECT cron.schedule(
  'church-seeder-verify-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-seeder-agent',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"verify"}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule market-wisdom-correlator: every 45 minutes
SELECT cron.schedule(
  'market-correlator-every-45m',
  '*/45 * * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/market-wisdom-correlator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"correlate"}'::jsonb
  ) AS request_id;
  $$
);
