-- Palantir Foundry / AIP / Ontology Integration
-- ─────────────────────────────────────────────
-- Creates the database infrastructure that supports:
--   1. `foundry_sync_config`      — per-database sync watermarks and stats
--   2. `foundry_ontology_objects` — local shadow of objects pushed to Foundry
--   3. `foundry_action_log`       — audit trail for every AIP action call
-- Also adds ML-score columns to bwtya_opportunity_scores and registers
-- the palantir-foundry-sync edge function in pg_cron.

-- ============================================================
-- 1. foundry_sync_config
-- ============================================================
-- Tracks the last successful sync timestamp per database so the
-- palantir-foundry-sync edge function can do incremental pushes.

CREATE TABLE IF NOT EXISTS public.foundry_sync_config (
  id               serial        PRIMARY KEY,
  database_name    text          NOT NULL UNIQUE,   -- 'biblical_wisdom' | 'church_directory' | 'defi_opportunities' | 'bwtya_scores' | 'agent_runs'
  last_synced_at   timestamptz,
  rows_synced      integer       NOT NULL DEFAULT 0,
  errors_last_run  text[],
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.foundry_sync_config IS
  'Per-database sync watermarks for the Palantir Foundry bidirectional sync service.';

ALTER TABLE public.foundry_sync_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.foundry_sync_config TO service_role;

CREATE POLICY "Admins manage foundry sync config"
  ON public.foundry_sync_config FOR ALL TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed default config rows
INSERT INTO public.foundry_sync_config (database_name)
VALUES
  ('biblical_wisdom'),
  ('church_directory'),
  ('defi_opportunities'),
  ('bwtya_scores'),
  ('agent_runs')
ON CONFLICT (database_name) DO NOTHING;

-- ============================================================
-- 2. foundry_ontology_objects
-- ============================================================
-- Local shadow table tracking which objects have been synced to
-- Foundry and their current state.  Enables change-data-capture
-- without relying solely on updated_at watermarks.

CREATE TABLE IF NOT EXISTS public.foundry_ontology_objects (
  id             uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  object_type    text          NOT NULL,  -- e.g. 'biblefi.Scripture'
  primary_key    text          NOT NULL,  -- Foundry object primary key
  source_table   text          NOT NULL,  -- Supabase source table
  source_id      text          NOT NULL,  -- Source row identifier
  sha256         text,                    -- Hash of last-synced payload (for change detection)
  last_synced_at timestamptz,
  sync_status    text          NOT NULL DEFAULT 'pending',  -- pending | synced | error
  error_message  text,
  created_at     timestamptz   NOT NULL DEFAULT now(),
  updated_at     timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (object_type, primary_key)
);

COMMENT ON TABLE public.foundry_ontology_objects IS
  'Shadow tracking of objects pushed to the Palantir Foundry ontology.';

CREATE INDEX IF NOT EXISTS idx_foundry_objects_type_status
  ON public.foundry_ontology_objects (object_type, sync_status);
CREATE INDEX IF NOT EXISTS idx_foundry_objects_source
  ON public.foundry_ontology_objects (source_table, source_id);

ALTER TABLE public.foundry_ontology_objects ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.foundry_ontology_objects TO service_role;

-- ============================================================
-- 3. foundry_action_log
-- ============================================================
-- Audit trail for every Palantir AIP action called, including
-- sync runs, BWSP synthesis enhancements, and BWTYA ML scores.

CREATE TABLE IF NOT EXISTS public.foundry_action_log (
  id             uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type    text          NOT NULL,  -- 'sync_full' | 'sync_push' | 'sync_pull' | 'bwsp_synthesize' | 'bwtya_score_batch' | 'crossref' | 'anchor_triple_check'
  triggered_by   text          NOT NULL DEFAULT 'cron',  -- 'cron' | 'user' | 'agent'
  wallet_address text,
  bwsp_query_id  uuid          REFERENCES public.bwsp_query_log(id) ON DELETE SET NULL,
  results        jsonb,
  status         text          NOT NULL DEFAULT 'pending',  -- pending | success | error
  error_message  text,
  foundry_model_version text,
  aip_confidence numeric(5,4), -- 0.0000–1.0000
  processing_ms  integer,
  executed_at    timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.foundry_action_log IS
  'Audit trail of all Palantir Foundry AIP action calls from BibleFI.';

CREATE INDEX IF NOT EXISTS idx_foundry_action_log_type_status
  ON public.foundry_action_log (action_type, status, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_foundry_action_log_wallet
  ON public.foundry_action_log (wallet_address, executed_at DESC)
  WHERE wallet_address IS NOT NULL;

ALTER TABLE public.foundry_action_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.foundry_action_log TO service_role;

-- Users can read their own action logs
CREATE POLICY "Users read own foundry action logs"
  ON public.foundry_action_log FOR SELECT TO authenticated
  USING (wallet_address IS NULL OR auth.uid()::text = wallet_address);

-- Admins can read all
CREATE POLICY "Admins read all foundry action logs"
  ON public.foundry_action_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 4. ML-score columns on bwtya_opportunity_scores
-- ============================================================
-- These columns receive values from the Foundry PULL sync:
-- palantir-foundry-sync edge function writes mlEnhancedScore
-- and mlConfidence back after calling BWTYAScoreBatch AIP action.

ALTER TABLE public.bwtya_opportunity_scores
  ADD COLUMN IF NOT EXISTS ml_enhanced_score  numeric(6,2),  -- 0.00–100.00
  ADD COLUMN IF NOT EXISTS ml_confidence      numeric(5,4),  -- 0.0000–1.0000
  ADD COLUMN IF NOT EXISTS ml_synced_at       timestamptz;

COMMENT ON COLUMN public.bwtya_opportunity_scores.ml_enhanced_score IS
  'ML-enhanced BWTYA score from Palantir Foundry BWTYAScoreBatch AIP action (0–100).';
COMMENT ON COLUMN public.bwtya_opportunity_scores.ml_confidence IS
  'Confidence of the Foundry ML model output (0–1).';
COMMENT ON COLUMN public.bwtya_opportunity_scores.ml_synced_at IS
  'Timestamp when the ML score was last pulled from Palantir Foundry.';

-- ============================================================
-- 5. Register palantir-foundry-sync in agent_ops
-- ============================================================

INSERT INTO agent_ops.agent_permissions (
  agent_name,
  allowed_tables,
  allowed_operations,
  rate_limit_per_hour,
  is_active
)
VALUES (
  'palantir-foundry-sync',
  ARRAY[
    'biblical_knowledge_base', 'comprehensive_biblical_texts',
    'defi_knowledge_base', 'biblical_financial_crossref',
    'bwtya_opportunity_scores', 'bwsp_query_log',
    'global_churches', 'foundry_sync_config',
    'foundry_ontology_objects', 'foundry_action_log'
  ],
  ARRAY['READ', 'INSERT', 'UPDATE'],
  120,
  true
)
ON CONFLICT (agent_name) DO UPDATE SET
  allowed_tables       = EXCLUDED.allowed_tables,
  allowed_operations   = EXCLUDED.allowed_operations,
  rate_limit_per_hour  = EXCLUDED.rate_limit_per_hour,
  is_active            = true;

-- ============================================================
-- 6. pg_cron jobs for Palantir Foundry sync
-- ============================================================

-- Daily full bidirectional sync at 08:00 UTC (after all seeding jobs complete)
SELECT cron.schedule(
  'foundry-full-sync-daily',
  '0 8 * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/palantir-foundry-sync',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"full"}'::jsonb
  );
  $crn$
);

-- Incremental push every 15 min for near-real-time agent telemetry in Foundry
SELECT cron.schedule(
  'foundry-incremental-push-15m',
  '*/15 * * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/palantir-foundry-sync',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"push"}'::jsonb
  );
  $crn$
);

-- Pull ML scores from Foundry hourly (after BWTYA score batch runs)
SELECT cron.schedule(
  'foundry-ml-pull-hourly',
  '45 * * * *',
  $crn$
  SELECT net.http_post(
    url     := 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/palantir-foundry-sync',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', (SELECT decrypted_secret
                                   FROM vault.decrypted_secrets
                                   WHERE name = 'CRON_SECRET' LIMIT 1)
               ),
    body    := '{"mode":"pull"}'::jsonb
  );
  $crn$
);
