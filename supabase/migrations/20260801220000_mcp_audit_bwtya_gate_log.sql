-- MCP Audit Log + BWTYA Gate Audit Log
-- Records every MCP tool call (sanitized inputs, rate-limit decisions, timestamps)
-- and every BWSP→BWTYA gate decision for compliance and monitoring.

-- ============================================================================
-- 1. mcp_audit_log
-- One row per MCP tool invocation.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mcp_audit_log (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name     TEXT NOT NULL,
  caller_key    TEXT NOT NULL,                          -- "user:<id>", "client:<id>", or "anon"
  sanitized_input JSONB,                                -- inputs after sanitization (no raw PII)
  rate_limited  BOOLEAN NOT NULL DEFAULT FALSE,
  rate_remaining INTEGER,                               -- remaining requests in the current window
  retry_after   INTEGER,                                -- seconds until window resets (when limited)
  outcome       TEXT NOT NULL DEFAULT 'success',        -- "success" | "rate_limited" | "error"
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mcp_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mcp_audit_log FROM anon, authenticated;
GRANT SELECT, INSERT ON public.mcp_audit_log TO service_role;

CREATE INDEX IF NOT EXISTS idx_mcp_audit_tool_created
  ON public.mcp_audit_log (tool_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mcp_audit_caller_created
  ON public.mcp_audit_log (caller_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mcp_audit_outcome_created
  ON public.mcp_audit_log (outcome, created_at DESC);

-- Admin read policy: only service_role (set above via GRANT).  A future admin
-- role could be granted SELECT here.  Anon/authenticated have no access.

-- Prune audit rows older than 90 days to bound table growth.
DO $$
BEGIN
  PERFORM cron.unschedule('mcp-audit-log-cleanup');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'mcp-audit-log-cleanup',
  '0 3 * * *',
  $JOB$DELETE FROM public.mcp_audit_log WHERE created_at < now() - interval '90 days';$JOB$
);

-- ============================================================================
-- 2. bwtya_gate_audit_log
-- One row per BWSP→BWTYA gate check (approved / skipped / blocked).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bwtya_gate_audit_log (
  id                      UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decision                TEXT NOT NULL,               -- "approved" | "skipped" | "blocked"
  verse_hash              TEXT,
  triple_check_passed     BOOLEAN,
  reason                  TEXT NOT NULL,
  bwsp_approval_timestamp TIMESTAMPTZ
);

ALTER TABLE public.bwtya_gate_audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bwtya_gate_audit_log FROM anon, authenticated;
GRANT SELECT, INSERT ON public.bwtya_gate_audit_log TO service_role;

CREATE INDEX IF NOT EXISTS idx_bwtya_gate_decision_ts
  ON public.bwtya_gate_audit_log (decision, timestamp DESC);
