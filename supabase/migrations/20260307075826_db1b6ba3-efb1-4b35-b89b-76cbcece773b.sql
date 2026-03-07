-- Schedule Scripture Financial Scanner: every 2 hours
SELECT cron.schedule(
  'scripture-scanner-every-2h',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-financial-scanner',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"scan","batchSize":15}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule Church Data Validator: every 6 hours (validate)
SELECT cron.schedule(
  'church-validator-every-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-validator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"validate","batchSize":50}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule Church Seeder: daily at 5 AM UTC
SELECT cron.schedule(
  'church-seeder-daily',
  '0 5 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-validator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"seed"}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule DeFi Market Watchdog: every 30 minutes
SELECT cron.schedule(
  'defi-watchdog-every-30m',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/defi-market-watchdog',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"scan"}'::jsonb
  ) AS request_id;
  $$
);