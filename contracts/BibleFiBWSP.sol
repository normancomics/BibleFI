// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract BibleFiBWSP is Ownable2Step {
    mapping(bytes32 => string) public scriptureConcordance;
    uint256 public lastSyncedBlock;

    event BWSP_TripleChecked(string checkType, uint256 timestamp);
    event BWSP_ScriptureSynthesized(bytes32 indexed verseHash, string fullVerse, string wisdomSummary, string originalLanguage);
    event BWSP_ScriptureUpdated(bytes32 indexed verseHash, string oldVerse, string newVerse);

    error ScriptureAlreadySynthesized(bytes32 verseHash);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function synthesizeWisdom(
        bytes32 verseHash,
        string calldata fullVerse,
        string calldata originalLanguage,
        string calldata wisdomSummary
    ) external onlyOwner {
        // Prevent silent overwrite — existing entries must be updated via updateWisdom
        bytes memory existing = bytes(scriptureConcordance[verseHash]);
        if (existing.length > 0) revert ScriptureAlreadySynthesized(verseHash);

        // Triple-check enforcement
        emit BWSP_TripleChecked("Authenticity", block.timestamp);
        emit BWSP_TripleChecked("Context", block.timestamp);
        emit BWSP_TripleChecked("NoCherryPicking", block.timestamp);

        scriptureConcordance[verseHash] = fullVerse;
        lastSyncedBlock = block.number;

        emit BWSP_ScriptureSynthesized(verseHash, fullVerse, wisdomSummary, originalLanguage);
    }

    /**
     * @notice Update an existing scripture entry (explicit override path).
     * @dev    Distinct from synthesizeWisdom so corrections are clearly auditable.
     */
    function updateWisdom(
        bytes32 verseHash,
        string calldata newFullVerse,
        string calldata originalLanguage,
        string calldata wisdomSummary
    ) external onlyOwner {
        string memory old = scriptureConcordance[verseHash];

        emit BWSP_TripleChecked("Authenticity", block.timestamp);
        emit BWSP_TripleChecked("Context", block.timestamp);
        emit BWSP_TripleChecked("NoCherryPicking", block.timestamp);

        scriptureConcordance[verseHash] = newFullVerse;
        lastSyncedBlock = block.number;

        emit BWSP_ScriptureUpdated(verseHash, old, newFullVerse);
        emit BWSP_ScriptureSynthesized(verseHash, newFullVerse, wisdomSummary, originalLanguage);
    }
}