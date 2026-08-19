// BibleFi – On-chain Wisdom Audit Anchor configuration (Base mainnet)
//
// The audit anchor mirrors every BWSP_/BWTYA_ audit record on-chain so each
// verse hash and approval is independently verifiable.
// "Prove all things; hold fast that which is good" — 1 Thessalonians 5:21

export const AUDIT_ANCHOR_CHAIN_ID = 8453; // Base mainnet only

/** Deployed BibleFiWisdomAuditAnchor address (empty until deployed). */
export const AUDIT_ANCHOR_ADDRESS: string =
  (import.meta.env?.VITE_AUDIT_ANCHOR_ADDRESS as string | undefined)?.trim() ?? '';

export const AUDIT_ANCHOR_ABI = [
  'function anchorRecord(uint8 agent, bytes32 recordHash, bytes32 verseHash, bytes32 eventNameHash, uint64 sequence, uint64 agentTimestamp)',
  'function anchorBatch(uint8[] agents, bytes32[] recordHashes, bytes32[] verseHashes, bytes32[] eventNameHashes, uint64[] sequences, uint64[] agentTimestamps)',
  'function isAnchored(bytes32 recordHash) view returns (bool)',
  'function totalAnchored() view returns (uint256)',
  'function verseRecordCount(bytes32 verseHash) view returns (uint256)',
  'function verseRecords(bytes32 verseHash, uint256 offset, uint256 limit) view returns (bytes32[])',
  'function lastSequence(uint8 agent) view returns (uint64)',
  'function authorisedAnchors(address) view returns (bool)',
] as const;

/** Number of records batched per anchoring transaction. */
export const AUDIT_ANCHOR_BATCH_SIZE = 20;

/** Max milliseconds a record waits before the queue is flushed. */
export const AUDIT_ANCHOR_FLUSH_INTERVAL_MS = 60_000;

export const auditAnchorConfigured = (): boolean =>
  /^0x[0-9a-fA-F]{40}$/.test(AUDIT_ANCHOR_ADDRESS);