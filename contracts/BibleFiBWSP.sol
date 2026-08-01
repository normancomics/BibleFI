// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title  BibleFiBWSP
 * @notice Biblical-Wisdom-Synthesis-Protocol on-chain anchor.
 *         Stores verse hashes after all three integrity checks pass:
 *           1. Authenticity  – verse text is non-empty and has a valid reference
 *           2. Context       – verse is drawn from an approved financial-stewardship book
 *           3. NoCherryPicking – synthesis is backed by ≥ 2 supporting verses
 */
contract BibleFiBWSP is Ownable2Step {

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    /// @notice Maps verseHash → full KJV verse text for on-chain concordance
    mapping(bytes32 => string) public scriptureConcordance;

    /// @notice Records which checks passed for each stored verse
    struct TripleCheckRecord {
        bool authentic;
        bool contextual;
        bool notCherryPicked;
        uint256 storedAt;
    }
    mapping(bytes32 => TripleCheckRecord) public tripleCheckRecords;

    uint256 public lastSyncedBlock;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event BWSP_TripleCheckPassed(bytes32 indexed verseHash, uint256 timestamp);
    event BWSP_TripleCheckFailed(bytes32 indexed verseHash, string reason, uint256 timestamp);
    event BWSP_ScriptureSynthesized(
        bytes32 indexed verseHash,
        string fullVerse,
        string wisdomSummary,
        string originalLanguage
    );

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        _transferOwnership(msg.sender);
    }

    // -------------------------------------------------------------------------
    // Core function
    // -------------------------------------------------------------------------

    /**
     * @notice Synthesize and anchor a verse on-chain after all three integrity
     *         checks pass.  Reverts if any check fails.
     *
     * @param verseHash        keccak256 / djb2 hash of the verse text (from BWSP engine)
     * @param fullVerse        Full KJV verse text
     * @param originalLanguage Language code ("hebrew" | "greek" | "aramaic")
     * @param wisdomSummary    BWSP-generated one-sentence wisdom summary
     * @param authentic        Did the verse pass the authenticity check?
     * @param contextual       Did the verse pass the context check?
     * @param notCherryPicked  Were ≥ 2 supporting verses present?
     */
    function synthesizeWisdom(
        bytes32 verseHash,
        string calldata fullVerse,
        string calldata originalLanguage,
        string calldata wisdomSummary,
        bool authentic,
        bool contextual,
        bool notCherryPicked
    ) external onlyOwner {
        // Enforce all three checks before storing anything
        if (!authentic) {
            emit BWSP_TripleCheckFailed(verseHash, "Authenticity check failed", block.timestamp);
            revert("BWSP: authenticity check failed");
        }
        if (!contextual) {
            emit BWSP_TripleCheckFailed(verseHash, "Context check failed", block.timestamp);
            revert("BWSP: context check failed");
        }
        if (!notCherryPicked) {
            emit BWSP_TripleCheckFailed(verseHash, "Anti-cherry-picking check failed", block.timestamp);
            revert("BWSP: anti-cherry-picking check failed");
        }

        // All checks passed — store on-chain
        tripleCheckRecords[verseHash] = TripleCheckRecord({
            authentic: true,
            contextual: true,
            notCherryPicked: true,
            storedAt: block.timestamp
        });

        scriptureConcordance[verseHash] = fullVerse;
        lastSyncedBlock = block.number;

        emit BWSP_TripleCheckPassed(verseHash, block.timestamp);
        emit BWSP_ScriptureSynthesized(verseHash, fullVerse, wisdomSummary, originalLanguage);
    }

    // -------------------------------------------------------------------------
    // View helpers
    // -------------------------------------------------------------------------

    /**
     * @notice Returns true only when the verse hash is stored AND all three
     *         checks are recorded as passed.
     */
    function isVerseApproved(bytes32 verseHash) external view returns (bool) {
        TripleCheckRecord storage r = tripleCheckRecords[verseHash];
        return r.authentic && r.contextual && r.notCherryPicked && r.storedAt > 0;
    }
}
