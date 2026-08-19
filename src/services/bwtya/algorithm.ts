// BWTYA – Algorithm
// Full pipeline: score → rank → Pareto filter → map strategies → Monte Carlo simulate → rebalance signal

import { wisdomAuditTrail } from '../audit/wisdomAuditTrail';

import { bwtyaRanker } from './ranker';
import { bwtyaRebalancer } from './rebalancer';
import { bwtyaScorer } from './scorer';
import { simulatePortfolio } from './simulator';
import { bwtyaStrategyMapper } from './strategyMapper';
import type { BWTYAInput, BWTYAResult } from './types';

// ---------------------------------------------------------------------------
// BWSP execution gate – BWTYA may only execute after BWSP approval
// ---------------------------------------------------------------------------

function evaluateGate(approval: BWTYAInput['bwspApproval']): BWTYAResult['executionGate'] {
  if (!approval) {
    return {
      permitted: false,
      reason:
        'Advisory-only: no BWSP triple-check attached. "Prove all things; hold fast that which is good" (1 Thessalonians 5:21).',
      verseHash: null,
      capitalScalar: 0,
    };
  }
  if (approval.verdict === 'quarantined') {
    return {
      permitted: false,
      reason: `BWSP quarantined this wisdom (score ${approval.compositeScore.toFixed(2)}). Execution blocked.`,
      verseHash: approval.verseHash,
      capitalScalar: 0,
    };
  }
  if (approval.verdict === 'flagged') {
    return {
      permitted: true,
      reason: `BWSP flagged minor concerns (score ${approval.compositeScore.toFixed(2)}). Deploy at half conviction.`,
      verseHash: approval.verseHash,
      capitalScalar: 0.5,
    };
  }
  return {
    permitted: true,
    reason: `BWSP approved (score ${approval.compositeScore.toFixed(2)}, verse ${approval.verseHash}).`,
    verseHash: approval.verseHash,
    capitalScalar: 1,
  };
}

export class BWTYAAlgorithm {
  run(input: BWTYAInput): BWTYAResult {
    const { opportunities, wisdomScore = 0, currentAllocs, bwspApproval } = input;

    // 0. BWSP gate — scales deployable capital before any projection is made
    const executionGate = evaluateGate(bwspApproval);
    const capitalUsd = (input.capitalUsd ?? 0) * (executionGate.capitalScalar || 1);

    // Auditability mandate: every gate decision emits verse hash + timestamp
    wisdomAuditTrail.emit({
      event: executionGate.permitted ? 'BWTYA_ExecutionGateEvaluated' : 'BWTYA_ExecutionBlocked',
      verseHash: executionGate.verseHash,
      summary: executionGate.reason,
      data: {
        verdict: bwspApproval?.verdict ?? 'none',
        compositeScore: bwspApproval?.compositeScore ?? 0,
        capitalScalar: executionGate.capitalScalar,
        capitalUsd,
        wisdomScore,
      },
    });

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
      executionGate,
      timestamp: new Date().toISOString(),
    };
  }
}

export const bwtyaAlgorithm = new BWTYAAlgorithm();
