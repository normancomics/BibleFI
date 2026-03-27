-- BWSP + BWTYA Tables & RPCs
-- Migration: 20260327_bwsp_bwtya_tables.sql

-- ============================================================================
-- 1. bwsp_query_log
-- Stores every BWSP query for analytics and wallet wisdom scoring.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bwsp_query_log (
  id                    UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address        TEXT,
  query                 TEXT NOT NULL,
  intent                TEXT NOT NULL DEFAULT 'general_wisdom',
  synthesis_method      TEXT NOT NULL DEFAULT 'offline_fallback',
  confidence_score      DOUBLE PRECISION,
  processing_time_ms    INTEGER,
  primary_scripture_ref TEXT,
  bwtya_strategy_id     TEXT,
  bwtya_projected_apy   DOUBLE PRECISION,
  tithe_amount          DOUBLE PRECISION,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.bwsp_query_log ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own log rows
CREATE POLICY "bwsp_query_log_insert"
  ON public.bwsp_query_log
  FOR INSERT
  WITH CHECK (true);

-- Users can read their own rows; service-role can read all
CREATE POLICY "bwsp_query_log_select_own"
  ON public.bwsp_query_log
  FOR SELECT
  USING (
    wallet_address IS NULL
    OR auth.uid()::text = wallet_address
  );

CREATE INDEX IF NOT EXISTS idx_bwsp_query_log_wallet
  ON public.bwsp_query_log (wallet_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bwsp_query_log_intent
  ON public.bwsp_query_log (intent, created_at DESC);


-- ============================================================================
-- 2. bwtya_opportunity_scores
-- Stores the latest BWTYA scoring result for each DeFi opportunity.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bwtya_opportunity_scores (
  id                       UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol                 TEXT NOT NULL,
  pool_name                TEXT NOT NULL,
  token_symbol             TEXT,
  chain                    TEXT NOT NULL,
  apy                      DOUBLE PRECISION,
  tvl_usd                  DOUBLE PRECISION,
  risk_score               DOUBLE PRECISION,
  bwtya_score              DOUBLE PRECISION NOT NULL,
  biblical_alignment_score DOUBLE PRECISION,
  stewardship_grade        TEXT NOT NULL,
  scored_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (protocol, pool_name, chain)
);

-- Enable Row-Level Security
ALTER TABLE public.bwtya_opportunity_scores ENABLE ROW LEVEL SECURITY;

-- Public read – scores are not sensitive
CREATE POLICY "bwtya_scores_select_public"
  ON public.bwtya_opportunity_scores
  FOR SELECT
  USING (true);

-- Only service-role can insert/update (done from edge functions)
CREATE POLICY "bwtya_scores_insert_service"
  ON public.bwtya_opportunity_scores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "bwtya_scores_update_service"
  ON public.bwtya_opportunity_scores
  FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_bwtya_scores_bwtya_score
  ON public.bwtya_opportunity_scores (bwtya_score DESC);

CREATE INDEX IF NOT EXISTS idx_bwtya_scores_chain
  ON public.bwtya_opportunity_scores (chain, bwtya_score DESC);

CREATE INDEX IF NOT EXISTS idx_bwtya_scores_grade
  ON public.bwtya_opportunity_scores (stewardship_grade, bwtya_score DESC);


-- ============================================================================
-- 3. match_biblical_knowledge RPC (pgvector similarity search)
-- Returns biblical knowledge base entries closest to the query embedding.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_biblical_knowledge(
  query_embedding VECTOR(1536),
  match_threshold DOUBLE PRECISION DEFAULT 0.5,
  match_count     INTEGER DEFAULT 5
)
RETURNS TABLE (
  id          UUID,
  reference   TEXT,
  verse_text  TEXT,
  principle   TEXT,
  application TEXT,
  category    TEXT,
  similarity  DOUBLE PRECISION
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bkb.id,
    bkb.reference,
    bkb.verse_text,
    bkb.principle,
    bkb.application,
    bkb.category,
    1 - (bkb.embedding <=> query_embedding) AS similarity
  FROM public.biblical_knowledge_base bkb
  WHERE bkb.embedding IS NOT NULL
    AND 1 - (bkb.embedding <=> query_embedding) > match_threshold
  ORDER BY bkb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- ============================================================================
-- 4. match_defi_knowledge RPC (pgvector similarity search)
-- Returns DeFi knowledge base entries closest to the query embedding.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_defi_knowledge(
  query_embedding VECTOR(1536),
  match_threshold DOUBLE PRECISION DEFAULT 0.5,
  match_count     INTEGER DEFAULT 5
)
RETURNS TABLE (
  id         UUID,
  topic      TEXT,
  content    TEXT,
  protocol   TEXT,
  similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dkb.id,
    dkb.topic,
    dkb.content,
    dkb.protocol,
    1 - (dkb.embedding <=> query_embedding) AS similarity
  FROM public.defi_knowledge_base dkb
  WHERE dkb.embedding IS NOT NULL
    AND 1 - (dkb.embedding <=> query_embedding) > match_threshold
  ORDER BY dkb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
