-- Migration: align bwtya_opportunity_scores with the bwtya-swarm-orchestrator edge function
-- The original migration used 'protocol' but the edge function inserts 'protocol_name'.
-- Add missing dimension columns and a unique constraint on protocol_name.

-- 1. Add protocol_name as the canonical column (alias of protocol)
ALTER TABLE public.bwtya_opportunity_scores
  ADD COLUMN IF NOT EXISTS protocol_name TEXT;

-- Backfill protocol_name from protocol for existing rows
UPDATE public.bwtya_opportunity_scores
  SET protocol_name = protocol
  WHERE protocol_name IS NULL;

-- 2. Add missing BWTYA dimension score columns
ALTER TABLE public.bwtya_opportunity_scores
  ADD COLUMN IF NOT EXISTS fruit_bearing_score DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS faithfulness_score   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS transparency_score   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS biblical_rationale   TEXT;

-- 3. Add unique constraint on (protocol_name, pool_name, chain) matching
--    what the edge function uses for upsert conflict resolution.
--    We add it only if it doesn't exist to make the migration idempotent.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bwtya_opportunity_scores_protocol_name_key'
  ) THEN
    ALTER TABLE public.bwtya_opportunity_scores
      ADD CONSTRAINT bwtya_opportunity_scores_protocol_name_key
      UNIQUE (protocol_name, pool_name, chain);
  END IF;
END$$;

-- 4. Index on protocol_name for fast lookups
CREATE INDEX IF NOT EXISTS idx_bwtya_scores_protocol_name
  ON public.bwtya_opportunity_scores (protocol_name);

-- 5. Expose protocol_name in bwtya_opportunity_scores to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bwtya_opportunity_scores;
