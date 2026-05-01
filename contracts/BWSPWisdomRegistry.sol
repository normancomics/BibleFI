// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./BWTYAMath.sol";

/**
 * @title BWSPWisdomRegistry
 * @notice On-chain registry for the Biblical-Wisdom-Synthesis-Protocol.
 *
 * @dev Tracks user wisdom trajectories, tithe milestones, scripture resonance
 *      scores, and consecutive faithfulness streaks — creating an immutable,
 *      tamper-proof record of a steward's spiritual and financial journey.
 *
 * Core features
 * ─────────────
 * 1. Wisdom Milestone Commits         – hash-committed milestones, revealed on achievement
 * 2. Consecutive Tithe Verification   – on-chain streak with blessing multiplier
 * 3. Scripture Resonance Logging      – log query ↔ scripture similarity scores
 * 4. Wisdom Trajectory Tracking       – rising / stable / falling classification
 * 5. BWTYA Score Integration          – store advisory scores against user's wisdom profile
 * 6. Decay-Adjusted Score Query       – read user wisdom with real-time decay applied
 *
 * "A wise person thinks a lot about death, while a fool thinks only about having a good time."
 * – Ecclesiastes 7:4 (stewardship over the long horizon)
 *
 * "The plans of the diligent lead to profit as surely as haste leads to poverty."
 * – Proverbs 21:5 (track record matters)
 */
contract BWSPWisdomRegistry is Ownable2Step, ReentrancyGuard {
    using BWTYAMath for uint256;

    // ============================================================
    // Structs
    // ============================================================

    struct WisdomProfile {
        uint256 baseScore;              // 0–100 (current raw wisdom score)
        uint256 consecutiveTitheMonths; // Months of unbroken tithing
        uint256 lastActivityBlock;      // Block of last recorded activity
        uint256 lastActivityTimestamp;  // Timestamp of last recorded activity
        uint256 totalAdvisoriesReceived;// Total BWTYA advisory records for user
        uint256 topBwtyaScore;          // Highest BWTYA advisory score received
        Trajectory trajectory;          // Wisdom score direction
        uint256 milestoneCount;         // Number of achieved milestones
    }

    enum Trajectory { RISING, STABLE, FALLING }

    struct ScriptureResonanceLog {
        bytes32 queryHash;        // keccak256 of the original query text
        bytes32 scriptureHash;    // keccak256 of scripture reference string
        uint16  resonanceScore;   // 0–10000 (scaled from 0.0–1.0)
        uint256 timestamp;
    }

    struct MilestoneCommit {
        bytes32 commitHash;   // keccak256(milestoneId ++ salt) — hidden until reveal
        uint256 committedAt;
        bool    achieved;
        uint256 achievedAt;
        string  description;  // revealed on achievement
    }

    struct AdvisoryRecord {
        bytes32 advisoryId;       // links to BibleFiSpandexAdvisory.sol
        uint16  bwtyaScore;       // 0–100
        uint16  convictionScore;  // 0–100
        uint16  ecclesiasteScore; // 0–100 diversification score
        uint256 timestamp;
    }

    // ============================================================
    // State
    // ============================================================

    /// @dev Authorised callers that may write wisdom scores (oracle, BWTYACore, etc.)
    mapping(address => bool) public authorisedOracles;

    mapping(address => WisdomProfile)                     public profiles;
    mapping(address => ScriptureResonanceLog[])           public resonanceLogs;
    mapping(address => MilestoneCommit[])                 public milestoneCommits;
    mapping(address => AdvisoryRecord[])                  public advisoryHistory;

    /// @dev Content-hash → list of users who resonated with that scripture
    mapping(bytes32 => address[])                         public scriptureResonators;

    /// @dev Global leaderboard: sorted by topBwtyaScore (maintained externally via events)
    uint256 public totalUsersTracked;

    // ============================================================
    // Events
    // ============================================================

    event WisdomScoreUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        Trajectory trajectory
    );

    event TitheStreakUpdated(
        address indexed user,
        uint256 consecutiveMonths,
        uint256 blessingMultiplierWad
    );

    event MilestoneCommitted(
        address indexed user,
        uint256 indexed milestoneIndex,
        bytes32 commitHash
    );

    event MilestoneRevealed(
        address indexed user,
        uint256 indexed milestoneIndex,
        string  description
    );

    event ScriptureResonanceLogged(
        address indexed user,
        bytes32 indexed scriptureHash,
        uint16  resonanceScore
    );

    event AdvisoryRecorded(
        address indexed user,
        bytes32 indexed advisoryId,
        uint16  bwtyaScore,
        uint16  convictionScore
    );

    // ============================================================
    // Errors
    // ============================================================

    error Unauthorised();
    error InvalidScore();
    error MilestoneNotFound();
    error MilestoneAlreadyAchieved();
    error CommitHashMismatch();
    error ZeroAddress();

    // ============================================================
    // Modifiers
    // ============================================================

    modifier onlyOracle() {
        if (!authorisedOracles[msg.sender] && msg.sender != owner()) revert Unauthorised();
        _;
    }

    // ============================================================
    // Constructor
    // ============================================================

    constructor() {
        _transferOwnership(msg.sender);
    }

    // ============================================================
    // Oracle Management
    // ============================================================

    function setOracle(address oracle, bool authorised) external onlyOwner {
        if (oracle == address(0)) revert ZeroAddress();
        authorisedOracles[oracle] = authorised;
    }

    // ============================================================
    // 1. Wisdom Score Management
    // ============================================================

    /**
     * @notice Update a user's wisdom score and classify their trajectory.
     * @dev    Trajectory is computed by comparing new score to the current
     *         base score.  A ≥5-point rise = RISING; ≥5-point fall = FALLING;
     *         otherwise STABLE.
     *
     * @param user      User wallet address
     * @param newScore  New wisdom score (0–100)
     */
    function updateWisdomScore(
        address user,
        uint256 newScore
    ) external onlyOracle nonReentrant {
        if (newScore > 100) revert InvalidScore();

        WisdomProfile storage p = profiles[user];
        uint256 oldScore = p.baseScore;

        Trajectory traj;
        if (newScore >= oldScore + 5) {
            traj = Trajectory.RISING;
        } else if (oldScore >= newScore + 5) {
            traj = Trajectory.FALLING;
        } else {
            traj = Trajectory.STABLE;
        }

        if (oldScore == 0 && newScore > 0) {
            totalUsersTracked++;
        }

        p.baseScore            = newScore;
        p.trajectory           = traj;
        p.lastActivityBlock    = block.number;
        p.lastActivityTimestamp = block.timestamp;

        emit WisdomScoreUpdated(user, oldScore, newScore, traj);
    }

    /**
     * @notice Read a user's wisdom score with exponential decay applied.
     * @dev    Calls BWTYAMath.wisdomDecay with elapsed days since last activity.
     * @param user  User wallet address
     * @return decayedScore  Decay-adjusted wisdom score
     * @return daysInactive  Days since last on-chain activity
     */
    function getDecayedWisdomScore(address user)
        external
        view
        returns (uint256 decayedScore, uint256 daysInactive)
    {
        WisdomProfile storage p = profiles[user];
        if (p.lastActivityTimestamp == 0) return (0, 0);

        daysInactive = (block.timestamp - p.lastActivityTimestamp) / 1 days;
        decayedScore  = BWTYAMath.wisdomDecay(p.baseScore, daysInactive);
    }

    // ============================================================
    // 2. Tithe Streak & Blessing
    // ============================================================

    /**
     * @notice Record a new month of consecutive tithing for a user.
     * @dev    Increments the streak counter and emits the current blessing
     *         multiplier so off-chain systems can apply it to BWTYA scoring.
     *
     * @param user  User wallet address
     */
    function recordTitheMonth(address user) external onlyOracle nonReentrant {
        WisdomProfile storage p = profiles[user];
        p.consecutiveTitheMonths++;
        p.lastActivityBlock     = block.number;
        p.lastActivityTimestamp = block.timestamp;

        uint256 blessing = BWTYAMath.titheBlessingMultiplier(p.consecutiveTitheMonths);
        emit TitheStreakUpdated(user, p.consecutiveTitheMonths, blessing);
    }

    /**
     * @notice Reset a user's tithe streak (missed month).
     */
    function resetTitheStreak(address user) external onlyOracle {
        profiles[user].consecutiveTitheMonths = 0;
        emit TitheStreakUpdated(user, 0, BWTYAMath.WAD /* 1.0× */);
    }

    /**
     * @notice Get the current tithe blessing multiplier for a user (WAD-scaled).
     */
    function getTitheBlessingMultiplier(address user) external view returns (uint256) {
        return BWTYAMath.titheBlessingMultiplier(profiles[user].consecutiveTitheMonths);
    }

    // ============================================================
    // 3. Wisdom Milestones (commit–reveal)
    // ============================================================

    /**
     * @notice Commit to a wisdom milestone before achieving it (prevents back-dating).
     * @dev    commitHash = keccak256(abi.encode(milestoneId, salt, msg.sender))
     *         The salt is kept secret until reveal.
     *
     * @param commitHash  Hash of the milestone commitment
     */
    function commitMilestone(bytes32 commitHash) external nonReentrant {
        milestoneCommits[msg.sender].push(MilestoneCommit({
            commitHash:  commitHash,
            committedAt: block.timestamp,
            achieved:    false,
            achievedAt:  0,
            description: ''
        }));

        uint256 index = milestoneCommits[msg.sender].length - 1;
        emit MilestoneCommitted(msg.sender, index, commitHash);
    }

    /**
     * @notice Reveal a milestone as achieved by supplying the pre-image.
     * @dev    Verifies keccak256(abi.encode(milestoneId, salt, msg.sender)) == commitHash.
     *
     * @param index       Index in milestoneCommits[msg.sender]
     * @param milestoneId Arbitrary milestone identifier (e.g. "josephs-storehouse-unlocked")
     * @param salt        Secret salt used during commit
     * @param description Human-readable milestone description to store on-chain
     */
    function revealMilestone(
        uint256 index,
        bytes32 milestoneId,
        bytes32 salt,
        string calldata description
    ) external nonReentrant {
        MilestoneCommit[] storage commits = milestoneCommits[msg.sender];
        if (index >= commits.length) revert MilestoneNotFound();

        MilestoneCommit storage c = commits[index];
        if (c.achieved) revert MilestoneAlreadyAchieved();

        bytes32 expectedHash = keccak256(abi.encode(milestoneId, salt, msg.sender));
        if (expectedHash != c.commitHash) revert CommitHashMismatch();

        c.achieved    = true;
        c.achievedAt  = block.timestamp;
        c.description = description;

        profiles[msg.sender].milestoneCount++;
        profiles[msg.sender].lastActivityBlock     = block.number;
        profiles[msg.sender].lastActivityTimestamp = block.timestamp;

        emit MilestoneRevealed(msg.sender, index, description);
    }

    // ============================================================
    // 4. Scripture Resonance Logging
    // ============================================================

    /**
     * @notice Log a scripture resonance score for a user query.
     * @dev    Called by the BWSP oracle after computing the TF-IDF resonance
     *         score off-chain.  Stored on-chain for DAO auditability.
     *
     * @param user           User wallet
     * @param queryHash      keccak256 of the query text
     * @param scriptureHash  keccak256 of the scripture reference (e.g. "Proverbs 3:9")
     * @param resonanceBps   Resonance score in basis points (0–10000 = 0.0–1.0)
     */
    function logScriptureResonance(
        address user,
        bytes32 queryHash,
        bytes32 scriptureHash,
        uint16  resonanceBps
    ) external onlyOracle nonReentrant {
        resonanceLogs[user].push(ScriptureResonanceLog({
            queryHash:      queryHash,
            scriptureHash:  scriptureHash,
            resonanceScore: resonanceBps,
            timestamp:      block.timestamp
        }));

        scriptureResonators[scriptureHash].push(user);

        emit ScriptureResonanceLogged(user, scriptureHash, resonanceBps);
    }

    /**
     * @notice Get a user's average scripture resonance score across all logs.
     * @return avgResonanceBps  Average resonance in basis points (0–10000)
     */
    function getAverageResonance(address user) external view returns (uint256 avgResonanceBps) {
        ScriptureResonanceLog[] storage logs = resonanceLogs[user];
        if (logs.length == 0) return 0;
        uint256 sum = 0;
        for (uint256 i = 0; i < logs.length; i++) {
            sum += logs[i].resonanceScore;
        }
        return sum / logs.length;
    }

    // ============================================================
    // 5. BWTYA Advisory Integration
    // ============================================================

    /**
     * @notice Record a BWTYA advisory result against a user's wisdom profile.
     * @dev    Updates topBwtyaScore, totalAdvisoriesReceived, and records the
     *         advisory details for historical analysis.
     *
     * @param user             User wallet
     * @param advisoryId       Advisory ID from BibleFiSpandexAdvisory.sol
     * @param bwtyaScore       Composite BWTYA score (0–100)
     * @param convictionScore_ Conviction score (0–100, geometric mean)
     * @param ecclesScore      Ecclesiastes diversification score (0–100)
     */
    function recordAdvisory(
        address user,
        bytes32 advisoryId,
        uint16  bwtyaScore,
        uint16  convictionScore_,
        uint16  ecclesScore
    ) external onlyOracle nonReentrant {
        if (bwtyaScore > 100 || convictionScore_ > 100 || ecclesScore > 100) revert InvalidScore();

        WisdomProfile storage p = profiles[user];
        p.totalAdvisoriesReceived++;
        if (bwtyaScore > p.topBwtyaScore) {
            p.topBwtyaScore = bwtyaScore;
        }

        advisoryHistory[user].push(AdvisoryRecord({
            advisoryId:     advisoryId,
            bwtyaScore:     bwtyaScore,
            convictionScore: convictionScore_,
            ecclesiasteScore: ecclesScore,
            timestamp:      block.timestamp
        }));

        emit AdvisoryRecorded(user, advisoryId, bwtyaScore, convictionScore_);
    }

    // ============================================================
    // 6. Composite Wisdom Power Score
    // ============================================================

    /**
     * @notice Compute a composite on-chain "Wisdom Power Score" fusing:
     *         - Decay-adjusted base wisdom score (40 %)
     *         - Tithe blessing multiplier (30 %)
     *         - Top BWTYA advisory score (20 %)
     *         - Average scripture resonance (10 %)
     *
     * @param user  User wallet address
     * @return powerScore  0–100 composite score
     */
    function computeWisdomPowerScore(address user) external view returns (uint256 powerScore) {
        WisdomProfile storage p = profiles[user];
        if (p.baseScore == 0 && p.totalAdvisoriesReceived == 0) return 0;

        // 1. Decay-adjusted wisdom (0–100)
        uint256 daysInactive = p.lastActivityTimestamp > 0
            ? (block.timestamp - p.lastActivityTimestamp) / 1 days
            : 0;
        uint256 decayed = BWTYAMath.wisdomDecay(p.baseScore, daysInactive);

        // 2. Tithe blessing factor: normalise (WAD = 1.0, max 1.5) → 0–100
        uint256 blessingWad  = BWTYAMath.titheBlessingMultiplier(p.consecutiveTitheMonths);
        uint256 blessingNorm = ((blessingWad - BWTYAMath.WAD) * 100) / (BWTYAMath.WAD / 2); // 0–100
        if (blessingNorm > 100) blessingNorm = 100;

        // 3. Top BWTYA score (already 0–100)
        uint256 topBwtya = p.topBwtyaScore;

        // 4. Average resonance (convert bps → 0–100)
        ScriptureResonanceLog[] storage logs = resonanceLogs[user];
        uint256 avgRes = 0;
        if (logs.length > 0) {
            uint256 sum = 0;
            for (uint256 i = 0; i < logs.length; i++) { sum += logs[i].resonanceScore; }
            avgRes = (sum / logs.length) / 100; // bps → 0–100
        }

        // Weighted composite: 40/30/20/10
        powerScore = (decayed * 40 + blessingNorm * 30 + topBwtya * 20 + avgRes * 10) / 100;
        if (powerScore > 100) powerScore = 100;
    }

    // ============================================================
    // 7. Wisdom Trajectory Query
    // ============================================================

    /**
     * @notice Get a user's wisdom trajectory with decay-adjusted score.
     * @return trajectory   RISING (0) / STABLE (1) / FALLING (2)
     * @return rawScore     Current unmodified base score
     * @return decayedScore Score after applying inactivity decay
     * @return streak       Consecutive tithe months
     */
    function getWisdomTrajectory(address user)
        external
        view
        returns (
            Trajectory trajectory,
            uint256    rawScore,
            uint256    decayedScore,
            uint256    streak
        )
    {
        WisdomProfile storage p = profiles[user];
        uint256 daysInactive = p.lastActivityTimestamp > 0
            ? (block.timestamp - p.lastActivityTimestamp) / 1 days
            : 0;

        trajectory   = p.trajectory;
        rawScore     = p.baseScore;
        decayedScore = BWTYAMath.wisdomDecay(p.baseScore, daysInactive);
        streak       = p.consecutiveTitheMonths;
    }

    // ============================================================
    // 8. Leaderboard Helpers
    // ============================================================

    /**
     * @notice Return summary data for a user (for leaderboard display).
     */
    function getUserSummary(address user)
        external
        view
        returns (
            uint256 baseScore,
            uint256 titheStreak,
            uint256 topBwtyaScore,
            uint256 advisoryCount,
            uint256 milestones,
            Trajectory trajectory
        )
    {
        WisdomProfile storage p = profiles[user];
        return (
            p.baseScore,
            p.consecutiveTitheMonths,
            p.topBwtyaScore,
            p.totalAdvisoriesReceived,
            p.milestoneCount,
            p.trajectory
        );
    }

    /**
     * @notice Returns the number of unique users who have resonated with a
     *         specific scripture (useful for DAO governance weighting).
     */
    function getScriptureResonatorCount(bytes32 scriptureHash) external view returns (uint256) {
        return scriptureResonators[scriptureHash].length;
    }
}
