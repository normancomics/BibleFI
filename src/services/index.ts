
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

// BWTYA – Biblical-Wisdom-To-Yield-Algorithm
export * from './bwtya';
export { bwtyaAlgorithm } from './bwtya/algorithm';
export { bwtyaScorer } from './bwtya/scorer';
export { bwtyaRanker } from './bwtya/ranker';
export { bwtyaStrategyMapper } from './bwtya/strategyMapper';
