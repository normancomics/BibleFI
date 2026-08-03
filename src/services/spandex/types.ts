// Spandex ↔ BWTYA/BWSP Integration – Type Definitions
//
// "The integrity of the upright guides them." – Proverbs 11:3

import type { YieldOpportunity } from '@/services/bwsp/types';
import type { ScoredOpportunity, BWTYAStrategy } from '@/services/bwtya/types';
import type { BWSPResponse } from '@/services/bwsp/types';

// ---------------------------------------------------------------------------
// Raw quote coming out of spanDEX
// ---------------------------------------------------------------------------

export interface SpandexRawQuote {
  provider: string;
  outputAmountRaw: bigint;
  outputAmount: string;
  gasEstimate?: string;
  priceImpact?: string;
}

// ---------------------------------------------------------------------------
// A Spandex quote enriched with BWTYA scoring
// ---------------------------------------------------------------------------

export interface SpandexScoredQuote {
  /** The original Spandex provider result */
  raw: SpandexRawQuote;
  /** The YieldOpportunity representation used by BWTYA */
  opportunity: YieldOpportunity;
  /** Full BWTYA dimensional scoring */
  scored: ScoredOpportunity;
  /** Whether this provider is BWTYA-recommended (highest score) */
  isBWTYARecommended: boolean;
  /** Whether this provider is best-price (highest outputAmount) */
  isBestPrice: boolean;
  /** Biblical route policy pass/fail status */
  biblicalPolicyPass: boolean;
  /** If policy fails, the exact reasons */
  policyReasons: string[];
}

export type CompetitiveBenchmarkVerdict =
  | 'outperforming'
  | 'competitive'
  | 'caution'
  | 'blocked';

export interface SpandexCompetitiveBenchmark {
  benchmarkedAgainst: 'bankr.bot';
  bwtyaProvider: string;
  bestPriceProvider: string;
  /** BWTYA output delta vs best price, in bps (negative means less output) */
  outputDeltaBps: number;
  /** The "cost" of biblical alignment when choosing stewardship over raw price */
  stewardshipPremiumBps: number;
  /** Composite 0–100 competitiveness score */
  competitivenessScore: number;
  biblicalPolicyPass: boolean;
  verdict: CompetitiveBenchmarkVerdict;
  summary: string;
}

// ---------------------------------------------------------------------------
// Input parameters for the Spandex swap agent
// ---------------------------------------------------------------------------

export interface SpandexSwapAdvisoryInput {
  fromToken: string;          // symbol, e.g. "ETH"
  toToken: string;            // symbol, e.g. "USDC"
  fromTokenAddress: string;   // checksummed 0x address
  toTokenAddress: string;
  inputAmountHuman: string;   // e.g. "1.5"
  inputAmountRaw: bigint;
  chainId?: number;           // defaults to 8453 (Base)
  slippageBps?: number;
  swapperAccount: string;
  wisdomScore?: number;
  capitalUsd?: number;
  autonomousSabbath?: boolean;
}

// ---------------------------------------------------------------------------
// Full advisory result returned by SpandexSwapAgent
// ---------------------------------------------------------------------------

export interface SpandexSwapAdvisoryResult {
  /** All providers scored by BWTYA, sorted by BWTYA score DESC */
  scoredQuotes: SpandexScoredQuote[];
  /** Provider with highest BWTYA score */
  bwtyaRecommended: SpandexScoredQuote | null;
  /** Provider with highest outputAmount */
  bestPrice: SpandexScoredQuote | null;
  /** Whether the BWTYA pick matches the best-price pick */
  alignedWithBestPrice: boolean;
  /** BWTYA strategy recommended given current wisdom score */
  recommendedStrategy: BWTYAStrategy | null;
  /** Competitiveness benchmark against bankr.bot-style best-price routing */
  competitiveBenchmark: SpandexCompetitiveBenchmark | null;
  /** BWSP biblical wisdom synthesis for this specific swap */
  bwspWisdom: BWSPResponse | null;
  /** ISO timestamp */
  timestamp: string;
  /** Agent run metadata (sandbox) */
  sandbox: {
    agentName: string;
    runId: string | null;
    durationMs: number;
    providersEvaluated: number;
  };
  autonomousExecution: {
    enabled: boolean;
    triggeredAt: string;
    cadenceMinutes: number;
  } | null;
}

// ---------------------------------------------------------------------------
// Spandex provider knowledge (audit/TVL/alignment metadata)
// ---------------------------------------------------------------------------

export interface SpandexProviderProfile {
  name: string;
  displayName: string;
  tvlUsd: number;
  riskScore: number;       // 0–100 lower = safer
  audited: boolean;
  isVerified: boolean;
  transparent: boolean;
  biblicalAlignment: string;
}
