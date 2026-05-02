// BWTYA – Strategy Mapper
// Maps ranked scored opportunities to 3 named biblical strategies using
// Kelly Criterion allocation weights and Ecclesiastes diversification scoring.

import {
  ecclesiastesDiversificationScore,
  kellyFraction,
  maxDrawdownEstimate,
  normaliseKellyAllocations,
} from './mathEngine';
import type { BWTYAStrategy, ScoredOpportunity, StrategyAllocation } from './types';

// ---------------------------------------------------------------------------
// Strategy definitions
// ---------------------------------------------------------------------------

const STRATEGY_TEMPLATES: Omit<BWTYAStrategy, 'allocations' | 'maxDrawdownEstimate' | 'ecclesiastesDiversificationScore'>[] = [
  {
    id: 'josephs_storehouse',
    name: "Joseph's Storehouse",
    scriptureAnchor: 'Genesis 41:35',
    description:
      'Store up in the good years; preserve capital above all. Prioritises low-risk, ' +
      'stable-yield positions that withstand market downturns — just as Joseph stored ' +
      'grain for seven years of plenty before the famine.',
    riskProfile: 'conservative',
    minWisdomScore: 0,
    titheReservePercent: 10,
  },
  {
    id: 'talents_multiplied',
    name: 'Talents Multiplied',
    scriptureAnchor: 'Matthew 25:29',
    description:
      'Faithful with a little, entrusted with more. A balanced strategy that grows ' +
      'capital steadily across moderate-risk yield positions, mirroring the servant ' +
      'who doubled his master\'s talents through diligent stewardship.',
    riskProfile: 'moderate',
    minWisdomScore: 30,
    titheReservePercent: 10,
  },
  {
    id: 'solomons_portfolio',
    name: "Solomon's Portfolio",
    scriptureAnchor: 'Ecclesiastes 11:2',
    description:
      '"Invest in seven ventures, yes, in eight; you do not know what disaster may come." ' +
      'An advanced, diversified strategy reserved for experienced stewards. Spreads capital ' +
      'across multiple chains and yield types to maximise long-term Kingdom returns.',
    riskProfile: 'advanced',
    minWisdomScore: 70,
    titheReservePercent: 10,
  },
];

// ---------------------------------------------------------------------------
// Kelly-based allocation builder
// ---------------------------------------------------------------------------

/**
 * Builds allocations for a set of top-ranked opportunities using Kelly Criterion
 * weights, capped and normalised to sum to 100 %.
 *
 * For conservative strategies, raw Kelly weights are halved (half-Kelly) to
 * further reduce concentration risk as recommended by biblical prudence:
 * "The wise store up choice food and olive oil" (Proverbs 21:20).
 */
function buildKellyAllocations(
  top: ScoredOpportunity[],
  halfKelly = false,
): StrategyAllocation[] {
  if (top.length === 0) return [];

  const fractions = top.map((s) => {
    const f = kellyFraction(s.bwtyaScore, s.opportunity.apy);
    return halfKelly ? f * 0.5 : f;
  });

  const percents = normaliseKellyAllocations(fractions);

  return top.map((s, i) => ({
    opportunityId: `${s.opportunity.protocol}::${s.opportunity.poolName}`,
    protocol: s.opportunity.protocol,
    poolName: s.opportunity.poolName,
    allocationPercent: percents[i] ?? 0,
    projectedApy: s.opportunity.apy,
    projectedYieldAfterTithe: s.opportunity.apy * 0.9, // 10 % tithe reserved
    stewardshipGrade: s.stewardshipGrade,
  }));
}

// ---------------------------------------------------------------------------
// Per-strategy allocation builders
// ---------------------------------------------------------------------------

function buildConservativeAllocations(top: ScoredOpportunity[]): StrategyAllocation[] {
  // Only take grade A/B picks; fall back to top-1 if none qualify
  const safe = top.filter((s) => s.stewardshipGrade === 'A' || s.stewardshipGrade === 'B');
  const picks = (safe.length > 0 ? safe : top).slice(0, 3);
  // Half-Kelly for maximum capital preservation
  return buildKellyAllocations(picks, true);
}

function buildModerateAllocations(top: ScoredOpportunity[]): StrategyAllocation[] {
  // Full Kelly across top 3 — balanced growth and safety
  return buildKellyAllocations(top.slice(0, 3), false);
}

function buildAdvancedAllocations(top: ScoredOpportunity[]): StrategyAllocation[] {
  // Full Kelly across top 5 — maximum Ecclesiastes diversification
  return buildKellyAllocations(top.slice(0, 5), false);
}

// ---------------------------------------------------------------------------
// Risk metrics helper
// ---------------------------------------------------------------------------

function computeStrategyMetrics(
  allocations: StrategyAllocation[],
  scored: ScoredOpportunity[],
): { maxDrawdown: number; ecc: number } {
  const percents = allocations.map((a) => a.allocationPercent);
  const risks = allocations.map((a) => {
    const match = scored.find(
      (s) => `${s.opportunity.protocol}::${s.opportunity.poolName}` === a.opportunityId,
    );
    return match?.opportunity.riskScore ?? 50;
  });
  return {
    maxDrawdown: maxDrawdownEstimate(percents, risks),
    ecc: ecclesiastesDiversificationScore(percents),
  };
}

// ---------------------------------------------------------------------------
// BWTYAStrategyMapper
// ---------------------------------------------------------------------------

export class BWTYAStrategyMapper {
  map(ranked: ScoredOpportunity[], wisdomScore = 0): BWTYAStrategy[] {
    const strategies: BWTYAStrategy[] = [];

    // Joseph's Storehouse (always available)
    const conservativeAllocs = buildConservativeAllocations(ranked);
    const conservativeMetrics = computeStrategyMetrics(conservativeAllocs, ranked);
    strategies.push({
      ...STRATEGY_TEMPLATES[0],
      allocations: conservativeAllocs,
      maxDrawdownEstimate: conservativeMetrics.maxDrawdown,
      ecclesiastesDiversificationScore: conservativeMetrics.ecc,
    });

    // Talents Multiplied (wisdom ≥ 30)
    if (wisdomScore >= 30) {
      const moderateAllocs = buildModerateAllocations(ranked);
      const moderateMetrics = computeStrategyMetrics(moderateAllocs, ranked);
      strategies.push({
        ...STRATEGY_TEMPLATES[1],
        allocations: moderateAllocs,
        maxDrawdownEstimate: moderateMetrics.maxDrawdown,
        ecclesiastesDiversificationScore: moderateMetrics.ecc,
      });
    }

    // Solomon's Portfolio (wisdom ≥ 70)
    if (wisdomScore >= 70) {
      const advancedAllocs = buildAdvancedAllocations(ranked);
      const advancedMetrics = computeStrategyMetrics(advancedAllocs, ranked);
      strategies.push({
        ...STRATEGY_TEMPLATES[2],
        allocations: advancedAllocs,
        maxDrawdownEstimate: advancedMetrics.maxDrawdown,
        ecclesiastesDiversificationScore: advancedMetrics.ecc,
      });
    }

    return strategies;
  }

  recommendBest(strategies: BWTYAStrategy[], wisdomScore = 0): BWTYAStrategy | null {
    if (strategies.length === 0) return null;
    // Prefer the most sophisticated strategy the user's wisdom unlocks
    const eligible = [...strategies].sort((a, b) => b.minWisdomScore - a.minWisdomScore);
    return eligible.find((s) => wisdomScore >= s.minWisdomScore) ?? strategies[0];
  }
}

export const bwtyaStrategyMapper = new BWTYAStrategyMapper();
