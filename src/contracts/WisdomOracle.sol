// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WisdomOracle - Wisdom Score Calculator for BWTYA
 * @notice Off-chain oracle that provides wisdom scores based on user behavior
 * @dev Integrates with BWSP tithing data and on-chain activity
 * 
 * "The fear of the LORD is the beginning of wisdom" - Proverbs 9:10
 */
contract WisdomOracle is Ownable {
    
    // ============ Structs ============
    
    struct WisdomFactors {
        uint256 stewardshipScore;    // On-chain asset management
        uint256 generosityScore;     // Tithing and giving patterns
        uint256 wisdomScore;         // Educational engagement
        uint256 communityScore;      // Social and governance participation
    }
    
    // ============ State ============
    
    mapping(address => WisdomFactors) public userFactors;
    mapping(address => uint256) public totalWisdomScores;
    mapping(address => bool) public authorizedUpdaters;
    
    address public bwtya;
    address public bwsp;
    
    // Scoring weights (basis points, must sum to 10000)
    uint256 public constant STEWARDSHIP_WEIGHT = 4000;  // 40%
    uint256 public constant GENEROSITY_WEIGHT = 3000;   // 30%
    uint256 public constant WISDOM_WEIGHT = 2000;       // 20%
    uint256 public constant COMMUNITY_WEIGHT = 1000;    // 10%
    uint256 public constant BASIS_POINTS = 10000;
    
    // ============ Events ============
    
    event WisdomScoreUpdated(address indexed user, uint256 totalScore, WisdomFactors factors);
    event AuthorizedUpdaterSet(address indexed updater, bool authorized);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedUpdaters[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ External Functions ============
    
    /**
     * @notice Update user's wisdom factors
     * @dev Called by authorized backend oracles
     */
    function updateWisdomFactors(
        address user,
        uint256 stewardship,
        uint256 generosity,
        uint256 wisdom,
        uint256 community
    ) external onlyAuthorized {
        // Cap each factor at 1000
        userFactors[user] = WisdomFactors({
            stewardshipScore: stewardship > 1000 ? 1000 : stewardship,
            generosityScore: generosity > 1000 ? 1000 : generosity,
            wisdomScore: wisdom > 1000 ? 1000 : wisdom,
            communityScore: community > 1000 ? 1000 : community
        });
        
        // Calculate total weighted score
        uint256 totalScore = _calculateTotalScore(userFactors[user]);
        totalWisdomScores[user] = totalScore;
        
        // Push to BWTYA if connected
        if (bwtya != address(0)) {
            (bool success, ) = bwtya.call(
                abi.encodeWithSignature(
                    "updateWisdomProfile(address,uint256,uint256,uint256,bool)",
                    user,
                    totalScore,
                    generosity >= 500 ? generosity / 100 : 0, // Tithe consistency
                    generosity >= 700 ? 500 : 0,              // Generosity multiplier
                    generosity >= 300                          // Has tithe bonus
                )
            );
            // Silently continue if push fails
        }
        
        emit WisdomScoreUpdated(user, totalScore, userFactors[user]);
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
    ) external onlyAuthorized {
        require(
            users.length == stewardships.length &&
            users.length == generosities.length &&
            users.length == wisdoms.length &&
            users.length == communities.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < users.length; i++) {
            userFactors[users[i]] = WisdomFactors({
                stewardshipScore: stewardships[i] > 1000 ? 1000 : stewardships[i],
                generosityScore: generosities[i] > 1000 ? 1000 : generosities[i],
                wisdomScore: wisdoms[i] > 1000 ? 1000 : wisdoms[i],
                communityScore: communities[i] > 1000 ? 1000 : communities[i]
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
    function getWisdomBand(address user) external view returns (string memory) {
        uint256 score = totalWisdomScores[user];
        
        if (score >= 751) return "Kingdom Steward";
        if (score >= 501) return "Wise";
        if (score >= 251) return "Faithful";
        return "Beginner";
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
    
    // ============ Internal Functions ============
    
    function _calculateTotalScore(WisdomFactors memory factors) internal pure returns (uint256) {
        return (
            (factors.stewardshipScore * STEWARDSHIP_WEIGHT) +
            (factors.generosityScore * GENEROSITY_WEIGHT) +
            (factors.wisdomScore * WISDOM_WEIGHT) +
            (factors.communityScore * COMMUNITY_WEIGHT)
        ) / BASIS_POINTS;
    }
}
