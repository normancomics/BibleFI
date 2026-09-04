// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  BibleFiSuperToken ($BIBLEFIx)
 * @notice Deploys, manages, and adds programmable cash-flow logic to $BIBLEFIx —
 *         the Superfluid Super Token wrapper of the $BIBLEFI governance token.
 *
 *         "The plans of the diligent lead to profit as surely as haste
 *          leads to poverty." — Proverbs 21:5
 *
 * ────────────────────────────────────────────────────────────────────
 * What this contract does
 * ───────────────────────
 * 1. DEPLOYMENT  — calls Superfluid's ISuperTokenFactory once (onlyOwner) to
 *    create the $BIBLEFIx ERC-20 wrapper of $BIBLEFI.
 *
 * 2. UPGRADE / DOWNGRADE helpers
 *    Users call upgrade(amount) to wrap $BIBLEFI → $BIBLEFIx for streaming,
 *    and downgrade(amount) to unwrap $BIBLEFIx → $BIBLEFI.
 *
 * 3. GOVERNANCE TITHE STREAM management
 *    openGovernanceTitheStream() creates a per-second $BIBLEFIx stream from
 *    the caller to a verified church address (10% tithe minimum enforced on-
 *    chain via the Superfluid CFA operator pattern).
 *
 * 4. WISDOM-SCORE GOVERNANCE MULTIPLIER
 *    getGovernanceStreamMultiplier() returns the user's effective governance
 *    power multiplier (1.0× – 1.5×) based on their BWSPWisdomRegistry score.
 *    Active streamers gain bonus governance weight proportional to their wisdom.
 *
 * 5. SUPERAPP CALLBACKS
 *    Registered as a Superfluid SuperApp to react to $BIBLEFIx stream events
 *    directed at this contract — tracking active governance streams and
 *    maintaining streamTitheTarget state.
 *
 * Base Chain Superfluid addresses (mainnet)
 * ──────────────────────────────────────────
 *   Host:              0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74
 *   CFAv1:             0x19ba78B9cDB05A877718841c574325fdB53601bb
 *   SuperTokenFactory: 0xe20B9a38E0c96F61d1bA6b42a61512D56Fea1Eb
 * ────────────────────────────────────────────────────────────────────
 */

import {
    ISuperfluid,
    ISuperToken,
    ISuperApp,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {
    CFAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ─── Minimal Superfluid factory interface ────────────────────────────────────

interface ISuperTokenFactory {
    enum Upgradability { NON_UPGRADABLE, SEMI_UPGRADABLE, FULL_UPGRADABLE }

    function createERC20Wrapper(
        IERC20Metadata underlyingToken,
        Upgradability upgradability,
        string calldata name,
        string calldata symbol
    ) external returns (ISuperToken superToken);
}

// ─── Minimal BWSPWisdomRegistry interface ────────────────────────────────────

interface IBWSPWisdomRegistry {
    function computeWisdomPowerScore(address user) external view returns (uint256);
    function profiles(address user) external view returns (
        uint256 baseScore,
        uint256 consecutiveTitheMonths,
        uint256 lastActivityBlock,
        uint256 lastActivityTimestamp,
        uint256 totalAdvisoriesReceived,
        uint256 topBwtyaScore,
        uint8   trajectory,
        uint256 milestoneCount
    );
}

// ─────────────────────────────────────────────────────────────────────────────

contract BibleFiSuperToken is ISuperApp, Ownable2Step, ReentrancyGuard {
    using CFAv1Library for CFAv1Library.InitData;
    using SafeERC20 for IERC20;

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice Minimum tithe fraction in basis points: 1000 bp = 10%
    ///         "Bring the whole tithe into the storehouse" — Malachi 3:10
    uint256 public constant TITHE_RATE_BPS = 1_000;
    uint256 public constant BASIS_POINTS   = 10_000;

    // ─── Protocol references ──────────────────────────────────────────────────

    ISuperfluid               public immutable host;
    IConstantFlowAgreementV1  public immutable cfa;
    ISuperTokenFactory        public immutable superTokenFactory;
    CFAv1Library.InitData     private          _cfaLib;

    // ─── Token references ─────────────────────────────────────────────────────

    /// @notice Underlying $BIBLEFI ERC-20 governance token
    IERC20Metadata public immutable biblefiToken;

    /// @notice $BIBLEFIx Super Token wrapper (set once via deployBibleFiX)
    ISuperToken public biblefiX;

    // ─── Protocol integrations ────────────────────────────────────────────────

    IBWSPWisdomRegistry public wisdomRegistry;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice Church addresses verified by the BibleFi DAO as legitimate recipients
    mapping(address => bool) public verifiedChurches;

    /// @notice (user → church) active tithe routing for governance streams
    mapping(address => address) public streamTitheTarget;

    /// @notice Whether a user currently has an active $BIBLEFIx governance stream
    mapping(address => bool) public hasActiveGovernanceStream;

    /// @notice DAO treasury that receives protocol-level governance stream accounting
    address public titheTreasury;

    // ─── Events ───────────────────────────────────────────────────────────────

    event SuperTokenDeployed(address indexed biblefiX);
    event ChurchVerified(address indexed church, bool verified);
    event TitheTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event WisdomRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event TokensUpgraded(address indexed user, uint256 amount);
    event TokensDowngraded(address indexed user, uint256 amount);
    event GovernanceTitheStreamOpened(address indexed user, address indexed church, int96 titheFlowRate);
    event GovernanceTitheStreamClosed(address indexed user, address indexed church);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error SuperTokenAlreadyDeployed();
    error SuperTokenNotYetDeployed();
    error NotVerifiedChurch();
    error FlowRateMustBePositive();
    error TitheFlowRateUnderflow();
    error NoActiveStream();
    error ZeroAddress();
    error ZeroAmount();
    error OnlyHost();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _biblefiToken      Deployed $BIBLEFI ERC-20 address
     * @param _wisdomRegistry    BWSPWisdomRegistry address (or address(0) to set later)
     * @param _titheTreasury     BibleFi DAO treasury — receives governance accounting
     * @param _host              Superfluid Host address on the target chain
     * @param _cfa               Superfluid CFAv1 address on the target chain
     * @param _superTokenFactory Superfluid SuperTokenFactory address on the target chain
     * @param _initialOwner      Contract owner (Gnosis Safe / multisig recommended)
     *
     * Base Chain mainnet references (supply to constructor at deploy time):
     *   Host:              0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74
     *   CFAv1:             0x19ba78B9cDB05A877718841c574325fdB53601bb
     *   SuperTokenFactory: verify at https://docs.superfluid.finance/docs/technical-reference/contract-addresses
     */
    constructor(
        address _biblefiToken,
        address _wisdomRegistry,
        address _titheTreasury,
        address _host,
        address _cfa,
        address _superTokenFactory,
        address _initialOwner
    ) {
        if (_biblefiToken      == address(0) ||
            _titheTreasury     == address(0) ||
            _host              == address(0) ||
            _cfa               == address(0) ||
            _superTokenFactory == address(0) ||
            _initialOwner      == address(0)) revert ZeroAddress();

        _transferOwnership(_initialOwner);

        host              = ISuperfluid(_host);
        cfa               = IConstantFlowAgreementV1(_cfa);
        superTokenFactory = ISuperTokenFactory(_superTokenFactory);
        _cfaLib = CFAv1Library.InitData({
            host: ISuperfluid(_host),
            cfa:  IConstantFlowAgreementV1(_cfa)
        });

        biblefiToken    = IERC20Metadata(_biblefiToken);
        wisdomRegistry  = IBWSPWisdomRegistry(_wisdomRegistry);
        titheTreasury   = _titheTreasury;

        // Register this contract as a Superfluid SuperApp.
        // The BEFORE_AGREEMENT_*_NOOP flags tell the host we don't implement
        // the before-hooks (saves gas); we only act on after-hooks.
        ISuperfluid(_host).registerApp(
            SuperAppDefinitions.APP_LEVEL_FINAL      |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP    |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP    |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP
        );
    }

    // ─── One-time SuperToken deployment ───────────────────────────────────────

    /**
     * @notice Deploy $BIBLEFIx by wrapping $BIBLEFI through Superfluid's factory.
     *         Can only be called once. $BIBLEFIx is a SEMI_UPGRADABLE wrapper
     *         with the same 18-decimal precision as $BIBLEFI.
     *
     *         After deployment, call ISuperfluid(host).callAgreement(...) to
     *         authorise this contract as a CFA flow operator so governance
     *         tithe streams can be managed on behalf of opted-in users.
     */
    function deployBibleFiX() external onlyOwner {
        if (address(biblefiX) != address(0)) revert SuperTokenAlreadyDeployed();

        ISuperToken wrapper = superTokenFactory.createERC20Wrapper(
            biblefiToken,
            ISuperTokenFactory.Upgradability.SEMI_UPGRADABLE,
            "BibleFi Governance Super Token",
            "BIBLEFIx"
        );

        biblefiX = wrapper;
        emit SuperTokenDeployed(address(wrapper));
    }

    // ─── Upgrade / Downgrade ──────────────────────────────────────────────────

    /**
     * @notice Wrap $BIBLEFI → $BIBLEFIx.
     *         Caller must first approve this contract to spend their $BIBLEFI.
     *
     * @param amount Amount of $BIBLEFI to wrap (18 decimals, 1:1 ratio)
     */
    function upgrade(uint256 amount) external nonReentrant {
        if (address(biblefiX) == address(0)) revert SuperTokenNotYetDeployed();
        if (amount == 0) revert ZeroAmount();

        // Pull $BIBLEFI from caller into this contract
        IERC20(address(biblefiToken)).safeTransferFrom(msg.sender, address(this), amount);

        // Approve and upgrade through the SuperToken wrapper
        IERC20(address(biblefiToken)).approve(address(biblefiX), amount);
        biblefiX.upgrade(amount);

        // Forward $BIBLEFIx to caller
        biblefiX.transfer(msg.sender, amount);

        emit TokensUpgraded(msg.sender, amount);
    }

    /**
     * @notice Unwrap $BIBLEFIx → $BIBLEFI.
     *         Caller must first approve this contract to spend their $BIBLEFIx.
     *
     * @param amount Amount of $BIBLEFIx to unwrap (18 decimals, 1:1 ratio)
     */
    function downgrade(uint256 amount) external nonReentrant {
        if (address(biblefiX) == address(0)) revert SuperTokenNotYetDeployed();
        if (amount == 0) revert ZeroAmount();

        // Pull $BIBLEFIx from caller
        IERC20(address(biblefiX)).safeTransferFrom(msg.sender, address(this), amount);

        // Downgrade: unwraps back to underlying $BIBLEFI
        biblefiX.downgrade(amount);

        // Return $BIBLEFI to caller
        IERC20(address(biblefiToken)).safeTransfer(msg.sender, amount);

        emit TokensDowngraded(msg.sender, amount);
    }

    // ─── Governance tithe stream management ───────────────────────────────────

    /**
     * @notice Open a per-second governance tithe stream from the caller to a
     *         verified church address in $BIBLEFIx.
     *
     *         PREREQUISITE: The caller must first authorise this contract as a
     *         Superfluid CFA flow operator for their $BIBLEFIx balance by calling:
     *           host.callAgreement(cfa, cfa.authorizeFlowOperatorWithFullControl.selector,
     *               abi.encode(biblefiX, address(this), "0x"), "0x")
     *
     *         Protocol enforcement:
     *           - The church must be in the verifiedChurches registry
     *           - The titheFlow (10% of totalFlowRate) is created to the church
     *           - If switching churches, the old stream is closed first
     *
     * @param church         Verified church address to receive the tithe stream
     * @param totalFlowRate  Caller's total desired $BIBLEFIx per-second flow (wei/s)
     */
    function openGovernanceTitheStream(
        address church,
        int96   totalFlowRate
    ) external nonReentrant {
        if (address(biblefiX) == address(0)) revert SuperTokenNotYetDeployed();
        if (!verifiedChurches[church])        revert NotVerifiedChurch();
        if (totalFlowRate <= 0)               revert FlowRateMustBePositive();

        int96 titheFlow = int96(
            int256((uint256(uint96(totalFlowRate)) * TITHE_RATE_BPS) / BASIS_POINTS)
        );
        if (titheFlow <= 0) revert TitheFlowRateUnderflow();

        address oldChurch = streamTitheTarget[msg.sender];
        if (oldChurch != address(0) && oldChurch != church) {
            // Close old tithe stream before redirecting to a new church
            (, int96 existingFlow,,) = cfa.getFlow(biblefiX, msg.sender, oldChurch);
            if (existingFlow > 0) {
                _cfaLib.deleteFlowByOperator(msg.sender, oldChurch, biblefiX);
            }
        }

        streamTitheTarget[msg.sender]          = church;
        hasActiveGovernanceStream[msg.sender]  = true;

        (, int96 currentFlow,,) = cfa.getFlow(biblefiX, msg.sender, church);
        if (currentFlow == 0) {
            _cfaLib.createFlowByOperator(msg.sender, church, biblefiX, titheFlow);
        } else {
            _cfaLib.updateFlowByOperator(msg.sender, church, biblefiX, titheFlow);
        }

        emit GovernanceTitheStreamOpened(msg.sender, church, titheFlow);
    }

    /**
     * @notice Close the caller's active governance tithe stream.
     *         Clears streamTitheTarget and hasActiveGovernanceStream state.
     */
    function closeGovernanceTitheStream() external nonReentrant {
        address church = streamTitheTarget[msg.sender];
        if (church == address(0)) revert NoActiveStream();

        (, int96 existingFlow,,) = cfa.getFlow(biblefiX, msg.sender, church);
        if (existingFlow > 0) {
            _cfaLib.deleteFlowByOperator(msg.sender, church, biblefiX);
        }

        delete streamTitheTarget[msg.sender];
        hasActiveGovernanceStream[msg.sender] = false;

        emit GovernanceTitheStreamClosed(msg.sender, church);
    }

    // ─── SuperApp callbacks ───────────────────────────────────────────────────
    // These fire when $BIBLEFIx streams are created/updated/deleted with
    // this contract as the receiver (e.g. governance-stream-to-treasury pattern).

    function beforeAgreementCreated(
        ISuperToken /*superToken*/,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    ) external view override onlyHost returns (bytes memory cbdata) {
        return ctx;
    }

    /**
     * @dev Fired after a $BIBLEFIx stream is created TO this contract.
     *      Marks the sender as having an active governance stream so that
     *      wisdom multipliers and downstream reward systems can be activated.
     */
    function afterAgreementCreated(
        ISuperToken superToken,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata /*cbdata*/,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        if (address(superToken) == address(biblefiX)) {
            ISuperfluid.Context memory context = host.decodeCtx(ctx);
            hasActiveGovernanceStream[context.msgSender] = true;
        }
        return ctx;
    }

    function beforeAgreementUpdated(
        ISuperToken /*superToken*/,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    ) external view override onlyHost returns (bytes memory cbdata) {
        return ctx;
    }

    /**
     * @dev Fired after a $BIBLEFIx stream to this contract is updated.
     *      Wisdom multiplier re-evaluation happens off-chain by indexing this event.
     */
    function afterAgreementUpdated(
        ISuperToken /*superToken*/,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata /*cbdata*/,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        return ctx;
    }

    function beforeAgreementTerminated(
        ISuperToken /*superToken*/,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    ) external view override onlyHost returns (bytes memory cbdata) {
        return ctx;
    }

    /**
     * @dev Fired after a $BIBLEFIx stream to this contract is deleted.
     *      Marks the sender as no longer having an active governance stream.
     *      NOTE: Must not revert (Superfluid SuperApp safety rule).
     */
    function afterAgreementTerminated(
        ISuperToken superToken,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata /*cbdata*/,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        if (address(superToken) == address(biblefiX)) {
            // Static-call host.decodeCtx to avoid revert in terminated callback
            (bool ok, bytes memory decoded) = address(host).staticcall(
                abi.encodeWithSelector(ISuperfluid.decodeCtx.selector, ctx)
            );
            if (ok && decoded.length > 0) {
                ISuperfluid.Context memory context = abi.decode(decoded, (ISuperfluid.Context));
                hasActiveGovernanceStream[context.msgSender] = false;
                delete streamTitheTarget[context.msgSender];
            }
        }
        return ctx;
    }

    // ─── Wisdom governance multiplier ─────────────────────────────────────────

    /**
     * @notice Returns the effective governance power multiplier for a user based
     *         on their active $BIBLEFIx stream status and wisdom power score.
     *
     *         Used by off-chain governance systems and the BWTYAYieldVault to
     *         apply faith-proportional voting weight bonuses.
     *
     *         Mapping (power score 0–100 → 0–1000 tier range):
     *           0–249   (Seeker)   → 1.00× (10 000 bp)
     *           250–499 (Learner)  → 1.05× (10 500 bp)
     *           500–749 (Faithful) → 1.15× (11 500 bp)
     *           750–999 (Steward)  → 1.30× (13 000 bp)
     *           ≥ 1000             → 1.50× (15 000 bp)
     *
     * @param user  User wallet address
     * @return multiplierBps  Multiplier in basis points (10 000 = 1.0×)
     */
    function getGovernanceStreamMultiplier(address user)
        external
        view
        returns (uint256 multiplierBps)
    {
        // No active stream → base multiplier only
        if (!hasActiveGovernanceStream[user]) return BASIS_POINTS;

        if (address(wisdomRegistry) == address(0)) return BASIS_POINTS;

        uint256 powerScore = wisdomRegistry.computeWisdomPowerScore(user);
        uint256 mapped     = powerScore * 10; // 0–100 → 0–1000

        if      (mapped >= 1000) multiplierBps = 15_000; // 1.50×
        else if (mapped >=  750) multiplierBps = 13_000; // 1.30×
        else if (mapped >=  500) multiplierBps = 11_500; // 1.15×
        else if (mapped >=  250) multiplierBps = 10_500; // 1.05×
        else                     multiplierBps = BASIS_POINTS; // 1.00×
    }

    // ─── Owner administration ─────────────────────────────────────────────────

    /**
     * @notice Add or remove a church address from the verified registry.
     * @param church   Church address
     * @param verified true = verified, false = revoked
     */
    function setVerifiedChurch(address church, bool verified) external onlyOwner {
        if (church == address(0)) revert ZeroAddress();
        verifiedChurches[church] = verified;
        emit ChurchVerified(church, verified);
    }

    /**
     * @notice Batch-verify multiple churches in one transaction.
     * @param churches  Array of church addresses to verify
     */
    function batchVerifyChurches(address[] calldata churches) external onlyOwner {
        for (uint256 i = 0; i < churches.length; i++) {
            if (churches[i] == address(0)) revert ZeroAddress();
            verifiedChurches[churches[i]] = true;
            emit ChurchVerified(churches[i], true);
        }
    }

    /// @notice Update the DAO treasury address.
    function setTitheTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TitheTreasuryUpdated(titheTreasury, newTreasury);
        titheTreasury = newTreasury;
    }

    /// @notice Update the BWSPWisdomRegistry reference.
    function setWisdomRegistry(address registry) external onlyOwner {
        emit WisdomRegistryUpdated(address(wisdomRegistry), registry);
        wisdomRegistry = IBWSPWisdomRegistry(registry);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyHost() {
        if (msg.sender != address(host)) revert OnlyHost();
        _;
    }

    // ─── ERC-165 ──────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(ISuperApp).interfaceId;
    }
}
