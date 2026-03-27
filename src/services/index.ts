
// Re-export all church services
export { searchChurches, joinChurch, getUserChurches, setPrimaryChurch, leaveChurch } from './churchService';
export { getChurchById } from './churchDetailsService';
export { addChurch } from './churchCreationService';
export type { Church } from '@/types/church';

// BWSP – Biblical-Wisdom-Synthesis-Protocol
export * from './bwsp';
export { bwspEngine } from './bwsp/engine';
export { bwspSovereignAgent } from './bwsp/sovereignAgent';
export { bwspRetriever } from './bwsp/retriever';
export { bwspAgentLoop } from './bwsp/agentLoop';
export { marketWisdomCorrelator } from './bwsp/marketWisdomCorrelator';
export { wisdomScoreTracker } from './bwsp/wisdomScoreTracker';

// BWTYA – Biblical-Wisdom-To-Yield-Algorithm
export * from './bwtya';
export { bwtyaAlgorithm } from './bwtya/algorithm';
export { bwtyaScorer } from './bwtya/scorer';
export { bwtyaRanker } from './bwtya/ranker';
export { bwtyaStrategyMapper } from './bwtya/strategyMapper';
export { bwtyaYieldOptimizer } from './bwtya/yieldOptimizer';
