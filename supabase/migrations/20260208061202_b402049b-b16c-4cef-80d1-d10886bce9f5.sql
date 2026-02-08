
-- Daily church aggregator: rotates through 8 regions based on day-of-year
SELECT cron.schedule(
  'church-aggregator-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-aggregator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:=concat('{"mode":"discover","region":"', (ARRAY['us_southeast','us_northeast','us_west','us_midwest','us_south','africa','europe','latin_america'])[1 + (extract(doy from now())::int % 8)], '"}')::jsonb
  ) AS request_id;
  $$
);

-- Daily church verifier + enricher at 4 AM UTC
SELECT cron.schedule(
  'church-verify-enrich-daily',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-aggregator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"verify"}'::jsonb
  ) AS request_id;
  $$
);

-- Weekly biblical wisdom aggregator: Sundays at 2 AM UTC
SELECT cron.schedule(
  'biblical-wisdom-weekly',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url:='https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-aggregator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU"}'::jsonb,
    body:='{"mode":"seed"}'::jsonb
  ) AS request_id;
  $$
);
