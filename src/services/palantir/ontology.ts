// Palantir Foundry Ontology — Static Definitions
//
// This file is the single source of truth for all ontology object types,
// link types, action types, and dataset RIDs used in the BibleFI ↔ Foundry
// integration.  Update these constants whenever the Foundry ontology is
// changed in the Palantir workspace.
//
// Corresponds to plan.md §4 "Ontology mapping".

import { FOUNDRY_OBJECT_TYPES, FOUNDRY_LINK_TYPES, FOUNDRY_ACTION_TYPES } from './types';

// ────────────────────────────────────────────────────────────────────────────
// Dataset RIDs (update after first ingest in Foundry)
// ────────────────────────────────────────────────────────────────────────────

export const FOUNDRY_DATASET_RIDS = {
  /** D1 – BibleFI knowledge dossier (Markdown) */
  KNOWLEDGE_DOSSIER:    'ri.foundry.main.dataset.biblefi-knowledge-dossier',
  /** D2 – Financial scriptures (TS → JSONL export) */
  SCRIPTURES_FINANCIAL: 'ri.foundry.main.dataset.biblefi-scriptures-financial',
  /** D3 – Comprehensive biblical texts (Supabase CDC) */
  SCRIPTURES_MULTI:     'ri.foundry.main.dataset.biblefi-scriptures-multilang',
  /** D4 – DeFi knowledge base (Supabase CDC + live data) */
  DEFI_KNOWLEDGE:       'ri.foundry.main.dataset.biblefi-defi-knowledge',
  /** D5 – BWSP/BWTYA framework spec (Markdown + TypeScript) */
  BWSP_SPEC:            'ri.foundry.main.dataset.biblefi-bwsp-spec',
  /** D6 – Smart contracts (Solidity source) */
  CONTRACTS:            'ri.foundry.main.dataset.biblefi-contracts',
  /** D7 – Agent runtime telemetry (Supabase CDC) */
  AGENT_TELEMETRY:      'ri.foundry.main.dataset.biblefi-agent-telemetry',
  /** D8 – Church directory (masked, Supabase CDC) */
  CHURCHES:             'ri.foundry.main.dataset.biblefi-churches',
} as const;

// ────────────────────────────────────────────────────────────────────────────
// Ontology refresh cadence (seconds) — mirrors plan.md §2
// ────────────────────────────────────────────────────────────────────────────

export const FOUNDRY_REFRESH_CADENCE_SECONDS = {
  [FOUNDRY_DATASET_RIDS.KNOWLEDGE_DOSSIER]:    0,         // manual
  [FOUNDRY_DATASET_RIDS.SCRIPTURES_FINANCIAL]: 3_600,     // hourly
  [FOUNDRY_DATASET_RIDS.SCRIPTURES_MULTI]:     3_600,     // hourly
  [FOUNDRY_DATASET_RIDS.DEFI_KNOWLEDGE]:       1_800,     // 30 min
  [FOUNDRY_DATASET_RIDS.BWSP_SPEC]:            0,         // on commit
  [FOUNDRY_DATASET_RIDS.CONTRACTS]:            0,         // on commit
  [FOUNDRY_DATASET_RIDS.AGENT_TELEMETRY]:      900,       // 15 min
  [FOUNDRY_DATASET_RIDS.CHURCHES]:             3_600,     // hourly
} as const;

// ────────────────────────────────────────────────────────────────────────────
// Ontology graph (object types + link types)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Full ontology graph definition.
 *
 * Visual:
 *
 *   KnowledgeChunk ──belongs_to──▶ KnowledgeDocument ──belongs_to──▶ KnowledgeDataset
 *   Scripture      ──cited_by────▶ KnowledgeChunk
 *   Scripture      ──supports────▶ DeFiPrinciple
 *   DeFiPrinciple  ──realized_by─▶ Strategy (Joseph | Talents | Solomon)
 *   Strategy       ──executed_by─▶ ContractAnchor (BWTYACore.sol)
 *   AgentRun       ──produced────▶ BWTYAScore | KnowledgeChunk
 *   Church         ──validated_by▶ AgentRun
 */
export const ONTOLOGY_GRAPH = {
  objectTypes: {
    Scripture:       { apiName: FOUNDRY_OBJECT_TYPES.SCRIPTURE,       primaryKeyProperty: 'reference' },
    DeFiPrinciple:   { apiName: FOUNDRY_OBJECT_TYPES.DEFI_PRINCIPLE,  primaryKeyProperty: 'primaryKey' },
    BWTYAScore:      { apiName: FOUNDRY_OBJECT_TYPES.BWTYA_SCORE,     primaryKeyProperty: 'primaryKey' },
    AgentRun:        { apiName: FOUNDRY_OBJECT_TYPES.AGENT_RUN,       primaryKeyProperty: 'primaryKey' },
    Church:          { apiName: FOUNDRY_OBJECT_TYPES.CHURCH,          primaryKeyProperty: 'primaryKey' },
    Strategy:        { apiName: FOUNDRY_OBJECT_TYPES.STRATEGY,        primaryKeyProperty: 'primaryKey' },
    KnowledgeChunk:  { apiName: FOUNDRY_OBJECT_TYPES.KNOWLEDGE_CHUNK, primaryKeyProperty: 'id' },
    ContractAnchor:  { apiName: FOUNDRY_OBJECT_TYPES.CONTRACT_ANCHOR, primaryKeyProperty: 'primaryKey' },
  },

  linkTypes: {
    ScriptureCitedByChunk:    { apiName: FOUNDRY_LINK_TYPES.SCRIPTURE_CITED_BY_CHUNK,   from: 'Scripture',      to: 'KnowledgeChunk',  cardinality: 'ONE_TO_MANY' },
    ScriptureSupportsDefi:    { apiName: FOUNDRY_LINK_TYPES.SCRIPTURE_SUPPORTS_DEFI,    from: 'Scripture',      to: 'DeFiPrinciple',   cardinality: 'MANY_TO_MANY' },
    DeFiRealizedByStrategy:   { apiName: FOUNDRY_LINK_TYPES.DEFI_REALIZED_BY_STRATEGY,  from: 'DeFiPrinciple',  to: 'Strategy',        cardinality: 'MANY_TO_MANY' },
    StrategyExecutedByAnchor: { apiName: FOUNDRY_LINK_TYPES.STRATEGY_EXECUTED_BY_FN,    from: 'Strategy',       to: 'ContractAnchor',  cardinality: 'ONE_TO_MANY' },
    AgentRunProducedScore:    { apiName: FOUNDRY_LINK_TYPES.AGENT_RUN_PRODUCED_SCORE,   from: 'AgentRun',       to: 'BWTYAScore',      cardinality: 'ONE_TO_MANY' },
    ChurchValidatedByAgent:   { apiName: FOUNDRY_LINK_TYPES.CHURCH_VALIDATED_BY_AGENT,  from: 'Church',         to: 'AgentRun',        cardinality: 'MANY_TO_MANY' },
  },
} as const;

// ────────────────────────────────────────────────────────────────────────────
// AIP Action definitions (registered in Foundry workspace)
// ────────────────────────────────────────────────────────────────────────────

export const AIP_ACTIONS = {
  /**
   * BWSPSynthesizeWisdom
   * ────────────────────
   * Input:  queryText, intent, topK, walletAddress?, wisdomScore?, riskTolerance?
   * Output: enhancedGuidance, enhancedPrinciple, retrievedScriptures[], aipConfidence
   *
   * Pipeline (runs inside Foundry AIP Logic):
   *   1. Embed queryText with text-embedding-3-large
   *   2. Retrieve top-K Scripture objects from vector index (cosine similarity)
   *   3. Re-rank by authority weight (canonical book weight × Strong's overlap × cosine)
   *   4. Enforce BWSP triple-check: ≥1 primary + ≥2 supporting scriptures
   *   5. Send to Claude / GPT-4o with 3500-token cap and system prompt from BWSP spec
   *   6. Return structured JSON synthesis
   */
  BWSP_SYNTHESIZE: {
    apiName: FOUNDRY_ACTION_TYPES.BWSP_SYNTHESIZE,
    requiredParams: ['queryText', 'intent', 'topK'],
    optionalParams: ['walletAddress', 'wisdomScore', 'riskTolerance'],
    outputFields: ['enhancedGuidance', 'enhancedPrinciple', 'retrievedScriptures', 'aipConfidence', 'foundryModelVersion', 'processingTokens'],
  },

  /**
   * BWTYAScoreBatch
   * ───────────────
   * Input:  opportunities[], wisdomScore?, capitalUsd?
   * Output: mlScores[], portfolioInsight, foundryModelVersion
   *
   * Pipeline:
   *   1. Load opportunities into Foundry transaction
   *   2. Run gradient-boosted scoring model (trained on historical Base chain yield data)
   *   3. Detect market regime (bull/bear/sideways) from live DeFi knowledge objects
   *   4. Fuse ML score with deterministic BWTYA score (weighted average)
   *   5. Flag anomalies (rug-pull risk, sudden TVL drop, APY spike)
   *   6. Generate portfolio narrative via AIP
   */
  BWTYA_SCORE_BATCH: {
    apiName: FOUNDRY_ACTION_TYPES.BWTYA_SCORE_BATCH,
    requiredParams: ['opportunities'],
    optionalParams: ['wisdomScore', 'capitalUsd'],
    outputFields: ['mlScores', 'portfolioInsight', 'foundryModelVersion'],
  },

  /**
   * CrossRefScriptureDefi
   * ─────────────────────
   * Links Scripture objects to DeFiPrinciple objects based on semantic
   * similarity — powers the biblical_financial_crossref table sync.
   */
  CROSSREF_SCRIPTURE_DEFI: {
    apiName: FOUNDRY_ACTION_TYPES.CROSSREF_SCRIPTURE_DEFI,
    requiredParams: ['scriptureReference'],
    optionalParams: ['threshold'],
    outputFields: ['linkedPrinciples', 'linkCount'],
  },

  /**
   * AnchorTripleCheck
   * ──────────────────
   * Records a BWSP triple-check result as a ContractAnchor object,
   * linked to the originating AgentRun — provides Foundry-side audit trail.
   */
  ANCHOR_TRIPLE_CHECK: {
    apiName: FOUNDRY_ACTION_TYPES.ANCHOR_TRIPLE_CHECK,
    requiredParams: ['agentRunId', 'verseHash', 'txHash', 'blockNumber', 'chainId'],
    optionalParams: [],
    outputFields: ['anchorObjectKey'],
  },
} as const;

// ────────────────────────────────────────────────────────────────────────────
// Retrieval contract for BWSP/BWTYA (plan.md §6)
// ────────────────────────────────────────────────────────────────────────────

export const BWSP_RETRIEVAL_CONTRACT = {
  /** Number of Scripture objects to retrieve per query */
  SCRIPTURE_TOP_K:      8,
  /** Number of DeFiPrinciple objects to retrieve per query */
  DEFI_PRINCIPLE_TOP_K: 8,
  /** Hard cap on prompt tokens sent to AIP model */
  MAX_PROMPT_TOKENS:    3_500,
  /** Minimum primary scriptures required (triple-check §3) */
  MIN_PRIMARY:          1,
  /** Minimum supporting scriptures required (anti-cherry-picking) */
  MIN_SUPPORTING:       2,
  /** Authority re-ranking weights by biblical canon grouping */
  AUTHORITY_WEIGHTS: {
    torah:       1.20,  // Genesis–Deuteronomy
    wisdom:      1.35,  // Proverbs, Ecclesiastes, Job, Psalms
    prophets:    1.10,
    gospels:     1.30,
    epistles:    1.20,
    revelation:  1.05,
  },
} as const;

// ────────────────────────────────────────────────────────────────────────────
// Chunker config (plan.md §3) — for reference; consumed by AIP TaskManager
// ────────────────────────────────────────────────────────────────────────────

export const CHUNKER_CONFIG = {
  MARKDOWN: {
    strategy: 'markdown_header_aware',
    chunkSize:  1_200,  // tokens
    overlap:      150,
    splitOn:    ['H2', 'H3'],
  },
  SCRIPTURE: {
    strategy:  'one_verse_per_chunk',  // NEVER split a verse
    fields:    ['reference', 'kjvText', 'hebrewText', 'greekText', 'aramaicText', 'strongsNumbers', 'principle', 'defiApplication', 'category'],
  },
  DEFI: {
    strategy: 'semantic_paragraph',
    chunkSize:  800,
    overlap:    100,
    groupBy:  ['protocol', 'topic'],
  },
  SOLIDITY: {
    strategy: 'code_symbol_aware',   // one chunk per contract / function / modifier
    keepNatSpec: true,
    keepScriptureComment: true,
  },
  AGENT_TELEMETRY: {
    strategy: 'event_window',
    windowHours: 1,
    aggregateBy: 'agent_name',
  },
  CHURCH: {
    strategy: 'row_per_chunk',
    fieldOrder: ['name', 'denomination', 'city', 'country', 'acceptsCrypto', 'cryptoNetworks', 'verified'],
  },
} as const;
