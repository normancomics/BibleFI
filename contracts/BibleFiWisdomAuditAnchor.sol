// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BibleFiWisdomAuditAnchor
 * @notice On-chain anchor for every BWSP / BWTYA audit record.
 *
 * @dev Workspace mandate: "All agent actions must emit full verse hash +
 *      timestamp for auditability." The off-chain Wisdom Audit Trail is an
 *      append-only log; this contract mirrors each record 1:1 on Base so the
 *      trail is tamper-evident and independently verifiable.
 *
 *      Only the sovereign agent gateway (authorised anchors) may write, and
 *      each recordHash may be anchored exactly once.
 *
 * "Moreover it is required in stewards, that a man be found faithful."
 * — 1 Corinthians 4:2
 */
contract BibleFiWisdomAuditAnchor is Ownable2Step, ReentrancyGuard {
    // ============================================================
    // Types
    // ============================================================

    enum Agent { BWSP, BWTYA }

    struct Anchor {
        bytes32 recordHash;    // keccak256 of the off-chain audit record digest
        bytes32 verseHash;     // Scripture anchor (0x0 = unanchored action)
        bytes32 eventNameHash; // keccak256 of the Solidity-style event name
        Agent   agent;
        uint64  agentTimestamp; // timestamp reported by the sovereign agent
        uint64  blockTimestamp; // block.timestamp at anchoring
        uint64  sequence;       // monotonic index inside the agent's trail
    }

    // ============================================================
    // State
    // ============================================================

    /// @dev Addresses permitted to anchor records (sovereign agent gateway).
    mapping(address => bool) public authorisedAnchors;

    /// @dev recordHash → anchor (immutable once written).
    mapping(bytes32 => Anchor) public anchors;

    /// @dev verseHash → recordHashes anchored against that Scripture.
    mapping(bytes32 => bytes32[]) public recordsByVerse;

    /// @dev Ordered list of every anchored recordHash.
    bytes32[] public allRecordHashes;

    /// @dev Highest sequence anchored per agent — detects gaps in the trail.
    mapping(Agent => uint64) public lastSequence;

    // ============================================================
    // Events
    // ============================================================

    event BWSP_AuditAnchored(
        bytes32 indexed recordHash,
        bytes32 indexed verseHash,
        bytes32 indexed eventNameHash,
        uint64  sequence,
        uint64  agentTimestamp,
        uint64  blockTimestamp
    );

    event BWTYA_AuditAnchored(
        bytes32 indexed recordHash,
        bytes32 indexed verseHash,
        bytes32 indexed eventNameHash,
        uint64  sequence,
        uint64  agentTimestamp,
        uint64  blockTimestamp
    );

    event AnchorAuthorised(address indexed anchor, bool allowed);

    // ============================================================
    // Errors
    // ============================================================

    error Unauthorised();
    error AlreadyAnchored(bytes32 recordHash);
    error EmptyRecordHash();
    error LengthMismatch();
    error ZeroAddress();

    // ============================================================
    // Modifiers
    // ============================================================

    modifier onlyAnchor() {
        if (!authorisedAnchors[msg.sender] && msg.sender != owner()) revert Unauthorised();
        _;
    }

    constructor(address initialAnchor) {
        if (initialAnchor != address(0)) {
            authorisedAnchors[initialAnchor] = true;
            emit AnchorAuthorised(initialAnchor, true);
        }
    }

    // ============================================================
    // Admin
    // ============================================================

    /// @notice Authorise (or revoke) a sovereign agent gateway address.
    function setAuthorisedAnchor(address anchor, bool allowed) external onlyOwner {
        if (anchor == address(0)) revert ZeroAddress();
        authorisedAnchors[anchor] = allowed;
        emit AnchorAuthorised(anchor, allowed);
    }

    // ============================================================
    // Anchoring (checks → effects → interactions; no external calls)
    // ============================================================

    /// @notice Anchor a single BWSP/BWTYA audit record.
    function anchorRecord(
        Agent agent,
        bytes32 recordHash,
        bytes32 verseHash,
        bytes32 eventNameHash,
        uint64 sequence,
        uint64 agentTimestamp
    ) public nonReentrant onlyAnchor {
        _anchor(agent, recordHash, verseHash, eventNameHash, sequence, agentTimestamp);
    }

    /// @notice Anchor a batch of audit records in one transaction (gas-efficient hourly flush).
    function anchorBatch(
        Agent[] calldata agentsIn,
        bytes32[] calldata recordHashes,
        bytes32[] calldata verseHashes,
        bytes32[] calldata eventNameHashes,
        uint64[] calldata sequences,
        uint64[] calldata agentTimestamps
    ) external nonReentrant onlyAnchor {
        uint256 len = recordHashes.length;
        if (
            agentsIn.length != len ||
            verseHashes.length != len ||
            eventNameHashes.length != len ||
            sequences.length != len ||
            agentTimestamps.length != len
        ) revert LengthMismatch();

        for (uint256 i; i < len; ++i) {
            _anchor(
                agentsIn[i],
                recordHashes[i],
                verseHashes[i],
                eventNameHashes[i],
                sequences[i],
                agentTimestamps[i]
            );
        }
    }

    function _anchor(
        Agent agent,
        bytes32 recordHash,
        bytes32 verseHash,
        bytes32 eventNameHash,
        uint64 sequence,
        uint64 agentTimestamp
    ) internal {
        if (recordHash == bytes32(0)) revert EmptyRecordHash();
        if (anchors[recordHash].recordHash != bytes32(0)) revert AlreadyAnchored(recordHash);

        anchors[recordHash] = Anchor({
            recordHash: recordHash,
            verseHash: verseHash,
            eventNameHash: eventNameHash,
            agent: agent,
            agentTimestamp: agentTimestamp,
            blockTimestamp: uint64(block.timestamp),
            sequence: sequence
        });

        allRecordHashes.push(recordHash);
        if (verseHash != bytes32(0)) recordsByVerse[verseHash].push(recordHash);
        if (sequence > lastSequence[agent]) lastSequence[agent] = sequence;

        if (agent == Agent.BWSP) {
            emit BWSP_AuditAnchored(
                recordHash, verseHash, eventNameHash, sequence, agentTimestamp, uint64(block.timestamp)
            );
        } else {
            emit BWTYA_AuditAnchored(
                recordHash, verseHash, eventNameHash, sequence, agentTimestamp, uint64(block.timestamp)
            );
        }
    }

    // ============================================================
    // Views
    // ============================================================

    function isAnchored(bytes32 recordHash) external view returns (bool) {
        return anchors[recordHash].recordHash != bytes32(0);
    }

    function totalAnchored() external view returns (uint256) {
        return allRecordHashes.length;
    }

    function verseRecordCount(bytes32 verseHash) external view returns (uint256) {
        return recordsByVerse[verseHash].length;
    }

    /// @notice Paginated read of the record hashes anchored to one Scripture.
    function verseRecords(bytes32 verseHash, uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory page)
    {
        bytes32[] storage list = recordsByVerse[verseHash];
        if (offset >= list.length) return new bytes32[](0);
        uint256 end = offset + limit;
        if (end > list.length) end = list.length;
        page = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; ++i) page[i - offset] = list[i];
    }
}