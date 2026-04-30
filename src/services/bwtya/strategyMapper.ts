// BWTYA – Strategy Mapper
// Maps ranked scored opportunities to 3 named biblical strategies

import type { BWTYAStrategy, ScoredOpportunity, StrategyAllocation } from './types';

// ---------------------------------------------------------------------------
// Strategy definitions
// ---------------------------------------------------------------------------

const STRATEGY_TEMPLATES: Omit<BWTYAStrategy, 'allocations'>[] = [
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
// Allocation builder helpers
// ---------------------------------------------------------------------------

function toAllocation(scored: ScoredOpportunity, allocationPercent: number): StrategyAllocation {
  return {
    opportunityId: `${scored.opportunity.protocol}::${scored.opportunity.poolName}`,
    protocol: scored.opportunity.protocol,
    poolName: scored.opportunity.poolName,
    allocationPercent,
    projectedApy: scored.opportunity.apy,
    projectedYieldAfterTithe: scored.opportunity.apy * 0.9, // 10% tithe reserved
    stewardshipGrade: scored.stewardshipGrade,
  };
}

function buildConservativeAllocations(top: ScoredOpportunity[]): StrategyAllocation[] {
  // Take up to 3 lowest-risk, grade A/B opportunities; equal weight
  const safe = top.filter((s) => s.stewardshipGrade === 'A' || s.stewardshipGrade === 'B');
  const picks = safe.slice(0, 3);
  if (picks.length === 0) return top.slice(0, 1).map((s) => toAllocation(s, 100));

  const weight = Math.floor(100 / picks.length);
  const remainder = 100 - weight * picks.length;
  return picks.map((s, i) => toAllocation(s, i === 0 ? weight + remainder : weight));
}

function buildModerateAllocations(top: ScoredOpportunity[]): StrategyAllocation[] {
  // 60 / 30 / 10 split across top 3
  const picks = top.slice(0, 3);
  const weights = [60, 30, 10];
  return picks.map((s, i) => toAllocation(s, weights[i] ?? 10));
}

function buildAdvancedAllocations(top: ScoredOpportunity[]): StrategyAllocation[] {
  // Up to 5 positions; roughly equal split
  const picks = top.slice(0, 5);
  const base = Math.floor(100 / picks.length);
  const remainder = 100 - base * picks.length;
  return picks.map((s, i) => toAllocation(s, i === 0 ? base + remainder : base));
}

// ---------------------------------------------------------------------------
// BWTYAStrategyMapper
// ---------------------------------------------------------------------------

export class BWTYAStrategyMapper {
  map(ranked: ScoredOpportunity[], wisdomScore = 0): BWTYAStrategy[] {
    const strategies: BWTYAStrategy[] = [];

    // Joseph's Storehouse (always available)
    strategies.push({
      ...STRATEGY_TEMPLATES[0],
      allocations: buildConservativeAllocations(ranked),
    });

    // Talents Multiplied (wisdom ≥ 30)
    if (wisdomScore >= 30) {
      strategies.push({
        ...STRATEGY_TEMPLATES[1],
        allocations: buildModerateAllocations(ranked),
      });
    }

    // Solomon's Portfolio (wisdom ≥ 70)
    if (wisdomScore >= 70) {
      strategies.push({
        ...STRATEGY_TEMPLATES[2],
        allocations: buildAdvancedAllocations(ranked),
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
