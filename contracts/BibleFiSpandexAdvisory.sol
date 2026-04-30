// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BibleFiSpandexAdvisory
 * @notice On-chain registry for spanDEX × BWTYA swap advisory results.
 *
 * Every time the BibleFI frontend runs the Spandex-BWTYA advisory pipeline,
 * the result can be anchored on-chain here. This provides:
 *   - An immutable audit trail of provider comparisons and BWTYA scores
 *   - Proof that the Biblical-Wisdom-To-Yield-Algorithm was applied
 *   - On-chain anchoring of the BWSP scripture recommendation
 *   - A basis for future DAO governance on route preference
 *
 * "Every matter must be established by the testimony of two or three witnesses."
 * – 2 Corinthians 13:1
 *
 * Design decisions:
 *   - Advisories are stored by a content-addressed hash of the pair+block;
 *     this prevents duplicate submissions within the same block.
 *   - Authorised submitters are controlled via the `submitter` role.
 *   - The contract owner can rotate the submitter address (e.g. a new
 *     backend signing key) without redeploying.
 *   - All biblical content (scripture reference, BWTYA grade) is emitted
 *     in events for off-chain indexing; only the structural data is stored.
 */
contract BibleFiSpandexAdvisory is Ownable2Step, ReentrancyGuard {

    // =========================================================================
    // Types
    // =========================================================================

    struct ProviderScore {
        string  provider;        // "fabric", "odos", "kyberswap", "lifi"
        uint16  bwtyaScore;      // 0–100
        uint8   stewardshipGrade;// 0=F 1=D 2=C 3=B 4=A
        uint256 outputAmountRaw; // raw output token amount (token decimals)
    }

    struct Advisory {
        bytes32  id;                    // keccak256(fromToken, toToken, block.number, submitter)
        string   fromToken;             // e.g. "ETH"
        string   toToken;               // e.g. "USDC"
        string   bwtyaWinner;           // provider name with highest BWTYA score
        uint16   topBwtyaScore;         // 0–100
        bool     alignedWithBestPrice;  // BWTYA winner == best-price winner?
        string   scriptureReference;    // BWSP output, e.g. "Proverbs 24:6"
        string   bwspWisdomHash;        // keccak256 of BWSP full text (off-chain)
        uint32   wisdomScore;           // user's wisdom score 0–100
        uint256  timestamp;             // block.timestamp
        address  submitter;             // authorised backend address
    }

    // =========================================================================
    // State
    // =========================================================================

    /// @notice Authorised address allowed to submit advisories (e.g. backend EOA or multisig)
    address public submitter;

    /// @notice Total number of advisories registered
    uint256 public advisoryCount;

    /// @notice Advisory records indexed by sequential ID
    mapping(uint256 => Advisory) public advisories;

    /// @notice Reverse lookup: advisory hash → sequential ID (0 means not found)
    mapping(bytes32 => uint256) public advisoryIdByHash;

    // =========================================================================
    // Events
    // =========================================================================

    event AdvisoryRecorded(
        uint256 indexed advisoryId,
        bytes32 indexed advisoryHash,
        string fromToken,
        string toToken,
        string bwtyaWinner,
        uint16  topBwtyaScore,
        bool    alignedWithBestPrice,
        string  scriptureReference,
        uint256 timestamp
    );

    event ProviderScoreRecorded(
        uint256 indexed advisoryId,
        string  provider,
        uint16  bwtyaScore,
        uint8   stewardshipGrade,
        uint256 outputAmountRaw
    );

    event SubmitterUpdated(address indexed oldSubmitter, address indexed newSubmitter);

    // =========================================================================
    // Scripture anchor (immutable, stored in bytecode)
    // =========================================================================

    string public constant SCRIPTURE =
        "Proverbs 24:6 - For by wise guidance you can wage your war, "
        "and in abundance of counsellors there is victory.";

    // =========================================================================
    // Constructor
    // =========================================================================

    /**
     * @param _submitter  Initial authorised submitter address
     * @param _owner      Initial contract owner
     */
    constructor(address _submitter, address _owner) {
        require(_submitter != address(0), "BibleFiSpandexAdvisory: zero submitter");
        require(_owner     != address(0), "BibleFiSpandexAdvisory: zero owner");
        submitter = _submitter;
        _transferOwnership(_owner);
    }

    // =========================================================================
    // External: record advisory
    // =========================================================================

    /**
     * @notice Record a Spandex × BWTYA advisory result on-chain.
     * @dev    Only callable by the authorised `submitter` address.
     *         Emits one `AdvisoryRecorded` event and one `ProviderScoreRecorded`
     *         event per provider.
     *
     * @param fromToken            Input token symbol
     * @param toToken              Output token symbol
     * @param bwtyaWinner          Provider name with highest BWTYA composite score
     * @param topBwtyaScore        Highest BWTYA score across all providers (0–100)
     * @param alignedWithBestPrice Whether BWTYA winner is also best-price winner
     * @param scriptureReference   BWSP primary scripture reference
     * @param bwspWisdomHash       keccak256 of the full BWSP wisdom text (for integrity)
     * @param wisdomScore          User's wisdom score at advisory time
     * @param providerScores       Array of per-provider BWTYA results
     * @return advisoryId          Sequential advisory ID
     */
    function recordAdvisory(
        string  calldata fromToken,
        string  calldata toToken,
        string  calldata bwtyaWinner,
        uint16           topBwtyaScore,
        bool             alignedWithBestPrice,
        string  calldata scriptureReference,
        bytes32          bwspWisdomHash,
        uint32           wisdomScore,
        ProviderScore[] calldata providerScores
    ) external nonReentrant returns (uint256 advisoryId) {
        require(msg.sender == submitter, "BibleFiSpandexAdvisory: not submitter");
        require(topBwtyaScore <= 100,    "BibleFiSpandexAdvisory: invalid score");
        require(providerScores.length > 0 && providerScores.length <= 10,
                "BibleFiSpandexAdvisory: invalid provider count");

        // Content-addressed ID
        bytes32 hash = keccak256(abi.encode(
            fromToken, toToken, block.number, msg.sender
        ));
        require(advisoryIdByHash[hash] == 0,
                "BibleFiSpandexAdvisory: duplicate in same block");

        // Increment and store
        advisoryCount += 1;
        advisoryId = advisoryCount;

        advisories[advisoryId] = Advisory({
            id:                  hash,
            fromToken:           fromToken,
            toToken:             toToken,
            bwtyaWinner:         bwtyaWinner,
            topBwtyaScore:       topBwtyaScore,
            alignedWithBestPrice: alignedWithBestPrice,
            scriptureReference:  scriptureReference,
            bwspWisdomHash:      bytes32(bwspWisdomHash),
            wisdomScore:         wisdomScore,
            timestamp:           block.timestamp,
            submitter:           msg.sender
        });

        advisoryIdByHash[hash] = advisoryId;

        emit AdvisoryRecorded(
            advisoryId, hash,
            fromToken, toToken,
            bwtyaWinner, topBwtyaScore,
            alignedWithBestPrice,
            scriptureReference,
            block.timestamp
        );

        // Emit per-provider scores
        for (uint256 i = 0; i < providerScores.length; i++) {
            ProviderScore calldata ps = providerScores[i];
            require(ps.bwtyaScore <= 100,   "BibleFiSpandexAdvisory: invalid provider score");
            require(ps.stewardshipGrade <= 4,"BibleFiSpandexAdvisory: invalid grade");

            emit ProviderScoreRecorded(
                advisoryId,
                ps.provider,
                ps.bwtyaScore,
                ps.stewardshipGrade,
                ps.outputAmountRaw
            );
        }
    }

    // =========================================================================
    // View
    // =========================================================================

    /**
     * @notice Retrieve an advisory by sequential ID.
     */
    function getAdvisory(uint256 advisoryId)
        external
        view
        returns (Advisory memory)
    {
        require(advisoryId > 0 && advisoryId <= advisoryCount,
                "BibleFiSpandexAdvisory: id out of range");
        return advisories[advisoryId];
    }

    /**
     * @notice Check whether a specific advisory hash has been registered.
     */
    function hasAdvisory(bytes32 hash) external view returns (bool) {
        return advisoryIdByHash[hash] != 0;
    }

    // =========================================================================
    // Owner
    // =========================================================================

    /**
     * @notice Rotate the authorised submitter (e.g. after key rotation).
     * @param newSubmitter New submitter address (must be non-zero)
     */
    function setSubmitter(address newSubmitter) external onlyOwner {
        require(newSubmitter != address(0), "BibleFiSpandexAdvisory: zero submitter");
        emit SubmitterUpdated(submitter, newSubmitter);
        submitter = newSubmitter;
    }
}
