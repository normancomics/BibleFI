// Palantir Foundry / AIP / Ontology Integration — Type Definitions
//
// These types bridge the BibleFI BWSP/BWTYA domain model to
// Palantir's Foundry ontology objects, AIP Action payloads,
// and dataset API responses.
//
// How they map:
//   Scripture      ← biblical_knowledge_base / comprehensive_biblical_texts
//   DeFiPrinciple  ← defi_knowledge_base + biblical_financial_crossref
//   BWTYAScore     ← bwtya_opportunity_scores
//   AgentRun       ← bwsp_query_log + agent_ops
//   Church         ← global_churches (masked)
//   Strategy       ← bwtya_strategy (Joseph | Talents | Solomon profiles)
//   ContractAnchor ← BibleFiBWSP / BWTYAYieldVault on-chain events

import type { BWSPQuery, BWSPSynthesis, ScriptureResult } from '../bwsp/types';
import type { BWTYAResult, ScoredOpportunity } from '../bwtya/types';

// ────────────────────────────────────────────────────────────────────────────
// Foundry Auth & Config
// ────────────────────────────────────────────────────────────────────────────

export interface FoundryConfig {
  /** e.g. "biblefi.palantirfoundry.com" */
  stack: string;
  /** OAuth2 token or service account bearer token */
  token: string;
  /** RID of the BibleFI ontology, e.g. "ri.ontology.main.ontology.biblefi" */
  ontologyRid: string;
  /** RID of the primary multipass workspace (for AIP Logic) */
  workspaceRid?: string;
  /** Optional base URL override for local dev proxy */
  baseUrl?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Foundry Ontology Object Types (matches plan.md §4)
// ────────────────────────────────────────────────────────────────────────────

/** Unique identifiers for each ontology object type registered in Foundry */
export const FOUNDRY_OBJECT_TYPES = {
  SCRIPTURE:      'biblefi.Scripture',
  DEFI_PRINCIPLE: 'biblefi.DeFiPrinciple',
  BWTYA_SCORE:    'biblefi.BWTYAScore',
  AGENT_RUN:      'biblefi.AgentRun',
  CHURCH:         'biblefi.Church',
  STRATEGY:       'biblefi.Strategy',
  KNOWLEDGE_CHUNK:'biblefi.KnowledgeChunk',
  CONTRACT_ANCHOR:'biblefi.ContractAnchor',
} as const;

export type FoundryObjectType = typeof FOUNDRY_OBJECT_TYPES[keyof typeof FOUNDRY_OBJECT_TYPES];

/** Unique identifiers for each ontology link type */
export const FOUNDRY_LINK_TYPES = {
  SCRIPTURE_CITED_BY_CHUNK:   'biblefi.ScriptureCitedByChunk',
  SCRIPTURE_SUPPORTS_DEFI:    'biblefi.ScriptureSupportsDefiPrinciple',
  DEFI_REALIZED_BY_STRATEGY:  'biblefi.DeFiPrincipleRealizedByStrategy',
  STRATEGY_EXECUTED_BY_FN:    'biblefi.StrategyExecutedByContractAnchor',
  AGENT_RUN_PRODUCED_SCORE:   'biblefi.AgentRunProducedBWTYAScore',
  CHURCH_VALIDATED_BY_AGENT:  'biblefi.ChurchValidatedByAgentRun',
} as const;

// ────────────────────────────────────────────────────────────────────────────
// Ontology Object Shapes
// ────────────────────────────────────────────────────────────────────────────

export interface FoundryScriptureObject {
  objectType: typeof FOUNDRY_OBJECT_TYPES.SCRIPTURE;
  primaryKey: string;          // "Book Chapter:Verse" e.g. "Proverbs 3:9"
  reference: string;
  kjvText: string;
  hebrewText?: string;
  greekText?: string;
  aramaicText?: string;
  strongsNumbers: string[];    // e.g. ["H6944", "H1061"]
  financialCategory: string;   // stewardship_and_wisdom | tithing_and_giving | …
  principle: string;
  defiApplication: string;
  financialKeywords: string[];
  verseHash: string;           // djb2 hex — matches BibleFiBWSP.sol concordance key
  embedding?: number[];        // text-embedding-3-large 3072-d (stored in Foundry vector index)
  tripleCheckStatus?: 'passed' | 'failed' | 'pending';
  createdAt: string;
}

export interface FoundryDeFiPrincipleObject {
  objectType: typeof FOUNDRY_OBJECT_TYPES.DEFI_PRINCIPLE;
  primaryKey: string;          // "protocol:topic" slug
  protocol: string;
  topic: string;
  content: string;
  chain: 'base' | 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | string;
  category: string;
  embedding?: number[];
  createdAt: string;
}

export interface FoundryBWTYAScoreObject {
  objectType: typeof FOUNDRY_OBJECT_TYPES.BWTYA_SCORE;
  primaryKey: string;          // "protocol:poolName:chain"
  protocol: string;
  poolName: string;
  chain: string;
  apy: number;
  tvlUsd: number;
  bwtyaScore: number;          // 0–100
  convictionScore: number;
  fruitBearingScore: number;
  faithfulnessScore: number;
  biblicalAlignmentScore: number;
  transparencyScore: number;
  riskAdjustedYield: number;
  kellyWeight: number;
  stewardshipGrade: string;    // A–F
  mlEnhancedScore?: number;    // Foundry AIP-enhanced score (0–100)
  mlConfidence?: number;       // Model confidence for ml_enhanced_score
  scoredAt: string;
}

export interface FoundryAgentRunObject {
  objectType: typeof FOUNDRY_OBJECT_TYPES.AGENT_RUN;
  primaryKey: string;          // UUID from bwsp_query_log.id
  agentName: string;
  walletAddress?: string;
  queryText: string;
  intent: string;
  synthesisMethod: string;
  confidenceScore: number;
  authorityWeightedConfidence: number;
  resonanceScore: number;
  primaryScriptureRef: string;
  processingTimeMs: number;
  bwtyaStrategyId?: string;
  bwtyaProjectedApy?: number;
  tripleCheckPassed: boolean;
  createdAt: string;
}

export interface FoundryChurchObject {
  objectType: typeof FOUNDRY_OBJECT_TYPES.CHURCH;
  primaryKey: string;          // UUID from global_churches.id
  name: string;
  denomination?: string;
  city: string;
  country: string;
  acceptsCrypto: boolean;
  cryptoNetworks: string[];
  verified: boolean;
  // PII fields intentionally omitted — masked view only
}

export interface FoundryStrategyObject {
  objectType: typeof FOUNDRY_OBJECT_TYPES.STRATEGY;
  primaryKey: string;          // strategy id e.g. "joseph-conservative"
  name: string;
  scriptureAnchor: string;
  riskProfile: 'conservative' | 'moderate' | 'advanced';
  minWisdomScore: number;
  titheReservePercent: number;
  projectedApy: number;
  ecclesiastesDiversificationScore: number;
  maxDrawdownEstimate: number;
}

export interface FoundryContractAnchorObject {
  objectType: typeof FOUNDRY_OBJECT_TYPES.CONTRACT_ANCHOR;
  primaryKey: string;          // txHash:logIndex
  contractName: string;        // 'BibleFiBWSP' | 'BWTYAYieldVault' | 'BWSPWisdomRegistry'
  contractAddress: string;
  eventName: string;           // 'BWSP_TripleCheckPassed' | 'BWTYA_YieldDistributed' …
  verseHash?: string;
  blockNumber: number;
  chainId: number;
  createdAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// AIP Action Types (Foundry Actions API v2)
// ────────────────────────────────────────────────────────────────────────────

/** All action types registered in the BibleFI Foundry ontology */
export const FOUNDRY_ACTION_TYPES = {
  /** Run BWSP synthesis against Foundry vector index — returns enhanced BWSPSynthesis */
  BWSP_SYNTHESIZE:         'biblefi.BWSPSynthesizeWisdom',
  /** Score a batch of DeFi opportunities using Foundry AIP ML model */
  BWTYA_SCORE_BATCH:       'biblefi.BWTYAScoreBatch',
  /** Cross-reference a scripture with the DeFi knowledge graph */
  CROSSREF_SCRIPTURE_DEFI: 'biblefi.CrossRefScriptureDefi',
  /** Enrich a church record with denomination and payment metadata */
  ENRICH_CHURCH:           'biblefi.EnrichChurch',
  /** Anchor a BWSP triple-check result to the ContractAnchor object type */
  ANCHOR_TRIPLE_CHECK:     'biblefi.AnchorTripleCheck',
} as const;

export type FoundryActionType = typeof FOUNDRY_ACTION_TYPES[keyof typeof FOUNDRY_ACTION_TYPES];

// AIP Action request/response shapes

export interface BWSPSynthesizeActionRequest {
  actionType: typeof FOUNDRY_ACTION_TYPES.BWSP_SYNTHESIZE;
  parameters: {
    queryText: string;
    intent: string;
    topK: number;           // number of scripture objects to retrieve (default 8)
    walletAddress?: string;
    wisdomScore?: number;
    riskTolerance?: string;
  };
}

export interface BWSPSynthesizeActionResponse {
  enhancedGuidance: string;
  enhancedPrinciple: string;
  retrievedScriptures: Array<{
    reference: string;
    text: string;
    similarity: number;
    strongsMatches: string[];
  }>;
  aipConfidence: number;       // 0–1 AIP model confidence
  foundryModelVersion: string;
  processingTokens: number;
}

export interface BWTYAScoreBatchActionRequest {
  actionType: typeof FOUNDRY_ACTION_TYPES.BWTYA_SCORE_BATCH;
  parameters: {
    opportunities: Array<{
      protocol: string;
      poolName: string;
      chain: string;
      apy: number;
      tvlUsd: number;
      riskScore: number;
      audited: boolean;
      isVerified: boolean;
    }>;
    wisdomScore?: number;
    capitalUsd?: number;
  };
}

export interface BWTYAScoreBatchActionResponse {
  mlScores: Array<{
    protocol: string;
    poolName: string;
    mlEnhancedScore: number;   // 0–100
    mlConfidence: number;      // 0–1
    anomalyFlags: string[];
    marketRegimeLabel: string; // 'bull' | 'bear' | 'sideways'
  }>;
  portfolioInsight: string;    // AIP-generated portfolio narrative
  foundryModelVersion: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Foundry Dataset API types
// ────────────────────────────────────────────────────────────────────────────

export interface FoundryDatasetRow {
  [key: string]: unknown;
}

export interface FoundryDatasetPage<T = FoundryDatasetRow> {
  data: T[];
  nextPageToken?: string;
  totalCount?: number;
}

export interface FoundryObjectPage<T = Record<string, unknown>> {
  data: T[];
  nextPageToken?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Sync manifest (what the edge function tracks)
// ────────────────────────────────────────────────────────────────────────────

export interface FoundrySyncManifest {
  database: 'biblical_wisdom' | 'church_directory' | 'defi_opportunities' | 'agent_runs';
  objectType: FoundryObjectType;
  lastSyncedAt: string;
  rowsSynced: number;
  errors: string[];
}
