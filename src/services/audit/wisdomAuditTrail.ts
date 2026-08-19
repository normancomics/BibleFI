// BibleFi – Wisdom Audit Trail
//
// Workspace mandate: "All agent actions must emit full verse hash + timestamp
// for auditability." This module is the single append-only sink for every
// BWSP_ / BWTYA_ event, shaped so it can be mirrored 1:1 into on-chain events
// emitted by BibleFiBWSP / BibleFiBWTYA.
//
// "Moreover it is required in stewards, that a man be found faithful."
// — 1 Corinthians 4:2
//
// Fully deterministic and offline: safe for Sabbath autonomy (Exodus 20:8-11).

import { verseHashOf } from '../bwsp/tripleCheck';

export type WisdomAuditEventName =
  | 'BWSP_SynthesisChecked'
  | 'BWSP_SynthesisQuarantined'
  | 'BWTYA_ExecutionGateEvaluated'
  | 'BWTYA_StrategyRecommended'
  | 'BWTYA_ExecutionBlocked';

export interface WisdomAuditRecord {
  /** Monotonic index within this session's trail */
  sequence: number;
  /** Solidity event name – prefix identifies the emitting sovereign agent */
  event: WisdomAuditEventName;
  agent: 'BWSP' | 'BWTYA';
  /** Deterministic FNV-1a verse hash the action was anchored to (null = unanchored) */
  verseHash: string | null;
  /** ISO-8601 UTC timestamp of the action */
  timestamp: string;
  /** Unix seconds – the value mirrored on-chain */
  blockTimestamp: number;
  /** Human/Scripture-first summary shown in the agent-ops dashboard */
  summary: string;
  /** Structured payload (kept small – on-chain events carry the hash, not the blob) */
  data: Record<string, string | number | boolean | null>;
  /** Deterministic digest of the whole record – tamper-evidence for the trail */
  recordHash: string;
}

const MAX_RECORDS = 500;

class WisdomAuditTrail {
  private records: WisdomAuditRecord[] = [];
  private sequence = 0;
  private listeners = new Set<(record: WisdomAuditRecord) => void>();

  emit(input: {
    event: WisdomAuditEventName;
    verseHash?: string | null;
    summary: string;
    data?: WisdomAuditRecord['data'];
  }): WisdomAuditRecord {
    const now = new Date();
    const sequence = ++this.sequence;
    const agent: WisdomAuditRecord['agent'] = input.event.startsWith('BWSP_') ? 'BWSP' : 'BWTYA';

    const base = {
      sequence,
      event: input.event,
      agent,
      verseHash: input.verseHash ?? null,
      timestamp: now.toISOString(),
      blockTimestamp: Math.floor(now.getTime() / 1000),
      summary: input.summary,
      data: input.data ?? {},
    };

    const record: WisdomAuditRecord = {
      ...base,
      recordHash: verseHashOf(
        `${base.event}#${base.sequence}`,
        `${base.verseHash ?? 'unanchored'}|${base.blockTimestamp}|${JSON.stringify(base.data)}`,
      ),
    };

    this.records.push(record);
    if (this.records.length > MAX_RECORDS) this.records.shift();
    this.listeners.forEach((fn) => {
      try {
        fn(record);
      } catch {
        /* a broken subscriber must never break the audit trail */
      }
    });

    return record;
  }

  /** Most recent records first. */
  list(limit = 50): WisdomAuditRecord[] {
    return this.records.slice(-limit).reverse();
  }

  byAgent(agent: WisdomAuditRecord['agent'], limit = 50): WisdomAuditRecord[] {
    return this.records.filter((r) => r.agent === agent).slice(-limit).reverse();
  }

  /** Records anchored to a specific verse hash – answers "why did we act on this Scripture?" */
  byVerseHash(verseHash: string): WisdomAuditRecord[] {
    return this.records.filter((r) => r.verseHash === verseHash);
  }

  subscribe(fn: (record: WisdomAuditRecord) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  clear(): void {
    this.records = [];
    this.sequence = 0;
  }
}

export const wisdomAuditTrail = new WisdomAuditTrail();
