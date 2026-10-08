// BWTYA – Scorer
// Evaluates each YieldOpportunity on 4 biblical dimensions using the
// advanced mathematical curves defined in mathEngine.ts

import {
  clamp,
  convictionScore,
  fruitSustainabilityCurve,
  kellyFraction,
  riskAdjustedReturn,
  tvlDepthScore,
} from './mathEngine';
import type { ScoredOpportunity, StewardshipGrade, YieldOpportunity } from './types';

function normalizeOpportunity(input: YieldOpportunity): { opportunity: YieldOpportunity; flags: string[] } {
  const flags: string[] = [];
  const source =
    input && typeof input === 'object'
      ? (input as YieldOpportunity)
      : ({} as YieldOpportunity);

  const text = (value: unknown, fallback: string, maxLength: number, field: string): string => {
    if (typeof value !== 'string') {
      flags.push(`⚠️ Invalid ${field} – using a safe default`);
      return fallback;
    }
    if (value.length > maxLength) {
      flags.push(`⚠️ ${field} exceeded its length limit and was truncated`);
      return value.slice(0, maxLength);
    }
    return value.trim();
  };

  const nonNegative = (value: unknown, fallback: number, field: string): number => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      flags.push(`⚠️ Invalid ${field} – treated conservatively`);
      return fallback;
    }
    return value;
  };

  const riskScore = nonNegative(source.riskScore, 100, 'risk score');
  const boundedRiskScore = clamp(riskScore, 0, 100);
  if (boundedRiskScore !== riskScore) flags.push('⚠️ Risk score was outside the 0–100 range');

  const booleanFlag = (value: unknown, field: string): boolean => {
    if (value === undefined) return false;
    if (typeof value !== 'boolean') {
      flags.push(`⚠️ Invalid ${field} claim ignored`);
      return false;
    }
    return value;
  };

  return {
    opportunity: {
      protocol: text(source.protocol, 'Unknown protocol', 120, 'protocol'),
      poolName: text(source.poolName, 'Unknown pool', 120, 'pool name'),
      tokenSymbol: text(source.tokenSymbol, '', 32, 'token symbol'),
      chain: text(source.chain, 'Unknown chain', 64, 'chain'),
      apy: nonNegative(source.apy, 0, 'APY'),
      tvlUsd: nonNegative(source.tvlUsd, 0, 'TVL'),
      riskScore: boundedRiskScore,
      category: text(source.category, '', 80, 'category'),
      biblicalAlignment: text(source.biblicalAlignment, '', 500, 'alignment description'),
      isVerified: booleanFlag(source.isVerified, 'verification'),
      audited: booleanFlag(source.audited, 'audit'),
      transparent: booleanFlag(source.transparent, 'transparency'),
    },
    flags,
  };
}

// ---------------------------------------------------------------------------
// Dimension scorers
// ---------------------------------------------------------------------------

/**
 * Dimension 1 – Fruit-bearing (John 15:16) · max 30 pts
 *
 * Uses the log-normal Fruit Sustainability Curve (peak 12 % APY) from
 * mathEngine rather than the previous linear bracket.  A 12 % APY scores the
 * full 30 pts; 60 % APY scores ~9 pts; 200 % scores ~1 pt.
 */
function scoreFruitBearing(o: YieldOpportunity): { score: number; flags: string[] } {
  const flags: string[] = [];
  const apyScore = fruitSustainabilityCurve(o.apy, flags);
  const tvlScore = tvlDepthScore(o.tvlUsd, flags);
  return { score: clamp(apyScore + tvlScore, 0, 30), flags };
}

/**
 * Dimension 2 – Faithful Stewardship (Matthew 25:14) · max 25 pts
 * Measures risk-adjusted trustworthiness of the protocol.
 */
function scoreFaithfulStewardship(o: YieldOpportunity): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  // Risk score (inverted, 0–15 pts): riskScore 0–100, lower = safer
  const riskPoints = Math.round(15 * (1 - o.riskScore / 100));
  score += riskPoints;

  // Audit bonus (0–7 pts)
  if (o.audited) score += 7;
  else flags.push('⚠️ Unaudited protocol – exercise extra caution');

  // Verified project (0–3 pts)
  if (o.isVerified) score += 3;
  else flags.push('⚠️ Project verification is not confirmed');

  return { score: clamp(score, 0, 25), flags };
}

/**
 * Dimension 3 – Biblical Alignment (Proverbs 3:9) · max 25 pts
 * Measures how well the protocol honours biblical financial principles.
 */
function scoreBiblicalAlignment(o: YieldOpportunity): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  const alignLower = o.biblicalAlignment.toLowerCase();
  const POSITIVE = [
    'stewardship', 'faithful', 'firstfruits', 'proverbs', 'tithe', 'transparent',
    'honest', 'justice', 'community', 'sustainable', 'giving',
  ];
  const NEGATIVE = ['gambling', 'speculative', 'opaque', 'anonymous team', 'no audit'];

  const positiveMatches = POSITIVE.filter((k) => alignLower.includes(k)).length;
  const negativeMatches = NEGATIVE.filter((k) => alignLower.includes(k)).length;

  score += Math.min(positiveMatches * 5, 20);
  score -= negativeMatches * 5;

  // Category bonus: stablecoins, lending, and transparent DEX aggregators align with biblical wealth preservation
  const safeCats = ['stable', 'lending', 'savings', 'staking', 'aggregator', 'dex'];
  if (safeCats.some((c) => o.category.toLowerCase().includes(c))) score += 5;

  if (negativeMatches > 0) {
    flags.push('⚠️ Protocol description contains concerning language');
  }

  return { score: clamp(score, 0, 25), flags };
}

/**
 * Dimension 4 – Transparency (Luke 16:10) · max 20 pts
 * Measures openness, verifiability, and on-chain accountability.
 */
function scoreTransparency(o: YieldOpportunity): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  if (o.transparent) score += 10;
  else flags.push('⚠️ Limited transparency information available (Luke 16:10)');

  if (o.audited) score += 5;
  if (o.isVerified) score += 5;

  return { score: clamp(score, 0, 20), flags };
}

// ---------------------------------------------------------------------------
// Grade mapping
// ---------------------------------------------------------------------------

function toGrade(score: number): StewardshipGrade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function buildRationale(o: YieldOpportunity, score: number, grade: StewardshipGrade, conviction: number): string {
  const gradeDescriptions: Record<StewardshipGrade, string> = {
    A: 'Excellent alignment with biblical stewardship principles.',
    B: 'Good protocol with minor areas for improvement.',
    C: 'Acceptable, but proceed with prayer and caution.',
    D: 'Below standard – significant biblical concerns present.',
    F: 'Not recommended – fails core stewardship criteria.',
  };
  return (
    `${o.protocol} (${o.poolName}) scored ${score}/100 (conviction ${conviction.toFixed(0)}/100) ` +
    `– ${gradeDescriptions[grade]} APY ${o.apy.toFixed(1)}% on ${o.chain}.`
  );
}

// ---------------------------------------------------------------------------
// BWTYAScorer
// ---------------------------------------------------------------------------

export class BWTYAScorer {
  score(opportunity: YieldOpportunity): ScoredOpportunity {
    const normalized = normalizeOpportunity(opportunity);
    const safeOpportunity = normalized.opportunity;
    const d1 = scoreFruitBearing(safeOpportunity);
    const d2 = scoreFaithfulStewardship(safeOpportunity);
    const d3 = scoreBiblicalAlignment(safeOpportunity);
    const d4 = scoreTransparency(safeOpportunity);

    const bwtyaScore = d1.score + d2.score + d3.score + d4.score;
    const grade = toGrade(bwtyaScore);
    const allFlags = [...normalized.flags, ...d1.flags, ...d2.flags, ...d3.flags, ...d4.flags];

    // Advanced metrics
    const conviction = convictionScore(d1.score, d2.score, d3.score, d4.score);
    const rar = riskAdjustedReturn(safeOpportunity.apy, safeOpportunity.riskScore);
    const kelly = kellyFraction(bwtyaScore, safeOpportunity.apy);

    return {
      opportunity: safeOpportunity,
      fruitBearingScore: d1.score,
      faithfulnessScore: d2.score,
      biblicalAlignmentScore: d3.score,
      transparencyScore: d4.score,
      bwtyaScore,
      convictionScore: conviction,
      riskAdjustedYield: rar,
      kellyWeight: kelly,
      paretoKept: true, // set by BWTYARanker after cross-opportunity analysis
      stewardshipGrade: grade,
      warningFlags: allFlags,
      biblicalRationale: buildRationale(safeOpportunity, bwtyaScore, grade, conviction),
    };
  }

  scoreAll(opportunities: YieldOpportunity[]): ScoredOpportunity[] {
    return opportunities.map((o) => this.score(o));
  }
}

export const bwtyaScorer = new BWTYAScorer();
