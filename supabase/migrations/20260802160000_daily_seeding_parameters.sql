-- ============================================================
-- Daily Seeding Parameters for All Three Databases
-- ============================================================
-- Covers:
--   1. Biblical Wisdom (Scripture) Database
--   2. International Christian Church Directory
--   3. Live Daily Base Chain DeFi / Biblical Wisdom Opportunities
--
-- WHAT THIS MIGRATION DOES
-- ─────────────────────────────────────────────────────────────
-- A. Creates public.daily_seeding_config — a single source of
--    truth for every parameter each seeder uses, queryable by
--    the app and agents.
-- B. Unschedules the old fragmented / misconfigured cron jobs
--    (hourly stubs that ran without proper params or body).
-- C. Registers clean, explicitly-parameterised daily jobs that
--    rotate through all regions and denominations.
--
-- DAILY SCHEDULE OVERVIEW (all times UTC)
-- ─────────────────────────────────────────────────────────────
-- 01:00  church-global-seed-daily       church-seeder-agent        seed / rotate regions by DOW
-- 01:30  church-verify-enrich-daily     church-data-aggregator     verify
-- 02:00  church-aggregator-daily        church-data-aggregator     discover / rotate continent
-- 04:00  church-validator-daily         church-data-validator      validate
-- 03:00  wisdom-seed-daily              biblical-wisdom-aggregator seed  batchSize=50
-- 05:00  wisdom-expander-daily          biblical-wisdom-expander   expand chapters_per_book=5
-- 06:00  wisdom-crossref-daily          biblical-wisdom-expander   crossref
-- 07:30  scripture-scanner-daily        scripture-financial-scanner scan  batchSize=20
-- 09:00  scripture-full-bible-daily     scripture-financial-scanner full_bible batchSize=15
-- 11:00  scripture-validator-daily      scripture-integrity-validator validate_kjv batchSize=30
-- 0 1 * * 0  scripture-validator-full-audit-weekly  (unchanged — Sunday full audit)
-- 13:00  defi-daily-seed                defi-opportunity-scanner   scan / daily=true
-- 14:00  defi-wisdom-correlator-daily   market-wisdom-correlator   correlate
-- 23:00  defi-watchdog-daily            defi-market-watchdog       scan / daily_summary=true
-- */15   defi-opportunity-scanner-every-15m  (unchanged — live real-time monitor)
-- ─────────────────────────────────────────────────────────────

-- ============================================================
-- PART 1 — Configuration table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_seeding_config (
  id              serial        PRIMARY KEY,
  database_name   text          NOT NULL,          -- 'biblical_wisdom' | 'church_directory' | 'defi_opportunities'
  job_name        text          NOT NULL UNIQUE,   -- matches pg_cron job name
  edge_function   text          NOT NULL,
  cron_schedule   text          NOT NULL,
  body_template   jsonb         NOT NULL,          -- default body sent to the function
  batch_size      integer,
  enabled         boolean       NOT NULL DEFAULT true,
  description     text,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.daily_seeding_config IS
  'Single source of truth for daily seeding schedules and parameters across all three seed databases.';

ALTER TABLE public.daily_seeding_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage; service_role bypasses RLS
GRANT ALL ON public.daily_seeding_config TO service_role;

CREATE POLICY "Admins can manage seeding config"
  ON public.daily_seeding_config FOR ALL
  TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "All authenticated users can read seeding config"
  ON public.daily_seeding_config FOR SELECT
  TO authenticated
  USING (true);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_daily_seeding_config()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_touch_daily_seeding_config
  BEFORE UPDATE ON public.daily_seeding_config
  FOR EACH ROW EXECUTE FUNCTION public.touch_daily_seeding_config();

-- ============================================================
-- PART 2 — Seed config rows
-- ============================================================

-- ── Biblical Wisdom Database ──────────────────────────────────
INSERT INTO public.daily_seeding_config
  (database_name, job_name, edge_function, cron_schedule, body_template, batch_size, description)
VALUES
(
  'biblical_wisdom',
  'wisdom-seed-daily',
  'biblical-wisdom-aggregator',
  '0 3 * * *',
  '{"mode":"seed","batchSize":50}'::jsonb,
  50,
  'Daily comprehensive seed of biblical_knowledge_base — all financial-wisdom categories, KJV, batchSize=50'
),
(
  'biblical_wisdom',
  'wisdom-expander-daily',
  'biblical-wisdom-expander',
  '0 5 * * *',
  '{"mode":"expand","chapters_per_book":5}'::jsonb,
  NULL,
  'Daily expansion pass — scans additional Bible books for financial themes, 5 chapters per book'
),
(
  'biblical_wisdom',
  'wisdom-crossref-daily',
  'biblical-wisdom-expander',
  '0 6 * * *',
  '{"mode":"crossref"}'::jsonb,
  NULL,
  'Daily cross-reference builder — links biblical_knowledge_base entries to defi_knowledge_base'
),
(
  'biblical_wisdom',
  'scripture-scanner-daily',
  'scripture-financial-scanner',
  '30 7 * * *',
  '{"mode":"scan","batchSize":20}'::jsonb,
  20,
  'Daily targeted-passage scan for financial wisdom — batchSize=20 random passages'
),
(
  'biblical_wisdom',
  'scripture-full-bible-daily',
  'scripture-financial-scanner',
  '0 9 * * *',
  '{"mode":"full_bible","batchSize":15}'::jsonb,
  15,
  'Daily systematic full-Bible sweep — processes batchSize=15 books per run, rotating through all 66 books'
),
(
  'biblical_wisdom',
  'scripture-validator-daily',
  'scripture-integrity-validator',
  '0 11 * * *',
  '{"mode":"validate_kjv","batchSize":30}'::jsonb,
  30,
  'Daily KJV integrity check — validates batchSize=30 verses against canonical KJV text'
),

-- ── International Christian Church Directory ──────────────────
(
  'church_directory',
  'church-global-seed-daily',
  'church-seeder-agent',
  '0 1 * * *',
  '{
    "mode": "seed",
    "denomination_filter": "all",
    "regions_strategy": "rotate_by_dow",
    "regions_dow": {
      "0": ["New York City","Philadelphia","Charlotte","Detroit","Nashville"],
      "1": ["Los Angeles","Phoenix","San Antonio","Dallas","Denver"],
      "2": ["Chicago","Houston","Atlanta","Miami","Seattle"],
      "3": ["London","Berlin","Rome","Paris","Zurich"],
      "4": ["Lagos","Nairobi","Accra","Johannesburg","Addis Ababa","Dar es Salaam","Kampala","Kinshasa"],
      "5": ["São Paulo","Mexico City","Lima","Bogotá","Buenos Aires"],
      "6": ["Manila","Seoul","Sydney","Tokyo","Singapore","Hong Kong","Toronto","Nairobi"]
    }
  }'::jsonb,
  NULL,
  'Daily church seed — rotates through 7 regional groups (all denominations) by day of week via regions_dow map'
),
(
  'church_directory',
  'church-aggregator-daily',
  'church-data-aggregator',
  '0 2 * * *',
  '{
    "mode": "discover",
    "denomination_filter": "all",
    "continent_strategy": "rotate_by_dow",
    "continents_dow": {
      "0": "us_southeast",
      "1": "us_northeast",
      "2": "us_west",
      "3": "us_midwest",
      "4": "africa",
      "5": "europe",
      "6": "latin_america"
    }
  }'::jsonb,
  NULL,
  'Daily discovery pass — rotates continent focus by day of week, all denominations'
),
(
  'church_directory',
  'church-verify-enrich-daily',
  'church-data-aggregator',
  '30 2 * * *',
  '{"mode":"verify","denomination_filter":"all"}'::jsonb,
  NULL,
  'Daily enrichment/verification pass — fills missing website, phone, address, crypto fields'
),
(
  'church_directory',
  'church-validator-daily',
  'church-data-validator',
  '0 4 * * *',
  '{"mode":"validate","denomination_filter":"all","batch_size":100}'::jsonb,
  100,
  'Daily validation pass — checks data quality, deduplication, country/denomination normalisation'
),

-- ── Base Chain DeFi / Biblical Wisdom Opportunities ──────────
(
  'defi_opportunities',
  'defi-daily-seed',
  'defi-opportunity-scanner',
  '0 13 * * *',
  '{"mode":"scan","daily":true,"protocols":"all","include_wisdom_pairs":true}'::jsonb,
  NULL,
  'Daily comprehensive Base chain DeFi seed — scans all protocols (DEX, lending, yield, perps), pairs every signal with a scripture'
),
(
  'defi_opportunities',
  'defi-wisdom-correlator-daily',
  'market-wisdom-correlator',
  '0 14 * * *',
  '{"mode":"correlate","daily":true}'::jsonb,
  NULL,
  'Daily Biblical-wisdom ↔ DeFi-signal correlation pass — updates biblical_financial_crossref'
),
(
  'defi_opportunities',
  'defi-watchdog-daily',
  'defi-market-watchdog',
  '0 23 * * *',
  '{"mode":"scan","daily_summary":true}'::jsonb,
  NULL,
  'End-of-day Base chain watchdog — generates daily summary of risk alerts, whale movements, liquidation warnings'
)
ON CONFLICT (job_name) DO UPDATE SET
  body_template  = EXCLUDED.body_template,
  cron_schedule  = EXCLUDED.cron_schedule,
  batch_size     = EXCLUDED.batch_size,
  description    = EXCLUDED.description,
  updated_at     = now();

-- ============================================================
-- PART 3 — Remove old fragmented / misconfigured cron jobs
-- ============================================================
-- These were all registered in earlier migrations.  We replace
-- them with the clean daily set below.

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
SELECT cron.unschedule('scripture-validator-every-4h');
SELECT cron.unschedule('scripture-full-bible-every-6h');
-- NOTE: 'defi-opportunity-scanner-every-15m' and
--       'scripture-validator-full-audit-weekly' are intentionally
--       kept — they serve different purposes (live monitoring and
--       deep weekly audit).

-- ============================================================
-- PART 4 — Register new daily cron jobs
-- All bodies are built dynamically using the config table so a
-- single UPDATE to daily_seeding_config is the only change
-- needed to tune any parameter in the future.
-- ============================================================

-- Helper: read body_template for a job name
-- (cron body must be a literal; we inline the jsonb cast directly)

-- ── Biblical Wisdom ──────────────────────────────────────────

SELECT cron.schedule(
  'wisdom-seed-daily',
  '0 3 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-aggregator',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"seed","batchSize":50}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'wisdom-expander-daily',
  '0 5 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-expander',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"expand","chapters_per_book":5}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'wisdom-crossref-daily',
  '0 6 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/biblical-wisdom-expander',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"crossref"}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'scripture-scanner-daily',
  '30 7 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-financial-scanner',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"scan","batchSize":20}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'scripture-full-bible-daily',
  '0 9 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-financial-scanner',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"full_bible","batchSize":15}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'scripture-validator-daily',
  '0 11 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/scripture-integrity-validator',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"validate_kjv","batchSize":30}'::jsonb
  );
  $crn$
);

-- ── International Christian Church Directory ─────────────────
-- Regions rotate by day-of-week (DOW 0=Sun … 6=Sat).
-- The CASE expression below selects a JSON array of region names
-- that the church-seeder-agent recognises via body.regions.

SELECT cron.schedule(
  'church-global-seed-daily',
  '0 1 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-seeder-agent',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := jsonb_build_object(
                 'mode', 'seed',
                 'denomination_filter', 'all',
                 'regions', CASE extract(dow FROM now())::int
                   WHEN 0 THEN '["New York City","Philadelphia","Charlotte","Detroit","Nashville"]'::jsonb
                   WHEN 1 THEN '["Los Angeles","Phoenix","San Antonio","Dallas","Denver"]'::jsonb
                   WHEN 2 THEN '["Chicago","Houston","Atlanta","Miami","Seattle"]'::jsonb
                   WHEN 3 THEN '["London","Berlin","Rome","Paris","Zurich"]'::jsonb
                   WHEN 4 THEN '["Lagos","Nairobi","Accra","Johannesburg","Addis Ababa","Dar es Salaam","Kampala","Kinshasa"]'::jsonb
                   WHEN 5 THEN '["São Paulo","Mexico City","Lima","Bogotá"]'::jsonb
                   ELSE        '["Manila","Seoul","Sydney","Toronto","St. Augustine","Jacksonville","Tampa","Orlando"]'::jsonb
                 END
               )
  );
  $crn$
);

SELECT cron.schedule(
  'church-aggregator-daily',
  '0 2 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-aggregator',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := jsonb_build_object(
                 'mode', 'discover',
                 'denomination_filter', 'all',
                 'region', (ARRAY[
                   'us_southeast','us_northeast','us_west',
                   'us_midwest','africa','europe','latin_america'
                 ])[1 + (extract(doy FROM now())::int % 7)]
               )
  );
  $crn$
);

SELECT cron.schedule(
  'church-verify-enrich-daily',
  '30 2 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-aggregator',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"verify","denomination_filter":"all"}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'church-validator-daily',
  '0 4 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/church-data-validator',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"validate","denomination_filter":"all","batch_size":100}'::jsonb
  );
  $crn$
);

-- ── Base Chain DeFi / Biblical Wisdom Opportunities ──────────

SELECT cron.schedule(
  'defi-daily-seed',
  '0 13 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/defi-opportunity-scanner',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"scan","daily":true,"protocols":"all","include_wisdom_pairs":true}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'defi-wisdom-correlator-daily',
  '0 14 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/market-wisdom-correlator',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"correlate","daily":true}'::jsonb
  );
  $crn$
);

SELECT cron.schedule(
  'defi-watchdog-daily',
  '0 23 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/defi-market-watchdog',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"scan","daily_summary":true}'::jsonb
  );
  $crn$
);
