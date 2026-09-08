// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  WisdomSuperToken ($WISDOMx)
 * @notice Deploys and manages $WISDOMx — the Superfluid Super Token wrapper of
 *         the $WISDOM rewards token — and distributes streaming $WISDOM rewards
 *         to active tithers via Superfluid's Instant Distribution Agreement (IDA).
 *
 *         "Bring the whole tithe into the storehouse, that there may be food
 *          in my house. Test me in this, says the LORD Almighty, and see if I
 *          will not throw open the floodgates of heaven and pour out so much
 *          blessing that there will not be room enough to store it."
 *          — Malachi 3:10
 *
 * ────────────────────────────────────────────────────────────────────
 * What this contract does
 * ───────────────────────
 * 1. DEPLOYMENT  — calls ISuperTokenFactory once to wrap $WISDOM → $WISDOMx.
 *
 * 2. UPGRADE / DOWNGRADE helpers  (users swap $WISDOM ↔ $WISDOMx)
 *
 * 3. IDA REWARD INDEX  — one Instant Distribution Agreement index (INDEX_ID = 0)
 *    is created on $WISDOMx.  Each active tither is a subscriber; their units
 *    are set proportional to their wisdom power score so higher-scoring tithers
 *    receive a larger share of each distribution.
 *
 * 4. SUBSCRIPTION MANAGEMENT
 *    subscribeToRewards()    — called by an active tither to join the IDA index
 *    unsubscribeFromRewards()— tither opts out (or is removed by admin on inactivity)
 *    updateSubscriberUnits() — oracle/keeper updates a subscriber's wisdom units
 *
 * 5. REWARD DISTRIBUTION
 *    distributeWisdomRewards(amount) — owner/keeper distributes $WISDOMx to all
 *    subscribers proportionally; the WisdomToken minter must have minted the
 *    underlying $WISDOM and upgraded it to $WISDOMx before calling.
 *
 * 6. SUPERAPP CALLBACKS  — tracks $WISDOMx stream events for analytics.
 *
 * Base Chain Superfluid addresses (mainnet)
 * ──────────────────────────────────────────
 *   Host:              0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74
 *   CFAv1:             0x19ba78B9cDB05A877718841c574325fdB53601bb
 *   IDAv1:             0x804348D4960a1e35B7B75E3F36B9C3bE4050e751
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
    IInstantDistributionAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";
import {
    IDAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/IDAv1Library.sol";
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

// ─── Minimal WisdomToken interface (minting rewards) ─────────────────────────

interface IWisdomToken {
    function mint(address to, uint256 amount) external;
    function MAX_SUPPLY() external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

// ─── Minimal BWSPWisdomRegistry interface ────────────────────────────────────

interface IBWSPWisdomRegistry {
    function computeWisdomPowerScore(address user) external view returns (uint256);
}

// ─────────────────────────────────────────────────────────────────────────────

contract WisdomSuperToken is ISuperApp, Ownable2Step, ReentrancyGuard {
    using IDAv1Library for IDAv1Library.InitData;
    using SafeERC20 for IERC20;

    // ─── IDA index ID ─────────────────────────────────────────────────────────
    // All $WISDOMx tithe-reward distributions share a single index.

    uint32 public constant INDEX_ID = 0;

    // ─── Protocol references ──────────────────────────────────────────────────

    ISuperfluid                     public immutable host;
    IInstantDistributionAgreementV1 public immutable ida;
    ISuperTokenFactory              public immutable superTokenFactory;
    IDAv1Library.InitData           private          _idaLib;

    // ─── Token references ─────────────────────────────────────────────────────

    /// @notice Underlying $WISDOM ERC-20 rewards token
    IERC20Metadata public immutable wisdomToken;

    /// @notice $WISDOMx Super Token wrapper (set once via deployWisdomX)
    ISuperToken public wisdomX;

    // ─── Protocol integrations ────────────────────────────────────────────────

    IBWSPWisdomRegistry public wisdomRegistry;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice Whether a user is subscribed to the $WISDOMx IDA reward index
    mapping(address => bool) public isRewardSubscriber;

    /// @notice Current wisdom units assigned to each subscriber (raw power score)
    mapping(address => uint128) public subscriberUnits;

    /// @notice Total units across all subscribers (for distribution share calculation)
    uint128 public totalUnits;

    /// @notice Addresses authorised to call distributeWisdomRewards and
    ///         updateSubscriberUnits (e.g. keeper bots, the BibleFiSuperToken contract)
    mapping(address => bool) public authorisedKeepers;

    /// @notice Total $WISDOMx distributed to tithers lifetime (analytics)
    uint256 public totalDistributed;

    // ─── Events ───────────────────────────────────────────────────────────────

    event SuperTokenDeployed(address indexed wisdomX);
    event RewardIndexCreated(uint32 indexId);
    event SubscriberAdded(address indexed subscriber, uint128 units);
    event SubscriberRemoved(address indexed subscriber);
    event SubscriberUnitsUpdated(address indexed subscriber, uint128 oldUnits, uint128 newUnits);
    event WisdomRewardsDistributed(uint256 amount, uint128 totalUnitsAtDistribution);
    event TokensUpgraded(address indexed user, uint256 amount);
    event TokensDowngraded(address indexed user, uint256 amount);
    event KeeperUpdated(address indexed keeper, bool authorised);
    event WisdomRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error SuperTokenAlreadyDeployed();
    error SuperTokenNotYetDeployed();
    error AlreadySubscribed();
    error NotSubscribed();
    error NoUnitsToDistribute();
    error ZeroAddress();
    error ZeroAmount();
    error UnauthorisedKeeper();
    error OnlyHost();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _wisdomToken       Deployed $WISDOM ERC-20 address
     * @param _wisdomRegistry    BWSPWisdomRegistry address (or address(0) to set later)
     * @param _host              Superfluid Host address on the target chain
     * @param _ida               Superfluid IDAv1 address on the target chain
     * @param _superTokenFactory Superfluid SuperTokenFactory address on the target chain
     * @param _initialOwner      Contract owner (Gnosis Safe / multisig recommended)
     *
     * Base Chain mainnet references (supply to constructor at deploy time):
     *   Host:              0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74
     *   IDAv1:             0x804348D4960a1e35B7B75E3F36B9C3bE4050e751
     *   SuperTokenFactory: verify at https://docs.superfluid.finance/docs/technical-reference/contract-addresses
     */
    constructor(
        address _wisdomToken,
        address _wisdomRegistry,
        address _host,
        address _ida,
        address _superTokenFactory,
        address _initialOwner
    ) {
        if (_wisdomToken      == address(0) ||
            _host             == address(0) ||
            _ida              == address(0) ||
            _superTokenFactory == address(0) ||
            _initialOwner     == address(0)) revert ZeroAddress();

        _transferOwnership(_initialOwner);

        host              = ISuperfluid(_host);
        ida               = IInstantDistributionAgreementV1(_ida);
        superTokenFactory = ISuperTokenFactory(_superTokenFactory);
        _idaLib = IDAv1Library.InitData({
            host: ISuperfluid(_host),
            ida:  IInstantDistributionAgreementV1(_ida)
        });

        wisdomToken    = IERC20Metadata(_wisdomToken);
        wisdomRegistry = IBWSPWisdomRegistry(_wisdomRegistry);

        // Register this contract as a Superfluid SuperApp
        ISuperfluid(_host).registerApp(
            SuperAppDefinitions.APP_LEVEL_FINAL              |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP    |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP    |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP
        );
    }

    // ─── One-time SuperToken deployment ───────────────────────────────────────

    /**
     * @notice Deploy $WISDOMx by wrapping $WISDOM through Superfluid's factory,
     *         then create the IDA reward index on $WISDOMx.
     *         Can only be called once.
     */
    function deployWisdomX() external onlyOwner {
        if (address(wisdomX) != address(0)) revert SuperTokenAlreadyDeployed();

        // 1. Deploy $WISDOMx wrapper
        ISuperToken wrapper = superTokenFactory.createERC20Wrapper(
            wisdomToken,
            ISuperTokenFactory.Upgradability.SEMI_UPGRADABLE,
            "Wisdom Rewards Super Token",
            "WISDOMx"
        );
        wisdomX = wrapper;
        emit SuperTokenDeployed(address(wrapper));

        // 2. Create the IDA distribution index on $WISDOMx
        _idaLib.createIndex(wrapper, INDEX_ID);
        emit RewardIndexCreated(INDEX_ID);
    }

    // ─── Upgrade / Downgrade ──────────────────────────────────────────────────

    /**
     * @notice Wrap $WISDOM → $WISDOMx.
     *         Caller must first approve this contract to spend their $WISDOM.
     *
     * @param amount Amount of $WISDOM to wrap (18 decimals, 1:1 ratio)
     */
    function upgrade(uint256 amount) external nonReentrant {
        if (address(wisdomX) == address(0)) revert SuperTokenNotYetDeployed();
        if (amount == 0) revert ZeroAmount();

        IERC20(address(wisdomToken)).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(address(wisdomToken)).approve(address(wisdomX), amount);
        wisdomX.upgrade(amount);
        wisdomX.transfer(msg.sender, amount);

        emit TokensUpgraded(msg.sender, amount);
    }

    /**
     * @notice Unwrap $WISDOMx → $WISDOM.
     *         Caller must first approve this contract to spend their $WISDOMx.
     *
     * @param amount Amount of $WISDOMx to unwrap (18 decimals, 1:1 ratio)
     */
    function downgrade(uint256 amount) external nonReentrant {
        if (address(wisdomX) == address(0)) revert SuperTokenNotYetDeployed();
        if (amount == 0) revert ZeroAmount();

        IERC20(address(wisdomX)).safeTransferFrom(msg.sender, address(this), amount);
        wisdomX.downgrade(amount);
        IERC20(address(wisdomToken)).safeTransfer(msg.sender, amount);

        emit TokensDowngraded(msg.sender, amount);
    }

    // ─── Subscription management ──────────────────────────────────────────────

    /**
     * @notice Subscribe the caller to the $WISDOMx reward index.
     *         Initial units are set from the caller's current wisdom power score
     *         (minimum 1 unit to ensure non-zero participation).
     *
     *         Only tithers with an active Superfluid $BIBLEFIx or $WISDOMx stream
     *         should call this; unit accuracy is enforced by keeper updates.
     */
    function subscribeToRewards() external nonReentrant {
        if (address(wisdomX) == address(0)) revert SuperTokenNotYetDeployed();
        if (isRewardSubscriber[msg.sender])  revert AlreadySubscribed();

        uint128 units = _deriveUnits(msg.sender);

        _idaLib.updateSubscriptionUnits(wisdomX, INDEX_ID, msg.sender, units);
        isRewardSubscriber[msg.sender] = true;
        subscriberUnits[msg.sender]    = units;
        totalUnits                    += units;

        emit SubscriberAdded(msg.sender, units);
    }

    /**
     * @notice Unsubscribe the caller from the reward index.
     *         Any pending $WISDOMx distributions are claimed automatically
     *         by Superfluid before the subscription is removed.
     */
    function unsubscribeFromRewards() external nonReentrant {
        if (!isRewardSubscriber[msg.sender]) revert NotSubscribed();

        uint128 units = subscriberUnits[msg.sender];

        _idaLib.updateSubscriptionUnits(wisdomX, INDEX_ID, msg.sender, 0);
        isRewardSubscriber[msg.sender]  = false;
        subscriberUnits[msg.sender]     = 0;
        if (totalUnits >= units) totalUnits -= units;

        emit SubscriberRemoved(msg.sender);
    }

    /**
     * @notice Update a subscriber's reward units to reflect a new wisdom score.
     *         Called by authorised keepers (e.g. after BWSPWisdomRegistry update).
     *         Higher wisdom power scores → more $WISDOMx per distribution.
     *
     * @param subscriber  Subscriber wallet address
     */
    function updateSubscriberUnits(address subscriber) external onlyKeeper {
        if (!isRewardSubscriber[subscriber]) revert NotSubscribed();

        uint128 oldUnits = subscriberUnits[subscriber];
        uint128 newUnits = _deriveUnits(subscriber);

        _idaLib.updateSubscriptionUnits(wisdomX, INDEX_ID, subscriber, newUnits);

        // Adjust totalUnits safely
        if (newUnits >= oldUnits) {
            totalUnits += (newUnits - oldUnits);
        } else {
            uint128 delta = oldUnits - newUnits;
            totalUnits = totalUnits >= delta ? totalUnits - delta : 0;
        }

        subscriberUnits[subscriber] = newUnits;
        emit SubscriberUnitsUpdated(subscriber, oldUnits, newUnits);
    }

    /**
     * @notice Batch-update wisdom units for multiple subscribers.
     *         Gas-efficient keeper call after a BWSP oracle batch update.
     *
     * @param subscribers  Array of subscriber addresses to refresh
     */
    function batchUpdateSubscriberUnits(address[] calldata subscribers) external onlyKeeper {
        for (uint256 i = 0; i < subscribers.length; i++) {
            address sub = subscribers[i];
            if (!isRewardSubscriber[sub]) continue;

            uint128 oldUnits = subscriberUnits[sub];
            uint128 newUnits = _deriveUnits(sub);

            _idaLib.updateSubscriptionUnits(wisdomX, INDEX_ID, sub, newUnits);

            if (newUnits >= oldUnits) {
                totalUnits += (newUnits - oldUnits);
            } else {
                uint128 delta = oldUnits - newUnits;
                totalUnits = totalUnits >= delta ? totalUnits - delta : 0;
            }

            subscriberUnits[sub] = newUnits;
            emit SubscriberUnitsUpdated(sub, oldUnits, newUnits);
        }
    }

    // ─── Reward distribution ──────────────────────────────────────────────────

    /**
     * @notice Distribute $WISDOMx rewards to all active subscribers.
     *
     *         The caller (keeper or owner) must ensure this contract holds
     *         sufficient $WISDOMx balance before calling.  A typical flow:
     *           1. Call WisdomToken.mint(address(this), amount)        [minter role]
     *           2. IERC20(wisdomToken).approve(wisdomX, amount)
     *           3. wisdomX.upgrade(amount)
     *           4. distributeWisdomRewards(amount)
     *
     *         Distribution is proportional to each subscriber's units,
     *         which reflect their wisdom power score at the time of the
     *         last updateSubscriberUnits call.
     *
     * @param amount  Amount of $WISDOMx to distribute (18 decimals)
     */
    function distributeWisdomRewards(uint256 amount) external onlyKeeper nonReentrant {
        if (address(wisdomX) == address(0)) revert SuperTokenNotYetDeployed();
        if (amount == 0) revert ZeroAmount();
        if (totalUnits == 0) revert NoUnitsToDistribute();

        _idaLib.distribute(wisdomX, INDEX_ID, amount);
        totalDistributed += amount;

        emit WisdomRewardsDistributed(amount, totalUnits);
    }

    /**
     * @notice Convenience function: mint $WISDOM, upgrade to $WISDOMx, then
     *         distribute to all subscribers in a single transaction.
     *
     *         This contract must be an authorised minter on WisdomToken.
     *
     * @param amount  Amount to mint and distribute (18 decimals)
     */
    function mintUpgradeAndDistribute(uint256 amount) external onlyKeeper nonReentrant {
        if (address(wisdomX) == address(0)) revert SuperTokenNotYetDeployed();
        if (amount == 0) revert ZeroAmount();
        if (totalUnits == 0) revert NoUnitsToDistribute();

        // 1. Mint $WISDOM directly to this contract
        IWisdomToken(address(wisdomToken)).mint(address(this), amount);

        // 2. Approve and upgrade $WISDOM → $WISDOMx
        IERC20(address(wisdomToken)).approve(address(wisdomX), amount);
        wisdomX.upgrade(amount);

        // 3. Distribute $WISDOMx via IDA to all subscribers
        _idaLib.distribute(wisdomX, INDEX_ID, amount);
        totalDistributed += amount;

        emit WisdomRewardsDistributed(amount, totalUnits);
    }

    // ─── Claim helper ─────────────────────────────────────────────────────────

    /**
     * @notice Claim all pending $WISDOMx from the reward index on behalf of caller.
     *         Subscribers must claim to receive their accumulated rewards.
     *         This can also be done directly via Superfluid's IDA interface.
     */
    function claimRewards() external nonReentrant {
        if (!isRewardSubscriber[msg.sender]) revert NotSubscribed();
        _idaLib.claim(wisdomX, address(this), INDEX_ID, msg.sender);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    /**
     * @notice Returns a subscriber's pending (unclaimed) $WISDOMx balance
     *         from the IDA index.
     *
     *         NOTE: This contract is always the IDA index publisher (set in
     *         deployWisdomX via `_idaLib.createIndex(wrapper, INDEX_ID)`).
     *         All claim and distribute calls must reference `address(this)` as
     *         the publisher parameter.
     *
     * @param subscriber  Subscriber wallet address
     * @return pendingDistribution  Pending $WISDOMx amount (18 decimals)
     */
    function pendingRewards(address subscriber)
        external
        view
        returns (uint256 pendingDistribution)
    {
        if (!isRewardSubscriber[subscriber]) return 0;
        (bool exist, bool approved, uint128 units, uint256 pending) =
            ida.getSubscription(wisdomX, address(this), INDEX_ID, subscriber);
        if (!exist) return 0;
        // Return pending if the subscription is approved or the subscriber has units assigned
        return (approved || units > 0) ? pending : 0;
    }

    /**
     * @notice Preview how much $WISDOMx a subscriber would receive from a given
     *         distribution amount, based on their current units share.
     *
     * @param subscriber  Subscriber wallet address
     * @param distAmount  Hypothetical distribution amount (18 decimals)
     * @return share      Subscriber's proportional share
     */
    function previewDistributionShare(address subscriber, uint256 distAmount)
        external
        view
        returns (uint256 share)
    {
        if (totalUnits == 0) return 0;
        uint128 units = subscriberUnits[subscriber];
        if (units == 0) return 0;
        return (distAmount * uint256(units)) / uint256(totalUnits);
    }

    // ─── SuperApp callbacks ───────────────────────────────────────────────────

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
     * @dev Fired after a $WISDOMx stream is created TO this contract.
     *      Auto-subscribes the sender to the reward index if not already subscribed.
     */
    function afterAgreementCreated(
        ISuperToken superToken,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata /*cbdata*/,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        if (address(superToken) == address(wisdomX)) {
            ISuperfluid.Context memory context = host.decodeCtx(ctx);
            address sender = context.msgSender;
            if (!isRewardSubscriber[sender]) {
                uint128 units = _deriveUnits(sender);
                _idaLib.updateSubscriptionUnits(wisdomX, INDEX_ID, sender, units);
                isRewardSubscriber[sender] = true;
                subscriberUnits[sender]    = units;
                totalUnits                += units;
                emit SubscriberAdded(sender, units);
            }
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
     * @dev Fired after a $WISDOMx stream to this contract is deleted.
     *      Updates local accounting only — zeroes subscriber's cached units so
     *      they receive no share of future distributions until their stream
     *      resumes and a keeper calls updateSubscriberUnits.
     *
     *      The IDA unit update is intentionally deferred to a keeper call to
     *      avoid reverts inside this callback (Superfluid SuperApp safety rule:
     *      afterAgreementTerminated MUST NOT revert).
     */
    function afterAgreementTerminated(
        ISuperToken superToken,
        address     /*agreementClass*/,
        bytes32     /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata /*cbdata*/,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        if (address(superToken) == address(wisdomX)) {
            // Use a low-level try to prevent any host.decodeCtx revert from
            // bubbling up — terminated callbacks must never revert.
            (bool ok, bytes memory decoded) = address(host).staticcall(
                abi.encodeWithSelector(ISuperfluid.decodeCtx.selector, ctx)
            );
            if (ok && decoded.length > 0) {
                ISuperfluid.Context memory context = abi.decode(decoded, (ISuperfluid.Context));
                address sender = context.msgSender;
                if (isRewardSubscriber[sender] && subscriberUnits[sender] > 0) {
                    uint128 units = subscriberUnits[sender];
                    // Only update local accounting here.
                    // A keeper must call updateSubscriberUnits(sender) to sync IDA.
                    if (totalUnits >= units) totalUnits -= units;
                    subscriberUnits[sender] = 0;
                    emit SubscriberUnitsUpdated(sender, units, 0);
                }
            }
        }
        return ctx;
    }

    // ─── Owner / keeper administration ───────────────────────────────────────

    /**
     * @notice Authorise or revoke a keeper address.
     *         Keepers call distributeWisdomRewards, updateSubscriberUnits, etc.
     *         Recommended keepers: BibleFiSuperToken contract, Gelato task, admin EOA.
     */
    function setKeeper(address keeper, bool authorised) external onlyOwner {
        if (keeper == address(0)) revert ZeroAddress();
        authorisedKeepers[keeper] = authorised;
        emit KeeperUpdated(keeper, authorised);
    }

    /// @notice Update the BWSPWisdomRegistry reference.
    function setWisdomRegistry(address registry) external onlyOwner {
        emit WisdomRegistryUpdated(address(wisdomRegistry), registry);
        wisdomRegistry = IBWSPWisdomRegistry(registry);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    /**
     * @dev Derive IDA units for a subscriber from their wisdom power score.
     *      Power score is 0–100; we scale to 1–101 to guarantee ≥ 1 unit.
     *      Using uint128 since IDA units are uint128.
     *
     * @param subscriber  Subscriber wallet address
     * @return units      IDA units (1–101)
     */
    function _deriveUnits(address subscriber) internal view returns (uint128 units) {
        uint256 powerScore = 0;
        if (address(wisdomRegistry) != address(0)) {
            powerScore = wisdomRegistry.computeWisdomPowerScore(subscriber);
        }
        // powerScore is 0–100; add 1 so minimum participating unit is 1
        units = uint128(powerScore + 1);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyHost() {
        if (msg.sender != address(host)) revert OnlyHost();
        _;
    }

    modifier onlyKeeper() {
        if (!authorisedKeepers[msg.sender] && msg.sender != owner()) revert UnauthorisedKeeper();
        _;
    }

    // ─── ERC-165 ──────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(ISuperApp).interfaceId;
    }
}
