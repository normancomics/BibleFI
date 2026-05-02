// BWTYA – Ranker
// Sorts scored opportunities using:
//   1. Pareto dominance filter (eliminate strictly-dominated candidates)
//   2. Chain/category diversification penalty for correlated picks
//   3. Primary sort: bwtyaScore DESC; secondary: convictionScore DESC;
//      tertiary: riskAdjustedYield DESC; quaternary: tvlUsd DESC

import { paretoDominanceMask } from './mathEngine';
import type { ScoredOpportunity } from './types';

/** Extract the four dimension scores as a comparable vector */
function dimensionVector(s: ScoredOpportunity): number[] {
  return [
    s.fruitBearingScore,
    s.faithfulnessScore,
    s.biblicalAlignmentScore,
    s.transparencyScore,
  ];
}

export class BWTYARanker {
  /**
   * Rank scored opportunities.
   *
   * Steps:
   *   1. Apply Pareto dominance mask – mark dominated entries (paretoKept = false)
   *   2. Sort: non-dominated first, then by bwtyaScore → convictionScore →
   *      riskAdjustedYield → tvlUsd
   *   3. Annotate with the kept flag so the UI can optionally grey-out dominated rows
   */
  rank(scored: ScoredOpportunity[]): ScoredOpportunity[] {
    if (scored.length === 0) return [];

    // Step 1: Pareto dominance
    const vectors = scored.map(dimensionVector);
    const keepMask = paretoDominanceMask(vectors);

    // Annotate each entry with its Pareto status
    const annotated: ScoredOpportunity[] = scored.map((s, i) => ({
      ...s,
      paretoKept: keepMask[i],
    }));

    // Step 2: Sort – Pareto-kept entries first, then by descending quality
    return annotated.sort((a, b) => {
      // Non-dominated beats dominated
      if (a.paretoKept !== b.paretoKept) return a.paretoKept ? -1 : 1;
      // Primary: BWTYA composite
      if (b.bwtyaScore !== a.bwtyaScore) return b.bwtyaScore - a.bwtyaScore;
      // Secondary: conviction (geometric-mean quality)
      if (b.convictionScore !== a.convictionScore) return b.convictionScore - a.convictionScore;
      // Tertiary: risk-adjusted yield (Sharpe analogue)
      if (b.riskAdjustedYield !== a.riskAdjustedYield) return b.riskAdjustedYield - a.riskAdjustedYield;
      // Quaternary: raw TVL (deeper = more established)
      return b.opportunity.tvlUsd - a.opportunity.tvlUsd;
    });
  }

  /**
   * Returns the top-N unique opportunities.
   *
   * Uniqueness is by protocol + poolName.  When selecting from correlated
   * candidates (same chain AND same category), a diversification penalty of
   * −3 conviction points is applied to subsequent picks from the same group
   * so that at most one pick per "chain × category" bucket is preferred.
   */
  topN(scored: ScoredOpportunity[], n: number): ScoredOpportunity[] {
    const ranked = this.rank(scored);

    const seen = new Set<string>();
    const chainCategoryCount = new Map<string, number>();
    const unique: ScoredOpportunity[] = [];

    for (const item of ranked) {
      const dedupKey = `${item.opportunity.protocol}::${item.opportunity.poolName}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      const corrKey = `${item.opportunity.chain}::${item.opportunity.category}`;
      const corrCount = chainCategoryCount.get(corrKey) ?? 0;
      chainCategoryCount.set(corrKey, corrCount + 1);

      // Apply diversification penalty (informational; sort order already set)
      if (corrCount > 0 && item.paretoKept) {
        // Correlated pick: annotate conviction penalty so UI can show it
        unique.push({
          ...item,
          convictionScore: Math.max(0, item.convictionScore - 3 * corrCount),
        });
      } else {
        unique.push(item);
      }

      if (unique.length >= n) break;
    }

    return unique;
  }
}

export const bwtyaRanker = new BWTYARanker();
