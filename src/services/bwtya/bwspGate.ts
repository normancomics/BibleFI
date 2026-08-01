// BWTYA – BWSP Approval Gate
//
// Enforces that BWTYA execution can only proceed after the Biblical-Wisdom-
// Synthesis-Protocol has approved the query via a successful triple-check.
// Every gate decision is appended to an in-memory audit log (also persisted to
// Supabase when available).

import { supabase } from '@/integrations/supabase/client';
import type { BWTYAInput } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GateDecision = 'approved' | 'skipped' | 'blocked';

export interface GateAuditEntry {
  timestamp: string;
  decision: GateDecision;
  verseHash: string | null;
  tripleCheckPassed: boolean | null;
  reason: string;
  bwspApprovalTimestamp: string | null;
}

// ---------------------------------------------------------------------------
// In-memory audit log (ring buffer, last 200 entries)
// ---------------------------------------------------------------------------

const AUDIT_LOG_MAX = 200;
const _auditLog: GateAuditEntry[] = [];

export function getGateAuditLog(): Readonly<GateAuditEntry[]> {
  return _auditLog;
}

function appendAudit(entry: GateAuditEntry): void {
  _auditLog.push(entry);
  if (_auditLog.length > AUDIT_LOG_MAX) _auditLog.shift();

  // Best-effort persist to Supabase (fire-and-forget; never blocks execution)
  void supabase
    .from('bwtya_gate_audit_log' as never)
    .insert({
      timestamp: entry.timestamp,
      decision: entry.decision,
      verse_hash: entry.verseHash,
      triple_check_passed: entry.tripleCheckPassed,
      reason: entry.reason,
      bwsp_approval_timestamp: entry.bwspApprovalTimestamp,
    })
    .then(({ error }) => {
      if (error) console.warn('[bwspGate] audit persist failed:', error.message);
    });
}

// ---------------------------------------------------------------------------
// Gate function
// ---------------------------------------------------------------------------

/**
 * Checks whether a BWTYA run is authorised.
 *
 * Rules:
 * - If `bwspApproval` is not provided → **skipped** (legacy / direct calls).
 * - If `bwspApproval.tripleCheckPassed === false` → **blocked**.
 * - If `bwspApproval.tripleCheckPassed === true` → **approved**.
 *
 * @returns `{ status, reason }` — callers must check `status !== 'blocked'`
 *           before proceeding with yield execution.
 */
export function checkBwspGate(input: BWTYAInput): {
  status: GateDecision;
  reason: string;
} {
  const now = new Date().toISOString();

  if (!input.bwspApproval) {
    const entry: GateAuditEntry = {
      timestamp: now,
      decision: 'skipped',
      verseHash: null,
      tripleCheckPassed: null,
      reason: 'No BWSP approval token provided — gate skipped (legacy call).',
      bwspApprovalTimestamp: null,
    };
    appendAudit(entry);
    return { status: 'skipped', reason: entry.reason };
  }

  const { verseHash, tripleCheckPassed, timestamp: bwspTs } = input.bwspApproval;

  if (!tripleCheckPassed) {
    const entry: GateAuditEntry = {
      timestamp: now,
      decision: 'blocked',
      verseHash,
      tripleCheckPassed: false,
      reason:
        `BWTYA execution blocked: BWSP triple-check failed for verse hash ${verseHash}. ` +
        '"Do not be hasty in laying on of hands" — 1 Timothy 5:22.',
      bwspApprovalTimestamp: bwspTs,
    };
    appendAudit(entry);
    return { status: 'blocked', reason: entry.reason };
  }

  const entry: GateAuditEntry = {
    timestamp: now,
    decision: 'approved',
    verseHash,
    tripleCheckPassed: true,
    reason: `BWTYA execution approved by BWSP triple-check (verse ${verseHash}).`,
    bwspApprovalTimestamp: bwspTs,
  };
  appendAudit(entry);
  return { status: 'approved', reason: entry.reason };
}
