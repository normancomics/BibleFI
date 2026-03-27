// BWTYA – Biblical-Wisdom-To-Yield-Algorithm · Type Definitions

import type { YieldOpportunity } from '../bwsp/types';

export type { YieldOpportunity };

export type StewardshipGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoredOpportunity {
  opportunity: YieldOpportunity;
  // Raw dimension scores
  fruitBearingScore: number;      // John 15:16  – 0–30
  faithfulnessScore: number;      // Matthew 25:14 – 0–25
  biblicalAlignmentScore: number; // Proverbs 3:9  – 0–25
  transparencyScore: number;      // Luke 16:10   – 0–20
  // Composite
  bwtyaScore: number;             // 0–100
  stewardshipGrade: StewardshipGrade;
  warningFlags: string[];
  biblicalRationale: string;
}

export interface StrategyAllocation {
  opportunityId: string; // protocol + poolName
  protocol: string;
  poolName: string;
  allocationPercent: number;
  projectedApy: number;
  projectedYieldAfterTithe: number;
  stewardshipGrade: StewardshipGrade;
}

export interface BWTYAStrategy {
  id: string;
  name: string;
  scriptureAnchor: string;
  description: string;
  riskProfile: 'conservative' | 'moderate' | 'advanced';
  minWisdomScore: number;
  titheReservePercent: number;
  allocations: StrategyAllocation[];
}

export interface BWTYAInput {
  opportunities: YieldOpportunity[];
  wisdomScore?: number;
  capitalUsd?: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}

export interface BWTYAResult {
  scoredOpportunities: ScoredOpportunity[];
  strategies: BWTYAStrategy[];
  recommendedStrategy: BWTYAStrategy;
  titheAmount: number;
  yieldAfterTithe: number;
  projectedApy: number;
  timestamp: string;
}
