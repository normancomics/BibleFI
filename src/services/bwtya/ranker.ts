// BWTYA – Ranker
// Sorts scored opportunities and provides topN selection

import type { ScoredOpportunity } from './types';

export class BWTYARanker {
  rank(scored: ScoredOpportunity[]): ScoredOpportunity[] {
    // Primary: bwtyaScore DESC
    // Secondary: riskScore ASC (lower risk preferred)
    // Tertiary: tvlUsd DESC (deeper liquidity preferred)
    return [...scored].sort((a, b) => {
      if (b.bwtyaScore !== a.bwtyaScore) return b.bwtyaScore - a.bwtyaScore;
      if (a.opportunity.riskScore !== b.opportunity.riskScore)
        return a.opportunity.riskScore - b.opportunity.riskScore;
      return b.opportunity.tvlUsd - a.opportunity.tvlUsd;
    });
  }

  topN(scored: ScoredOpportunity[], n: number): ScoredOpportunity[] {
    const ranked = this.rank(scored);

    // Deduplicate by protocol + poolName to avoid double-counting
    const seen = new Set<string>();
    const unique: ScoredOpportunity[] = [];

    for (const item of ranked) {
      const key = `${item.opportunity.protocol}::${item.opportunity.poolName}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
      if (unique.length >= n) break;
    }

    return unique;
  }
}

export const bwtyaRanker = new BWTYARanker();
