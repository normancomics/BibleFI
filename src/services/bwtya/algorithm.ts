// BWTYA – Algorithm
// Full pipeline: score → rank → Pareto filter → map strategies → Monte Carlo simulate → rebalance signal

import { bwtyaRanker } from './ranker';
import { bwtyaRebalancer } from './rebalancer';
import { bwtyaScorer } from './scorer';
import { simulatePortfolio } from './simulator';
import { bwtyaStrategyMapper } from './strategyMapper';
import type { BWTYAInput, BWTYAResult } from './types';

export class BWTYAAlgorithm {
  run(input: BWTYAInput): BWTYAResult {
    const { opportunities, wisdomScore = 0, capitalUsd = 0, currentAllocs } = input;

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

    // 6. Monte Carlo simulation on the recommended strategy positions
    let simulation = null;
    let projectedApyP10 = 0;
    let projectedApyP90 = 0;
    let probabilityOfLoss = 0;

    if (recommendedStrategy && recommendedStrategy.allocations.length > 0) {
      // Find the scored opportunities matching this strategy's allocations
      const strategyOpportunities = recommendedStrategy.allocations.map((alloc) => {
        return topRanked.find(
          (s) => `${s.opportunity.protocol}::${s.opportunity.poolName}` === alloc.opportunityId,
        ) ?? topRanked[0];
      }).filter(Boolean) as typeof topRanked;

      const strategyAllocs = recommendedStrategy.allocations.map((a) => a.allocationPercent);

      if (strategyOpportunities.length > 0) {
        simulation = simulatePortfolio(strategyOpportunities, strategyAllocs);
        projectedApyP10 = simulation.portfolioP10;
        projectedApyP90 = simulation.portfolioP90;
        probabilityOfLoss = simulation.portfolioProbabilityOfLoss;
      }
    }

    // 7. Rebalancing signal (only if currentAllocs provided)
    let rebalanceSignal = null;
    if (currentAllocs && recommendedStrategy && currentAllocs.length > 0) {
      rebalanceSignal = bwtyaRebalancer.computeSignal(
        topRanked,
        currentAllocs,
        recommendedStrategy,
      );
    }

    return {
      scoredOpportunities: ranked,
      strategies,
      recommendedStrategy,
      titheAmount,
      yieldAfterTithe,
      projectedApy,
      simulation,
      projectedApyP10,
      projectedApyP90,
      probabilityOfLoss,
      rebalanceSignal,
      timestamp: new Date().toISOString(),
    };
  }
}

export const bwtyaAlgorithm = new BWTYAAlgorithm();
