// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title WisdomNativeSuperToken — native $WISDOM (true Superfluid Super Token)
 * @author BibleFi.eth
 * @notice $WISDOM as a NATIVE Superfluid Super Token — no separate ERC-20 and
 *         no wrap/unwrap step. Streamable the instant it's earned.
 *
 * "How much better to get wisdom than gold, to get insight rather than silver!"
 * — Proverbs 16:16
 *
 * Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses Superfluid's official custom-super-token proxy pattern
 * (https://github.com/superfluid-finance/custom-supertokens):
 * a minimal UUPS proxy that points at the canonical SuperToken implementation,
 * with this contract's own storage appended after CustomSuperTokenBase's
 * 32-slot padding. Reward issuance mints directly via ISuperToken.selfMint
 * (onlySelf — only this contract can call it), so a fresh $WISDOM reward is a
 * real-time-streamable Super Token balance from the moment it's earned; no
 * separate $xWISDOM wrapper is needed (unlike $BIBLEFI, which stays a standard
 * ERC20Votes governance token wrapped into $xBIBLEFI to preserve on-chain
 * vote delegation/checkpoints — see xBibleFiToken.sol).
 *
 * Earning Rates (unchanged from the original $WISDOM design)
 * ─────────────────────────────────────────────────────────────────────────────
 * Active tithe stream (≥ 30 days)             : 100 $WISDOM / week
 * Scripture quiz completion                   :  50 $WISDOM / completion
 * Farcaster / X biblical-wisdom post          :  10–100 $WISDOM (engagement)
 * Successful church referral                  : 1,000 $WISDOM
 * Governance vote                             :   5 $WISDOM / vote
 * Avoiding BWSP-flagged risky investment      :  75 $WISDOM / warning heeded
 *
 * Deployment
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Deploy WisdomNativeSuperTokenProxy (this file).
 *   2. Call factory.initializeCustomSuperToken(address(proxy)).
 *   3. Call proxy.initialize(factory, admin) — one-time, mints 0 initial supply
 *      ($WISDOM is earned, not premined) and grants roles to `admin`.
 * See scripts/contracts/deploy-superfluid-tokens.ts.
 *
 * Base Chain Addresses
 * ─────────────────────────────────────────────────────────────────────────────
 * Superfluid Host       : 0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74
 * SuperTokenFactory     : 0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3
 */

import { CustomSuperTokenBase } from
    "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/CustomSuperTokenBase.sol";
import { UUPSProxy } from
    "@superfluid-finance/ethereum-contracts/contracts/upgradability/UUPSProxy.sol";
import {
    ISuperToken,
    ISuperTokenFactory,
    IERC20
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title The proxy + custom logic contract for native $WISDOM.
/// @dev CustomSuperTokenBase's 32-slot padding MUST come first so this
///      contract's own storage (AccessControl roles, reward tracking) doesn't
///      collide with the canonical SuperToken implementation's storage.
contract WisdomNativeSuperTokenProxy is
    CustomSuperTokenBase,
    UUPSProxy,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    // ─────────────────────────────────────────────────────── roles ──
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // ─────────────────────────────────────────────────── constants ──
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    uint256 public constant TITHE_STREAM_WEEKLY_REWARD = 100 * 10 ** 18;
    uint256 public constant QUIZ_COMPLETION_REWARD      =  50 * 10 ** 18;
    uint256 public constant CHURCH_REFERRAL_REWARD      = 1000 * 10 ** 18;
    uint256 public constant GOVERNANCE_VOTE_REWARD      =   5 * 10 ** 18;
    uint256 public constant RISK_AVOIDANCE_REWARD       =  75 * 10 ** 18;
    uint256 public constant MIN_SOCIAL_POST_REWARD      =  10 * 10 ** 18;
    uint256 public constant MAX_SOCIAL_POST_REWARD      = 100 * 10 ** 18;

    // Daily claim limit per user (anti-abuse)
    uint256 public constant DAILY_USER_CAP = 2_000 * 10 ** 18;

    // ─────────────────────────────────────────────────── tracking ──
    mapping(address => uint256) public lastClaimDay;
    mapping(address => uint256) public dailyClaimedAmount;
    mapping(address => uint256) public totalEarned;

    mapping(address => uint256) public titheStreakWeeks;
    mapping(address => uint256) public quizzesCompleted;
    mapping(address => uint256) public churchReferrals;
    mapping(address => uint256) public governanceVotesCast;

    // ─────────────────────────────────────────────────────── events ──
    event WisdomRewardIssued(
        address indexed recipient,
        uint256 amount,
        string  rewardType,
        string  scriptureReference
    );

    // ─────────────────────────────────────────────────── initialize ──

    /// @notice One-time initializer. $WISDOM is earned, not premined, so the
    ///         initial supply is always zero; `admin` receives all roles.
    function initialize(ISuperTokenFactory factory, address admin) external {
        require(admin != address(0), "WISDOM: zero admin");

        // Connects the proxy to the canonical SuperToken implementation and
        // emits the discovery event (see PureSuperTokenProxy for the pattern).
        ISuperTokenFactory(factory).initializeCustomSuperToken(address(this));
        ISuperToken(address(this)).initialize(IERC20(address(0)), 18, "BibleFi Wisdom", "WISDOM");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(ORACLE_ROLE, admin);
    }

    // ──────────────────────────────────────────── reward issuance ──

    function issueTitheStreamReward(address recipient) external onlyRole(ORACLE_ROLE) {
        titheStreakWeeks[recipient]++;
        _issueReward(recipient, TITHE_STREAM_WEEKLY_REWARD, "TITHE_STREAM", "Malachi 3:10");
    }

    function issueQuizReward(address recipient) external onlyRole(ORACLE_ROLE) {
        quizzesCompleted[recipient]++;
        _issueReward(recipient, QUIZ_COMPLETION_REWARD, "QUIZ_COMPLETION", "Proverbs 16:16");
    }

    /// @param amount Must be between MIN_SOCIAL_POST_REWARD and MAX_SOCIAL_POST_REWARD.
    function issueSocialPostReward(address recipient, uint256 amount) external onlyRole(ORACLE_ROLE) {
        require(
            amount >= MIN_SOCIAL_POST_REWARD && amount <= MAX_SOCIAL_POST_REWARD,
            "WISDOM: social reward out of range"
        );
        _issueReward(recipient, amount, "SOCIAL_POST", "Proverbs 11:14");
    }

    function issueChurchReferralReward(address referrer) external onlyRole(ORACLE_ROLE) {
        churchReferrals[referrer]++;
        _issueReward(referrer, CHURCH_REFERRAL_REWARD, "CHURCH_REFERRAL", "Matthew 28:19");
    }

    function issueGovernanceVoteReward(address voter) external onlyRole(ORACLE_ROLE) {
        governanceVotesCast[voter]++;
        _issueReward(voter, GOVERNANCE_VOTE_REWARD, "GOVERNANCE_VOTE", "Proverbs 15:22");
    }

    function issueRiskAvoidanceReward(address recipient) external onlyRole(ORACLE_ROLE) {
        _issueReward(recipient, RISK_AVOIDANCE_REWARD, "RISK_AVOIDANCE", "Proverbs 22:3");
    }

    /// @notice Generic reward issuance (for custom integrations).
    function issueCustomReward(
        address recipient,
        uint256 amount,
        string calldata rewardType,
        string calldata scripture
    ) external onlyRole(MINTER_ROLE) {
        _issueReward(recipient, amount, rewardType, scripture);
    }

    // ─────────────────────────────────────────────────── internal ──

    function _issueReward(
        address recipient,
        uint256 amount,
        string memory rewardType,
        string memory scripture
    ) internal nonReentrant whenNotPaused {
        require(recipient != address(0), "WISDOM: zero address");
        require(ISuperToken(address(this)).totalSupply() + amount <= MAX_SUPPLY, "WISDOM: cap exceeded");

        uint256 today = block.timestamp / 1 days;
        if (lastClaimDay[recipient] != today) {
            lastClaimDay[recipient] = today;
            dailyClaimedAmount[recipient] = 0;
        }
        require(dailyClaimedAmount[recipient] + amount <= DAILY_USER_CAP, "WISDOM: daily cap exceeded");

        dailyClaimedAmount[recipient] += amount;
        totalEarned[recipient] += amount;

        // onlySelf: legal because this call originates from the token
        // contract itself (address(this) is both the SuperToken and the
        // caller of selfMint).
        ISuperToken(address(this)).selfMint(recipient, amount, "");

        emit WisdomRewardIssued(recipient, amount, rewardType, scripture);
    }

    // ───────────────────────────────────────────── admin ──

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─────────────────────────────────────────────── views ──

    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 earned,
        uint256 titheWeeks,
        uint256 quizzes,
        uint256 referrals,
        uint256 votes
    ) {
        return (
            ISuperToken(address(this)).balanceOf(user),
            totalEarned[user],
            titheStreakWeeks[user],
            quizzesCompleted[user],
            churchReferrals[user],
            governanceVotesCast[user]
        );
    }
}

/// @dev Alias for external callers/indexers — the token itself is ISuperToken;
///      the reward-issuance functions above are additional custom logic.
interface IWisdomNativeSuperToken is ISuperToken {}
