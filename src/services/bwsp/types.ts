// BWSP – Biblical-Wisdom-Synthesis-Protocol · Type Definitions

export type BWSPQueryIntent =
  | 'yield_advice'
  | 'risk_assessment'
  | 'tithe_guidance'
  | 'stewardship_principle'
  | 'defi_action'
  | 'tax_wisdom'
  | 'general_wisdom';

export interface BWSPQuery {
  text: string;
  intent?: BWSPQueryIntent;
  walletAddress?: string;
  wisdomScore?: number;
  availableCapital?: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}

export interface ScriptureResult {
  reference: string;
  text: string;
  principle: string;
  defiApplication: string;
  category: string;
  similarity?: number;
}

export interface DefiKnowledgeResult {
  topic: string;
  content: string;
  protocol?: string;
  similarity?: number;
}

export interface YieldOpportunity {
  protocol: string;
  poolName: string;
  tokenSymbol: string;
  chain: string;
  apy: number;
  tvlUsd: number;
  riskScore: number; // 0–100 (lower = safer)
  category: string;
  biblicalAlignment: string;
  isVerified?: boolean;
  audited?: boolean;
  transparent?: boolean;
}

export interface DeFiPosition {
  protocol: string;
  value: number;
  apy: number;
  chain: string;
}

export interface MarketContext {
  fearGreedIndex: number;
  fearGreedLabel: string;
  biblicalSentiment: string;
  topProtocols: Array<{
    name: string;
    tvl: number;
    apy: number;
    chain: string;
    riskLevel: string;
    biblicalAlignment: string;
  }>;
  lastUpdated: string;
}

export interface BWSPContext {
  scriptures: ScriptureResult[];
  defiKnowledge: DefiKnowledgeResult[];
  marketContext: MarketContext;
  query: BWSPQuery;
}

export interface BWSPSynthesis {
  guidance: string;
  principle: string;
  action: string;
  primaryScripture: ScriptureResult;
  supportingScriptures: ScriptureResult[];
  confidenceScore: number;
  synthesisMethod: 'rag_vector' | 'offline_fallback' | 'hybrid';
  protocol: string;
  tokenCount?: number;
  // Advanced BWSP math outputs
  resonanceScore: number;                // 0–1 offline scripture resonance (cosine-like)
  authorityWeightedResonance: number;    // 0–1 resonance adjusted by biblical book authority
  wisdomDecayFactor: number;             // 0–1 how much the user's wisdom has decayed
  titheBlessingMultiplier: number;       // 1.0–1.5 consecutive tithe months blessing
}

export interface BWSPResponse {
  query: BWSPQuery;
  context: BWSPContext;
  synthesis: BWSPSynthesis;
  agentSteps: AgentStep[];
  processingTimeMs: number;
  timestamp: string;
  // Convenience accessors (duplicated from synthesis for easy UI access)
  wisdomGuidance: string;
  financialPrinciple: string;
  actionableInsight: string;
  primaryScripture: ScriptureResult;
  supportingScriptures: ScriptureResult[];
  confidenceScore: number;
  // Intent analysis
  intentConfidence: number;   // TF-IDF confidence for detected intent (0–1)
  secondaryIntent: BWSPQueryIntent | null;
  // Authority-weighted confidence (book-weighted resonance used in final score)
  authorityWeightedConfidence: number; // 0–1
}

export interface AgentStep {
  stepNumber: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  output?: string;
  error?: string;
}
