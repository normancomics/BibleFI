// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WisdomRewardsToken — $WISDOM
 * @author BibleFi.eth
 * @notice Superfluid-native rewards token earned through biblical financial
 *         faithfulness on the BibleFi protocol (Base chain).
 *
 * "How much better to get wisdom than gold, to get insight rather than silver!"
 * — Proverbs 16:16
 *
 * Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * $WISDOM is earned (not purchased) through protocol participation.  It is
 * designed to be wrapped into the Superfluid Super Token $xWISDOM, enabling
 * real-time streaming rewards distributions to VIP LP holders.
 *
 * Token Specs
 * ─────────────────────────────────────────────────────────────────────────────
 * Symbol       : WISDOM
 * Max Supply   : 1,000,000,000 (1 billion) — minted on demand up to cap
 * Decimals     : 18
 * Chain        : Base (8453)
 * Superfluid   : Wrap to xWISDOM via SuperTokenFactory.createERC20Wrapper()
 *
 * Earning Rates
 * ─────────────────────────────────────────────────────────────────────────────
 * Active tithe stream (≥ 30 days)             : 100 $WISDOM / week
 * Scripture quiz completion                   :  50 $WISDOM / completion
 * Farcaster / X biblical-wisdom post          :  10–100 $WISDOM (engagement)
 * Successful church referral                  : 1,000 $WISDOM
 * Governance vote                             :   5 $WISDOM / vote
 * Avoiding BWSP-flagged risky investment      :  75 $WISDOM / warning heeded
 */
contract WisdomRewardsToken is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    // ─────────────────────────────────────────────────────── roles ──
    bytes32 public constant MINTER_ROLE  = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE  = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE  = keccak256("ORACLE_ROLE");

    // ─────────────────────────────────────────────────── constants ──
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    // Reward amounts (18-decimal)
    uint256 public constant TITHE_STREAM_WEEKLY_REWARD   = 100  * 10 ** 18;
    uint256 public constant QUIZ_COMPLETION_REWARD       =  50  * 10 ** 18;
    uint256 public constant CHURCH_REFERRAL_REWARD       = 1000 * 10 ** 18;
    uint256 public constant GOVERNANCE_VOTE_REWARD       =   5  * 10 ** 18;
    uint256 public constant RISK_AVOIDANCE_REWARD        =  75  * 10 ** 18;
    uint256 public constant MIN_SOCIAL_POST_REWARD       =  10  * 10 ** 18;
    uint256 public constant MAX_SOCIAL_POST_REWARD       = 100  * 10 ** 18;

    // Daily claim limit per user (anti-abuse)
    uint256 public constant DAILY_USER_CAP = 2_000 * 10 ** 18;

    // ─────────────────────────────────────────────────── tracking ──
    mapping(address => uint256) public lastClaimDay;
    mapping(address => uint256) public dailyClaimedAmount;
    mapping(address => uint256) public totalEarned;

    // Reward-type tracking counters
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
    event SuperfluidWrapperRegistered(address indexed wrapper);

    // ───────────────────────────────────────────────── constructor ──

    constructor() ERC20("BibleFi Wisdom", "WISDOM") ERC20Permit("BibleFi Wisdom") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE,        msg.sender);
        _grantRole(PAUSER_ROLE,        msg.sender);
        _grantRole(ORACLE_ROLE,        msg.sender);
    }

    // ──────────────────────────────────────────── reward issuance ──

    /**
     * @notice Issue a tithe-stream weekly reward.
     * @param recipient Address to receive $WISDOM.
     */
    function issueTitheStreamReward(address recipient) external onlyRole(ORACLE_ROLE) {
        titheStreakWeeks[recipient]++;
        _issueReward(
            recipient,
            TITHE_STREAM_WEEKLY_REWARD,
            "TITHE_STREAM",
            "Malachi 3:10"
        );
    }

    /**
     * @notice Issue a quiz-completion reward.
     */
    function issueQuizReward(address recipient) external onlyRole(ORACLE_ROLE) {
        quizzesCompleted[recipient]++;
        _issueReward(
            recipient,
            QUIZ_COMPLETION_REWARD,
            "QUIZ_COMPLETION",
            "Proverbs 16:16"
        );
    }

    /**
     * @notice Issue a social-post reward with engagement-based amount (10–100).
     * @param amount Must be between MIN_SOCIAL_POST_REWARD and MAX_SOCIAL_POST_REWARD.
     */
    function issueSocialPostReward(address recipient, uint256 amount) external onlyRole(ORACLE_ROLE) {
        require(
            amount >= MIN_SOCIAL_POST_REWARD && amount <= MAX_SOCIAL_POST_REWARD,
            "WISDOM: social reward out of range"
        );
        _issueReward(recipient, amount, "SOCIAL_POST", "Proverbs 11:14");
    }

    /**
     * @notice Issue a church-referral reward.
     */
    function issueChurchReferralReward(address referrer) external onlyRole(ORACLE_ROLE) {
        churchReferrals[referrer]++;
        _issueReward(
            referrer,
            CHURCH_REFERRAL_REWARD,
            "CHURCH_REFERRAL",
            "Matthew 28:19"
        );
    }

    /**
     * @notice Issue a governance-vote reward.
     */
    function issueGovernanceVoteReward(address voter) external onlyRole(ORACLE_ROLE) {
        governanceVotesCast[voter]++;
        _issueReward(
            voter,
            GOVERNANCE_VOTE_REWARD,
            "GOVERNANCE_VOTE",
            "Proverbs 15:22"
        );
    }

    /**
     * @notice Issue a risk-avoidance reward (BWSP warning heeded).
     */
    function issueRiskAvoidanceReward(address recipient) external onlyRole(ORACLE_ROLE) {
        _issueReward(
            recipient,
            RISK_AVOIDANCE_REWARD,
            "RISK_AVOIDANCE",
            "Proverbs 22:3"
        );
    }

    /**
     * @notice Generic reward issuance (for custom integrations).
     */
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
        require(totalSupply() + amount <= MAX_SUPPLY, "WISDOM: cap exceeded");

        // Daily per-user cap
        uint256 today = block.timestamp / 1 days;
        if (lastClaimDay[recipient] != today) {
            lastClaimDay[recipient]    = today;
            dailyClaimedAmount[recipient] = 0;
        }
        require(
            dailyClaimedAmount[recipient] + amount <= DAILY_USER_CAP,
            "WISDOM: daily cap exceeded"
        );

        dailyClaimedAmount[recipient] += amount;
        totalEarned[recipient]        += amount;

        _mint(recipient, amount);

        emit WisdomRewardIssued(recipient, amount, rewardType, scripture);
    }

    // ───────────────────────────────── Superfluid compatibility ──

    /**
     * @notice Emits an event when the Superfluid $xWISDOM wrapper is deployed.
     */
    function registerSuperfluidWrapper(address wrapper) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(wrapper != address(0), "WISDOM: invalid wrapper");
        emit SuperfluidWrapperRegistered(wrapper);
    }

    // ───────────────────────────────────────────── admin ──

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ───────────────────────────────────────────── overrides ──

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    // ─────────────────────────────────────────────── views ──

    /**
     * @notice Returns a summary of a user's wisdom activity.
     */
    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 earned,
        uint256 titheWeeks,
        uint256 quizzes,
        uint256 referrals,
        uint256 votes
    ) {
        return (
            balanceOf(user),
            totalEarned[user],
            titheStreakWeeks[user],
            quizzesCompleted[user],
            churchReferrals[user],
            governanceVotesCast[user]
        );
    }
}
