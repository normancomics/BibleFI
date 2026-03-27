// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title xWisdomToken — $xWISDOM (Super Token)
 * @author BibleFi.eth
 * @notice Superfluid Super Token wrapper for $WISDOM — the VIP LP token for
 *         loyal $WISDOM holders on the BibleFi protocol (Base chain).
 *
 * "Wisdom is more precious than rubies, and nothing you desire can compare
 *  with her." — Proverbs 8:11
 *
 * Overview
 * ─────────────────────────────────────────────────────────────────────────────
 * $xWISDOM is the Superfluid Super Token that wraps $WISDOM (the BibleFi
 * rewards ERC-20).  It unlocks:
 *
 *   • Real-time VIP reward streaming to loyal $WISDOM hodlers
 *   • Superfluid IDA / GDA pool subscriptions (proportional distributions)
 *   • LP incentive streaming for the $WISDOM / $SUP Aerodrome pool
 *   • Tiered VIP status: Bronze / Silver / Gold / Solomon tiers
 *   • Auto-compounding rewards via continuous Superfluid flows
 *
 * Deployment
 * ─────────────────────────────────────────────────────────────────────────────
 * $xWISDOM is created through Superfluid's SuperTokenFactory on Base:
 *
 *   ISuperTokenFactory(SUPERFLUID_TOKEN_FACTORY).createERC20Wrapper(
 *       IERC20(WISDOM_ADDRESS),
 *       18,
 *       ISuperTokenFactory.Upgradability.NON_UPGRADABLE,
 *       "BibleFi Wisdom Super Token",
 *       "xWISDOM"
 *   );
 *
 * Base Chain Addresses
 * ─────────────────────────────────────────────────────────────────────────────
 * Superfluid Host           : 0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74
 * Superfluid CFA Forwarder  : 0x19ba78B9cDB05A877718841c574325fdB53601bb
 * SuperTokenFactory         : 0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3
 */

// ─────────────────────────────────────── Superfluid interfaces (subset) ──

interface IERC20Minimal {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ISuperfluidToken {
    function getUnderlyingToken() external view returns (address);
    function upgrade(uint256 amount) external;
    function downgrade(uint256 amount) external;
    function realtimeBalanceOfNow(address account)
        external
        view
        returns (
            int256  availableBalance,
            uint256 deposit,
            uint256 owedDeposit,
            uint256 timestamp
        );
}

interface ISuperTokenFactory {
    enum Upgradability { NON_UPGRADABLE, SEMI_UPGRADABLE, FULL_UPGRADABLE }

    function createERC20Wrapper(
        IERC20Minimal underlyingToken,
        uint8 underlyingDecimals,
        Upgradability upgradability,
        string calldata name,
        string calldata symbol
    ) external returns (ISuperfluidToken superToken);
}

interface ICFAv1Forwarder {
    function createFlow(
        address token,
        address receiver,
        int96  flowRate,
        bytes  calldata userData
    ) external returns (bool);

    function updateFlow(
        address token,
        address receiver,
        int96  flowRate,
        bytes  calldata userData
    ) external returns (bool);

    function deleteFlow(
        address token,
        address sender,
        address receiver,
        bytes  calldata userData
    ) external returns (bool);

    function getFlow(
        address token,
        address sender,
        address receiver
    )
        external
        view
        returns (
            uint256 lastUpdated,
            int96  flowRate,
            uint256 deposit,
            uint256 owedDeposit
        );
}

// ────────────────────────────────────────────── Deployment helper ──

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @dev One-shot helper that deploys the $xWISDOM Superfluid wrapper.
 */
contract XWisdomDeployer is Ownable {
    address public constant SUPERFLUID_TOKEN_FACTORY =
        0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3;

    address public xWisdomAddress;

    event XWisdomDeployed(address indexed xWisdom, address indexed underlying);

    function deployXWISDOM(address wisdomToken) external onlyOwner {
        require(xWisdomAddress == address(0), "xWISDOM already deployed");
        require(wisdomToken != address(0),    "invalid underlying");

        ISuperfluidToken wrapper = ISuperTokenFactory(SUPERFLUID_TOKEN_FACTORY)
            .createERC20Wrapper(
                IERC20Minimal(wisdomToken),
                18,
                ISuperTokenFactory.Upgradability.NON_UPGRADABLE,
                "BibleFi Wisdom Super Token",
                "xWISDOM"
            );

        xWisdomAddress = address(wrapper);
        emit XWisdomDeployed(xWisdomAddress, wisdomToken);
    }
}

// ─────────────────────────────────── VIP LP Rewards streaming controller ──

/**
 * @title WisdomVIPRewards
 * @notice Streams $xWISDOM to VIP LP holders proportionally.
 *         Tiers are based on how long a user has held $WISDOM continuously.
 *
 * Tier Structure
 * ──────────────────────────────────────────────
 * Bronze  (≥ 30 days  hodl) : 1× base rate
 * Silver  (≥ 90 days  hodl) : 2× base rate
 * Gold    (≥ 180 days hodl) : 3× base rate
 * Solomon (≥ 365 days hodl) : 5× base rate
 */
contract WisdomVIPRewards is Ownable, ReentrancyGuard {
    ICFAv1Forwarder public constant CFA_FORWARDER =
        ICFAv1Forwarder(0x19ba78B9cDB05A877718841c574325fdB53601bb);

    ISuperfluidToken public xWisdom;   // set after deployment

    // Tier thresholds (holding duration in seconds)
    uint256 public constant BRONZE_THRESHOLD  =  30 days;
    uint256 public constant SILVER_THRESHOLD  =  90 days;
    uint256 public constant GOLD_THRESHOLD    = 180 days;
    uint256 public constant SOLOMON_THRESHOLD = 365 days;

    // Base flow rate per second (owner adjustable)
    int96 public baseFlowRate = 1e9; // ~0.086 xWISDOM/day at base

    enum Tier { NONE, BRONZE, SILVER, GOLD, SOLOMON }

    struct VIPInfo {
        uint256 hodlStart;   // timestamp when user first staked
        Tier    tier;
        bool    active;
    }

    mapping(address => VIPInfo) public vipInfo;

    event VIPEnrolled(address indexed user, Tier tier, int96 flowRate);
    event VIPTierUpgraded(address indexed user, Tier newTier, int96 newFlowRate);
    event VIPStreamStopped(address indexed user);
    event BaseFlowRateUpdated(int96 newBaseRate);

    constructor(address _xWisdom) {
        if (_xWisdom != address(0)) {
            xWisdom = ISuperfluidToken(_xWisdom);
        }
    }

    // ── Admin ──

    function setXWisdom(address _xWisdom) external onlyOwner {
        require(address(xWisdom) == address(0), "already set");
        xWisdom = ISuperfluidToken(_xWisdom);
    }

    function setBaseFlowRate(int96 newRate) external onlyOwner {
        require(newRate > 0, "rate must be > 0");
        baseFlowRate = newRate;
        emit BaseFlowRateUpdated(newRate);
    }

    // ── Enrol / upgrade ──

    /**
     * @notice Enrol a new VIP LP holder and start their reward stream.
     *         Must be called by an authorised oracle / backend after the user
     *         stakes $WISDOM through the BibleFi LP contract.
     */
    function enrolVIP(address user, uint256 hodlStartTimestamp) external onlyOwner {
        require(address(xWisdom) != address(0), "xWISDOM not set");
        require(user != address(0),             "zero address");
        require(!vipInfo[user].active,          "already enrolled");

        vipInfo[user] = VIPInfo({
            hodlStart: hodlStartTimestamp,
            tier:      _computeTier(hodlStartTimestamp),
            active:    true
        });

        int96 flowRate = _flowRateForTier(vipInfo[user].tier);
        CFA_FORWARDER.createFlow(address(xWisdom), user, flowRate, "");
        emit VIPEnrolled(user, vipInfo[user].tier, flowRate);
    }

    /**
     * @notice Re-evaluate a user's tier and upgrade their flow if applicable.
     *         Anyone can call this once the user's hodl period qualifies.
     */
    function upgradeVIPTier(address user) external nonReentrant {
        VIPInfo storage info = vipInfo[user];
        require(info.active, "user not enrolled");

        Tier newTier = _computeTier(info.hodlStart);
        if (newTier <= info.tier) return; // no upgrade needed

        info.tier = newTier;
        int96 newFlowRate = _flowRateForTier(newTier);
        CFA_FORWARDER.updateFlow(address(xWisdom), user, newFlowRate, "");
        emit VIPTierUpgraded(user, newTier, newFlowRate);
    }

    /**
     * @notice Stop the VIP stream (e.g., user un-stakes their $WISDOM LP).
     */
    function stopVIPStream(address user) external onlyOwner {
        require(vipInfo[user].active, "not active");
        vipInfo[user].active = false;
        CFA_FORWARDER.deleteFlow(address(xWisdom), address(this), user, "");
        emit VIPStreamStopped(user);
    }

    // ── Wrap/unwrap helpers ──

    /**
     * @notice Wrap $WISDOM held by this contract into $xWISDOM for streaming.
     */
    function wrapWisdom(address wisdomToken, uint256 amount) external onlyOwner {
        IERC20Minimal(wisdomToken).approve(address(xWisdom), amount);
        xWisdom.upgrade(amount);
    }

    // ── Internal helpers ──

    function _computeTier(uint256 hodlStart) internal view returns (Tier) {
        if (hodlStart > block.timestamp) return Tier.NONE;
        uint256 duration = block.timestamp - hodlStart;
        if (duration >= SOLOMON_THRESHOLD) return Tier.SOLOMON;
        if (duration >= GOLD_THRESHOLD)    return Tier.GOLD;
        if (duration >= SILVER_THRESHOLD)  return Tier.SILVER;
        if (duration >= BRONZE_THRESHOLD)  return Tier.BRONZE;
        return Tier.NONE;
    }

    function _flowRateForTier(Tier tier) internal view returns (int96) {
        if (tier == Tier.SOLOMON) return baseFlowRate * 5;
        if (tier == Tier.GOLD)    return baseFlowRate * 3;
        if (tier == Tier.SILVER)  return baseFlowRate * 2;
        if (tier == Tier.BRONZE)  return baseFlowRate;
        return 0;
    }

    // ── Views ──

    /**
     * @notice Returns the current tier and active flow rate for a user.
     */
    function getVIPStatus(address user) external view returns (
        Tier    tier,
        int96   flowRate,
        bool    active,
        uint256 hodlDays
    ) {
        VIPInfo memory info = vipInfo[user];
        tier     = info.tier;
        flowRate = info.active ? _flowRateForTier(info.tier) : 0;
        active   = info.active;
        hodlDays = info.hodlStart > 0
            ? (block.timestamp - info.hodlStart) / 1 days
            : 0;
    }

    /**
     * @notice Flow rate helper: monthly tokens → per-second int96.
     */
    function monthlyToFlowRate(uint256 monthlyAmount) external pure returns (int96) {
        uint256 flowRate = monthlyAmount / 30 days;
        require(flowRate <= uint256(uint96(type(int96).max)), "VIPRewards: flowRate overflows int96");
        return int96(int256(flowRate));
    }
}
