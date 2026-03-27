-- Wisdom Score Schema Migration
-- Phase 2: BWSP/BWTYA Sovereign Agent Framework

-- Ensure wisdom_scores table has all needed columns
ALTER TABLE IF EXISTS wisdom_scores
  ADD COLUMN IF NOT EXISTS total_queries integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_confidence_score float DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dominant_intent text DEFAULT 'general_wisdom',
  ADD COLUMN IF NOT EXISTS stewardship_level text DEFAULT 'Novice',
  ADD COLUMN IF NOT EXISTS last_query_at timestamptz;

-- Create bwsp_agent_sessions table
CREATE TABLE IF NOT EXISTS bwsp_agent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  total_queries integer DEFAULT 0,
  total_tokens_used integer DEFAULT 0,
  avg_confidence_score float DEFAULT 0,
  agent_version text DEFAULT 'BWSP-v1.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bwsp_agent_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON bwsp_agent_sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert sessions" ON bwsp_agent_sessions FOR INSERT WITH CHECK (true);
