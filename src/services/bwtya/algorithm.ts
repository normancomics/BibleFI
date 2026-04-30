// BWTYA – Algorithm
// Full pipeline: score → rank → map strategies → compute tithe & yield projections

import { bwtyaRanker } from './ranker';
import { bwtyaScorer } from './scorer';
import { bwtyaStrategyMapper } from './strategyMapper';
import type { BWTYAInput, BWTYAResult } from './types';

export class BWTYAAlgorithm {
  run(input: BWTYAInput): BWTYAResult {
    const { opportunities, wisdomScore = 0, capitalUsd = 0 } = input;

    // 1. Score all opportunities
    const scored = bwtyaScorer.scoreAll(opportunities);

    // 2. Rank (top 10 for strategy mapping; full list for display)
    const ranked = bwtyaRanker.rank(scored);
    const topRanked = bwtyaRanker.topN(ranked, 10);

    // 3. Map to strategies
    const strategies = bwtyaStrategyMapper.map(topRanked, wisdomScore);
    const recommendedStrategy = bwtyaStrategyMapper.recommendBest(strategies, wisdomScore);

    // 4. Compute aggregate projected APY from recommended strategy
    const projectedApy = recommendedStrategy
      ? recommendedStrategy.allocations.reduce(
          (sum, a) => sum + (a.projectedApy * a.allocationPercent) / 100,
          0,
        )
      : 0;

    // 5. Tithe and yield calculations
    const titheReserve = (recommendedStrategy?.titheReservePercent ?? 10) / 100;
    const annualYield = capitalUsd * (projectedApy / 100);
    const titheAmount = annualYield * titheReserve;
    const yieldAfterTithe = annualYield - titheAmount;

    return {
      scoredOpportunities: ranked,
      strategies,
      recommendedStrategy,
      titheAmount,
      yieldAfterTithe,
      projectedApy,
      timestamp: new Date().toISOString(),
    };
  }
}

export const bwtyaAlgorithm = new BWTYAAlgorithm();
