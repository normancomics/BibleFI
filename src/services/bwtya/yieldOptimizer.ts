// BWTYA – Yield Optimizer
// Applies biblical stewardship constraints to yield strategies
// Implements "Joseph's 7-year cycle" diversification (Genesis 41:35)

import { bwtyaAlgorithm } from './algorithm';
import type { BWTYAInput, BWTYAResult, StrategyAllocation } from './types';

export interface StewardshipConstraints {
  maxRiskScore?: number;
  requireBiblicalAlignment?: boolean;
  titheFirst?: boolean;
  avoidTokens?: string[];
  minStewardshipGrade?: 'A' | 'B' | 'C';
  wisdomScoreThreshold?: number;
}

export interface OptimizedYieldPlan {
  recommendedAllocations: StrategyAllocation[];
  estimatedApy: number;
  titheAmount: number;
  yieldAfterTithe: number;
  diversificationScore: number; // 0–100
  josephPrincipleScore: number; // 0–100 (Genesis 41:35 — store in good years)
  warningFlags: string[];
  topScripture: string;
}

const GRADE_RANK: Record<string, number> = { A: 3, B: 2, C: 1, D: 0, F: -1 };

const MIN_STABLE_APY = 5;
const MAX_STABLE_APY = 30;
const TITHE_FIRST_PERCENTAGE = 0.1; // 10% first-fruits reserve (Proverbs 3:9)

export class BWTYAYieldOptimizer {
  optimize(
    input: BWTYAInput,
    constraints: StewardshipConstraints = {},
  ): OptimizedYieldPlan {
    const warnings: string[] = [];

    // ── Apply pre-filters to opportunities ───────────────────────────────
    let filtered = [...input.opportunities];

    if (constraints.avoidTokens?.length) {
      const avoid = constraints.avoidTokens.map((t) => t.toUpperCase());
      filtered = filtered.filter(
        (o) => !avoid.includes(o.tokenSymbol.toUpperCase()),
      );
      if (filtered.length < input.opportunities.length) {
        warnings.push(
          `Excluded ${input.opportunities.length - filtered.length} token(s) per avoidance list.`,
        );
      }
    }

    if (constraints.maxRiskScore !== undefined) {
      filtered = filtered.filter((o) => o.riskScore <= constraints.maxRiskScore!);
      if (filtered.length === 0) {
        warnings.push(
          'No opportunities meet the maxRiskScore constraint — relaxing filter.',
        );
        filtered = [...input.opportunities];
      }
    }

    if (constraints.requireBiblicalAlignment) {
      const aligned = filtered.filter(
        (o) =>
          o.biblicalAlignment &&
          o.biblicalAlignment !== 'unknown' &&
          o.biblicalAlignment !== 'none',
      );
      if (aligned.length > 0) {
        filtered = aligned;
      } else {
        warnings.push('No opportunities have explicit biblical alignment metadata.');
      }
    }

    // ── Run BWTYA algorithm on filtered set ───────────────────────────────
    const filteredInput: BWTYAInput = { ...input, opportunities: filtered };
    let result: BWTYAResult;
    try {
      result = bwtyaAlgorithm.run(filteredInput);
    } catch (err) {
      console.error('[BWTYAYieldOptimizer] algorithm error', err);
      // Fallback to unfiltered
      result = bwtyaAlgorithm.run(input);
      warnings.push('Constraint filter caused algorithm error — using unfiltered results.');
    }

    // ── Apply post-filter: minStewardshipGrade ────────────────────────────
    let allocations = result.recommendedStrategy.allocations;

    if (constraints.minStewardshipGrade) {
      const minRank = GRADE_RANK[constraints.minStewardshipGrade] ?? 0;
      const gradeFiltered = allocations.filter(
        (a) => (GRADE_RANK[a.stewardshipGrade] ?? 0) >= minRank,
      );
      if (gradeFiltered.length > 0) {
        allocations = gradeFiltered;
      } else {
        warnings.push(
          `No allocations meet minStewardshipGrade '${constraints.minStewardshipGrade}' — using all.`,
        );
      }
    }

    // ── Tithe-first adjustment ────────────────────────────────────────────
    const titheReserve = constraints.titheFirst
      ? TITHE_FIRST_PERCENTAGE
      : result.recommendedStrategy.titheReservePercent / 100;

    const capital = input.capitalUsd ?? 0;
    const projectedApy = result.projectedApy;
    const annualYield = capital * (projectedApy / 100);
    const titheAmount = annualYield * titheReserve;
    const yieldAfterTithe = annualYield - titheAmount;

    if (constraints.titheFirst) {
      warnings.push('Tithe-first mode: 10% reserved as first-fruits before compounding.');
    }

    // ── Wisdom score threshold check ───────────────────────────────────────
    if (
      constraints.wisdomScoreThreshold !== undefined &&
      (input.wisdomScore ?? 0) < constraints.wisdomScoreThreshold
    ) {
      warnings.push(
        `Wisdom score ${input.wisdomScore ?? 0} is below threshold ${constraints.wisdomScoreThreshold} — Solomon's Portfolio unavailable.`,
      );
    }

    // ── Joseph Principle Score ─────────────────────────────────────────────
    // Higher TVL + stable APY = higher score (Genesis 41:35 — store grain in good years)
    const josephPrincipleScore = this.computeJosephScore(result, allocations);

    // ── Diversification Score ─────────────────────────────────────────────
    const uniqueProtocols = new Set(allocations.map((a) => a.protocol)).size;
    const diversificationScore = Math.min(100, Math.round((uniqueProtocols / 7) * 100));

    if (uniqueProtocols < 3) {
      warnings.push(
        `Joseph's 7-year cycle recommends spreading across at least 3 protocols — currently ${uniqueProtocols}.`,
      );
    }

    // ── Top scripture ─────────────────────────────────────────────────────
    const topScripture = result.recommendedStrategy.scriptureAnchor;

    return {
      recommendedAllocations: allocations,
      estimatedApy: parseFloat(projectedApy.toFixed(2)),
      titheAmount: parseFloat(titheAmount.toFixed(2)),
      yieldAfterTithe: parseFloat(yieldAfterTithe.toFixed(2)),
      diversificationScore,
      josephPrincipleScore,
      warningFlags: warnings,
      topScripture,
    };
  }

  private computeJosephScore(
    result: BWTYAResult,
    allocations: StrategyAllocation[],
  ): number {
    if (allocations.length === 0) return 0;

    // Find the scored opportunities that correspond to our allocations
    const scored = result.scoredOpportunities.filter((so) =>
      allocations.some(
        (a) => a.protocol === so.opportunity.protocol,
      ),
    );

    if (scored.length === 0) return 50;

    // Joseph principle: high TVL (store in good years) + stable APY
    const avgTvlBillion =
      scored.reduce((sum, so) => sum + (so.opportunity.tvlUsd ?? 0), 0) /
      scored.length /
      1_000_000_000;

    const avgApy =
      scored.reduce((sum, so) => sum + (so.opportunity.apy ?? 0), 0) / scored.length;

    // TVL component: $1B+ TVL = full 50 pts
    const tvlScore = Math.min(50, avgTvlBillion * 50);
    // APY component: MIN_STABLE_APY–MAX_STABLE_APY is the "stable harvest" sweet spot → 50 pts
    const apyScore =
      avgApy >= MIN_STABLE_APY && avgApy <= MAX_STABLE_APY
        ? 50
        : avgApy < MIN_STABLE_APY
        ? avgApy * (50 / MIN_STABLE_APY)
        : 30;

    return Math.round(Math.min(100, tvlScore + apyScore));
  }
}

export const bwtyaYieldOptimizer = new BWTYAYieldOptimizer();
