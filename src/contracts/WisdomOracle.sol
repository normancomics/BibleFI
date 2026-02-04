// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title WisdomOracle - Wisdom Score Calculator for BWTYA
 * @notice Off-chain oracle that provides wisdom scores based on user behavior
 * @dev Integrates with BWSP tithing data and on-chain activity
 * 
 * "The fear of the LORD is the beginning of wisdom" - Proverbs 9:10
 * 
 * Scoring Components:
 * - Stewardship (40%): On-chain asset management, investment diversity
 * - Generosity (30%): Tithing patterns, charitable giving, community support
 * - Wisdom (20%): Educational engagement, Scripture quiz completion
 * - Community (10%): Social participation, governance voting, referrals
 */
contract WisdomOracle is Ownable, Pausable {
    
    // ============ Structs ============
    
    struct WisdomFactors {
        uint256 stewardshipScore;    // On-chain asset management (0-1000)
        uint256 generosityScore;     // Tithing and giving patterns (0-1000)
        uint256 wisdomScore;         // Educational engagement (0-1000)
        uint256 communityScore;      // Social and governance participation (0-1000)
    }
    
    struct ScoreHistory {
        uint256 score;
        uint256 timestamp;
        string reason;
    }
    
    // ============ State ============
    
    mapping(address => WisdomFactors) public userFactors;
    mapping(address => uint256) public totalWisdomScores;
    mapping(address => ScoreHistory[]) public scoreHistory;
    mapping(address => bool) public authorizedUpdaters;
    
    address public bwtya;
    address public bwsp;
    
    // Scoring weights (basis points, must sum to 10000)
    uint256 public constant STEWARDSHIP_WEIGHT = 4000;  // 40%
    uint256 public constant GENEROSITY_WEIGHT = 3000;   // 30%
    uint256 public constant WISDOM_WEIGHT = 2000;       // 20%
    uint256 public constant COMMUNITY_WEIGHT = 1000;    // 10%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Score thresholds
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant BEGINNER_THRESHOLD = 250;
    uint256 public constant FAITHFUL_THRESHOLD = 500;
    uint256 public constant WISE_THRESHOLD = 750;
    uint256 public constant STEWARD_THRESHOLD = 1000;
    
    // Reward multipliers for each tier
    uint256 public constant MULTIPLIER_BEGINNER = 10500;  // 1.05x
    uint256 public constant MULTIPLIER_FAITHFUL = 12000;  // 1.2x
    uint256 public constant MULTIPLIER_WISE = 15000;      // 1.5x
    uint256 public constant MULTIPLIER_STEWARD = 18000;   // 1.8x
    
    // ============ Events ============
    
    event WisdomScoreUpdated(
        address indexed user, 
        uint256 totalScore, 
        WisdomFactors factors,
        string reason
    );
    event AuthorizedUpdaterSet(address indexed updater, bool authorized);
    event WisdomBandChanged(address indexed user, string oldBand, string newBand);
    event TitheBonusActivated(address indexed user, uint256 generosityScore);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedUpdaters[msg.sender],
            "WisdomOracle: Not authorized"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ External Functions ============
    
    /**
     * @notice Update user's wisdom factors
     * @dev Called by authorized backend oracles or BWSP contract
     */
    function updateWisdomFactors(
        address user,
        uint256 stewardship,
        uint256 generosity,
        uint256 wisdom,
        uint256 community,
        string calldata reason
    ) external onlyAuthorized whenNotPaused {
        string memory oldBand = getWisdomBand(user);
        
        // Cap each factor at MAX_SCORE
        userFactors[user] = WisdomFactors({
            stewardshipScore: stewardship > MAX_SCORE ? MAX_SCORE : stewardship,
            generosityScore: generosity > MAX_SCORE ? MAX_SCORE : generosity,
            wisdomScore: wisdom > MAX_SCORE ? MAX_SCORE : wisdom,
            communityScore: community > MAX_SCORE ? MAX_SCORE : community
        });
        
        // Calculate total weighted score
        uint256 totalScore = _calculateTotalScore(userFactors[user]);
        totalWisdomScores[user] = totalScore;
        
        // Record history
        scoreHistory[user].push(ScoreHistory({
            score: totalScore,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        // Check for band change
        string memory newBand = getWisdomBand(user);
        if (keccak256(bytes(oldBand)) != keccak256(bytes(newBand))) {
            emit WisdomBandChanged(user, oldBand, newBand);
        }
        
        // Push to BWTYA if connected
        _syncToBWTYA(user, totalScore, generosity);
        
        emit WisdomScoreUpdated(user, totalScore, userFactors[user], reason);
    }
    
    /**
     * @notice Increment a specific factor (for action-based rewards)
     */
    function incrementFactor(
        address user,
        string calldata factorType,
        uint256 amount,
        string calldata reason
    ) external onlyAuthorized whenNotPaused {
        WisdomFactors storage factors = userFactors[user];
        
        bytes32 factorHash = keccak256(bytes(factorType));
        
        if (factorHash == keccak256("stewardship")) {
            factors.stewardshipScore = _cappedAdd(factors.stewardshipScore, amount);
        } else if (factorHash == keccak256("generosity")) {
            factors.generosityScore = _cappedAdd(factors.generosityScore, amount);
            if (factors.generosityScore >= 300) {
                emit TitheBonusActivated(user, factors.generosityScore);
            }
        } else if (factorHash == keccak256("wisdom")) {
            factors.wisdomScore = _cappedAdd(factors.wisdomScore, amount);
        } else if (factorHash == keccak256("community")) {
            factors.communityScore = _cappedAdd(factors.communityScore, amount);
        }
        
        uint256 totalScore = _calculateTotalScore(factors);
        totalWisdomScores[user] = totalScore;
        
        scoreHistory[user].push(ScoreHistory({
            score: totalScore,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        _syncToBWTYA(user, totalScore, factors.generosityScore);
        
        emit WisdomScoreUpdated(user, totalScore, factors, reason);
    }
    
    /**
     * @notice Batch update multiple users
     */
    function batchUpdateWisdomFactors(
        address[] calldata users,
        uint256[] calldata stewardships,
        uint256[] calldata generosities,
        uint256[] calldata wisdoms,
        uint256[] calldata communities
    ) external onlyAuthorized whenNotPaused {
        require(
            users.length == stewardships.length &&
            users.length == generosities.length &&
            users.length == wisdoms.length &&
            users.length == communities.length,
            "WisdomOracle: Array length mismatch"
        );
        
        for (uint256 i = 0; i < users.length; i++) {
            userFactors[users[i]] = WisdomFactors({
                stewardshipScore: stewardships[i] > MAX_SCORE ? MAX_SCORE : stewardships[i],
                generosityScore: generosities[i] > MAX_SCORE ? MAX_SCORE : generosities[i],
                wisdomScore: wisdoms[i] > MAX_SCORE ? MAX_SCORE : wisdoms[i],
                communityScore: communities[i] > MAX_SCORE ? MAX_SCORE : communities[i]
            });
            
            totalWisdomScores[users[i]] = _calculateTotalScore(userFactors[users[i]]);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user's current wisdom score
     */
    function getWisdomScore(address user) external view returns (uint256) {
        return totalWisdomScores[user];
    }
    
    /**
     * @notice Get detailed factors breakdown
     */
    function getWisdomFactors(address user) external view returns (WisdomFactors memory) {
        return userFactors[user];
    }
    
    /**
     * @notice Get wisdom band classification
     */
    function getWisdomBand(address user) public view returns (string memory) {
        uint256 score = totalWisdomScores[user];
        
        if (score >= STEWARD_THRESHOLD) return "Kingdom Steward";
        if (score >= WISE_THRESHOLD) return "Wise";
        if (score >= FAITHFUL_THRESHOLD) return "Faithful";
        if (score >= BEGINNER_THRESHOLD) return "Beginner";
        return "Seeker";
    }
    
    /**
     * @notice Get APY multiplier for a user's wisdom level
     */
    function getWisdomMultiplier(address user) external view returns (uint256) {
        uint256 score = totalWisdomScores[user];
        
        if (score >= STEWARD_THRESHOLD) return MULTIPLIER_STEWARD;
        if (score >= WISE_THRESHOLD) return MULTIPLIER_WISE;
        if (score >= FAITHFUL_THRESHOLD) return MULTIPLIER_FAITHFUL;
        if (score >= BEGINNER_THRESHOLD) return MULTIPLIER_BEGINNER;
        return BASIS_POINTS; // 1.0x
    }
    
    /**
     * @notice Check if user qualifies for tithe bonus
     */
    function hasTitheBonus(address user) external view returns (bool) {
        return userFactors[user].generosityScore >= 300;
    }
    
    /**
     * @notice Get user's score history
     */
    function getScoreHistory(
        address user,
        uint256 limit
    ) external view returns (ScoreHistory[] memory) {
        ScoreHistory[] storage history = scoreHistory[user];
        uint256 length = history.length;
        
        if (limit == 0 || limit > length) {
            limit = length;
        }
        
        ScoreHistory[] memory result = new ScoreHistory[](limit);
        for (uint256 i = 0; i < limit; i++) {
            result[i] = history[length - 1 - i]; // Most recent first
        }
        
        return result;
    }
    
    /**
     * @notice Calculate weighted score breakdown
     */
    function getScoreBreakdown(address user) external view returns (
        uint256 stewardshipContribution,
        uint256 generosityContribution,
        uint256 wisdomContribution,
        uint256 communityContribution,
        uint256 total
    ) {
        WisdomFactors memory factors = userFactors[user];
        
        stewardshipContribution = (factors.stewardshipScore * STEWARDSHIP_WEIGHT) / BASIS_POINTS;
        generosityContribution = (factors.generosityScore * GENEROSITY_WEIGHT) / BASIS_POINTS;
        wisdomContribution = (factors.wisdomScore * WISDOM_WEIGHT) / BASIS_POINTS;
        communityContribution = (factors.communityScore * COMMUNITY_WEIGHT) / BASIS_POINTS;
        total = stewardshipContribution + generosityContribution + wisdomContribution + communityContribution;
    }
    
    // ============ Admin Functions ============
    
    function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
        authorizedUpdaters[updater] = authorized;
        emit AuthorizedUpdaterSet(updater, authorized);
    }
    
    function setBWTYA(address _bwtya) external onlyOwner {
        bwtya = _bwtya;
    }
    
    function setBWSP(address _bwsp) external onlyOwner {
        bwsp = _bwsp;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ Internal Functions ============
    
    function _calculateTotalScore(WisdomFactors memory factors) internal pure returns (uint256) {
        return (
            (factors.stewardshipScore * STEWARDSHIP_WEIGHT) +
            (factors.generosityScore * GENEROSITY_WEIGHT) +
            (factors.wisdomScore * WISDOM_WEIGHT) +
            (factors.communityScore * COMMUNITY_WEIGHT)
        ) / BASIS_POINTS;
    }
    
    function _cappedAdd(uint256 current, uint256 amount) internal pure returns (uint256) {
        uint256 result = current + amount;
        return result > MAX_SCORE ? MAX_SCORE : result;
    }
    
    function _syncToBWTYA(address user, uint256 totalScore, uint256 generosity) internal {
        if (bwtya != address(0)) {
            (bool success, ) = bwtya.call(
                abi.encodeWithSignature(
                    "updateWisdomProfile(address,uint256,uint256,uint256,bool)",
                    user,
                    totalScore,
                    generosity >= 500 ? generosity / 100 : 0, // Tithe consistency
                    generosity >= 700 ? 17000 : (generosity >= 500 ? 15000 : 0), // Generosity multiplier
                    generosity >= 300 // Has tithe bonus
                )
            );
            // Silently continue if push fails
        }
    }
}
