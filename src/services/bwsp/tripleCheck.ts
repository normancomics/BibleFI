// BWSP – Triple-Check Validator
// Mandatory gate before any synthesis is trusted or mirrored on-chain.
//
// Three independent checks (workspace mandate):
//   1. Authenticity   – canonical reference + non-empty verse body
//   2. Context        – synthesis actually addresses the detected intent
//   3. No-Cherry-Pick – supporting scriptures span multiple books/categories
//
// Deterministic and offline: no network calls, safe for Sabbath autonomy.

import type { BWSPQueryIntent, BWSPSynthesis, ScriptureResult } from './types';

export type TripleCheckVerdict = 'approved' | 'flagged' | 'quarantined';

export interface TripleCheckDimension {
  name: 'authenticity' | 'context' | 'no_cherry_picking';
  scripture: string;
  passed: boolean;
  score: number; // 0–1
  notes: string[];
}

export interface TripleCheckResult {
  verdict: TripleCheckVerdict;
  /** 0–1 composite (geometric mean – a single failure drags the whole result down) */
  compositeScore: number;
  dimensions: TripleCheckDimension[];
  /** Deterministic 64-bit FNV-1a hash of `reference|text` – mirrored in BWSP_ on-chain events */
  verseHash: string;
  /** True when BWTYA is permitted to execute on this synthesis */
  executionPermitted: boolean;
  checkedAt: string;
  protocol: string;
}

// ---------------------------------------------------------------------------
// Deterministic verse hashing (FNV-1a 64-bit, hex) – auditability requirement
// ---------------------------------------------------------------------------

export function verseHashOf(reference: string, text: string): string {
  const input = `${reference.trim()}|${text.trim()}`;
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < input.length; i++) {
    hash = (hash ^ BigInt(input.charCodeAt(i))) & mask;
    hash = (hash * prime) & mask;
  }
  return `0x${hash.toString(16).padStart(16, '0')}`;
}

// ---------------------------------------------------------------------------
// Check 1 – Authenticity (Proverbs 30:5 · "Every word of God is pure")
// ---------------------------------------------------------------------------

/** Book Chapter:Verse (optionally ranged, optionally numbered book: "1 Timothy 6:10") */
const REFERENCE_PATTERN = /^(?:[1-3]\s)?[A-Z][A-Za-z' ]+\s\d{1,3}:\d{1,3}(?:-\d{1,3})?$/;

function checkAuthenticity(primary: ScriptureResult | undefined): TripleCheckDimension {
  const notes: string[] = [];
  let score = 0;

  const reference = primary?.reference?.trim() ?? '';
  const text = primary?.text?.trim() ?? '';

  if (REFERENCE_PATTERN.test(reference)) score += 0.5;
  else notes.push(`Reference "${reference || '(empty)'}" is not a canonical Book Chapter:Verse citation`);

  if (text.length >= 20) score += 0.4;
  else notes.push('Verse body is missing or too short to verify against KJV');

  if (primary?.principle?.trim()) score += 0.1;
  else notes.push('No extracted principle attached to the primary scripture');

  return {
    name: 'authenticity',
    scripture: 'Proverbs 30:5',
    passed: score >= 0.9,
    score: Math.min(1, score),
    notes,
  };
}

// ---------------------------------------------------------------------------
// Check 2 – Context (2 Timothy 2:15 · "rightly dividing the word of truth")
// ---------------------------------------------------------------------------

const INTENT_CONTEXT_TERMS: Record<BWSPQueryIntent, string[]> = {
  yield_advice: ['yield', 'apy', 'invest', 'increase', 'talent', 'profit', 'return', 'multiply'],
  risk_assessment: ['risk', 'loss', 'caution', 'surety', 'danger', 'protect', 'diversif', 'prudent'],
  tithe_guidance: ['tithe', 'tenth', 'offering', 'firstfruits', 'give', 'storehouse'],
  stewardship_principle: ['steward', 'faithful', 'entrust', 'manage', 'servant', 'account'],
  defi_action: ['lend', 'stake', 'swap', 'liquidity', 'borrow', 'exchange', 'trade'],
  tax_wisdom: ['tax', 'tribute', 'caesar', 'render', 'due', 'custom'],
  general_wisdom: ['wisdom', 'understand', 'counsel', 'knowledge', 'instruct', 'fear of the lord'],
};

function checkContext(
  synthesis: BWSPSynthesis,
  intent: BWSPQueryIntent,
): TripleCheckDimension {
  const notes: string[] = [];
  const terms = INTENT_CONTEXT_TERMS[intent] ?? INTENT_CONTEXT_TERMS.general_wisdom;
  const haystack = [
    synthesis.primaryScripture?.text,
    synthesis.primaryScripture?.principle,
    synthesis.primaryScripture?.defiApplication,
    synthesis.principle,
    synthesis.guidance,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const matched = terms.filter((t) => haystack.includes(t));
  let score = Math.min(1, matched.length / 2);

  if (matched.length === 0) {
    notes.push(`No ${intent.replace(/_/g, ' ')} vocabulary found – scripture may be applied out of context`);
  }

  if (!synthesis.action?.trim()) {
    score -= 0.2;
    notes.push('Synthesis provides no actionable insight for the stated intent');
  }
  if (synthesis.confidenceScore < 0.35) {
    score -= 0.2;
    notes.push(`Low synthesis confidence (${synthesis.confidenceScore.toFixed(2)})`);
  }

  score = Math.max(0, Math.min(1, score));
  return {
    name: 'context',
    scripture: '2 Timothy 2:15',
    passed: score >= 0.5,
    score,
    notes,
  };
}

// ---------------------------------------------------------------------------
// Check 3 – No cherry-picking (Acts 20:27 · "the whole counsel of God")
// ---------------------------------------------------------------------------

function bookOf(reference: string): string {
  const match = reference.trim().match(/^((?:[1-3]\s)?[A-Za-z' ]+?)\s\d{1,3}:/);
  return (match?.[1] ?? reference).trim().toLowerCase();
}

function checkNoCherryPicking(
  primary: ScriptureResult | undefined,
  supporting: ScriptureResult[],
): TripleCheckDimension {
  const notes: string[] = [];
  const all = [primary, ...supporting].filter(Boolean) as ScriptureResult[];
  const books = new Set(all.map((s) => bookOf(s.reference ?? '')));
  const categories = new Set(all.map((s) => (s.category ?? '').toLowerCase()).filter(Boolean));

  let score = 0;
  if (all.length >= 3) score += 0.4;
  else notes.push(`Only ${all.length} scripture(s) consulted – minimum of 3 required for whole-counsel review`);

  if (books.size >= 2) score += 0.4;
  else notes.push(`All citations come from a single book ("${[...books][0] ?? 'unknown'}")`);

  if (categories.size >= 2) score += 0.2;
  else notes.push('All citations share one thematic category – possible selection bias');

  score = Math.min(1, score);
  return {
    name: 'no_cherry_picking',
    scripture: 'Acts 20:27',
    passed: score >= 0.8,
    score,
    notes,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Geometric mean – any single near-zero dimension collapses the composite. */
function geometricMean(values: number[]): number {
  if (values.length === 0) return 0;
  const product = values.reduce((acc, v) => acc * Math.max(v, 0.0001), 1);
  return Math.pow(product, 1 / values.length);
}

export function runTripleCheck(
  synthesis: BWSPSynthesis,
  intent: BWSPQueryIntent = 'general_wisdom',
): TripleCheckResult {
  const primary = synthesis.primaryScripture;
  const dimensions: TripleCheckDimension[] = [
    checkAuthenticity(primary),
    checkContext(synthesis, intent),
    checkNoCherryPicking(primary, synthesis.supportingScriptures ?? []),
  ];

  const compositeScore = geometricMean(dimensions.map((d) => d.score));
  const failures = dimensions.filter((d) => !d.passed);

  // Authenticity is non-negotiable: its failure quarantines the synthesis outright.
  const authenticityFailed = !dimensions[0].passed;
  const verdict: TripleCheckVerdict =
    authenticityFailed || compositeScore < 0.45
      ? 'quarantined'
      : failures.length > 0 || compositeScore < 0.7
        ? 'flagged'
        : 'approved';

  return {
    verdict,
    compositeScore,
    dimensions,
    verseHash: verseHashOf(primary?.reference ?? '', primary?.text ?? ''),
    executionPermitted: verdict === 'approved',
    checkedAt: new Date().toISOString(),
    protocol: 'BWSP-TripleCheck-v1.0',
  };
}

export const bwspTripleCheck = { run: runTripleCheck, verseHashOf };
