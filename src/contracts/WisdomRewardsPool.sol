
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BibleToken.sol";

/**
 * @title WisdomRewardsPool
 * @dev Distributes $BIBLE rewards based on wisdom scores and DeFi participation
 */
contract WisdomRewardsPool is ReentrancyGuard, Ownable {
    
    BibleToken public immutable bibleToken;
    
    // Reward calculation parameters
    uint256 public constant STAKING_MULTIPLIER = 150; // 1.5x for stakers
    uint256 public constant FARMING_MULTIPLIER = 200; // 2x for farmers
    uint256 public constant WISDOM_MULTIPLIER = 300;  // 3x for high wisdom scores
    uint256 public constant BASE_RATE = 100;          // 1x base rate
    
    // Tracking
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalRewardsClaimed;
    mapping(address => bool) public isActiveStaker;
    mapping(address => bool) public isActiveFarmer;
    
    // Events
    event RewardClaimed(address indexed user, uint256 amount, uint256 wisdomScore);
    event StakingStatusUpdated(address indexed user, bool isActive);
    event FarmingStatusUpdated(address indexed user, bool isActive);
    
    constructor(address _bibleToken) {
        bibleToken = BibleToken(_bibleToken);
    }
    
    /**
     * @dev Calculate rewards based on wisdom score and DeFi participation
     */
    function calculateRewards(address user) public view returns (uint256) {
        uint256 wisdomScore = bibleToken.wisdomScores(user);
        uint256 baseReward = bibleToken.balanceOf(address(this)) / 1000; // 0.1% of pool
        
        uint256 multiplier = BASE_RATE;
        
        // Add staking multiplier
        if (isActiveStaker[user]) {
            multiplier += STAKING_MULTIPLIER;
        }
        
        // Add farming multiplier
        if (isActiveFarmer[user]) {
            multiplier += FARMING_MULTIPLIER;
        }
        
        // Add wisdom multiplier for high scores
        if (wisdomScore >= 80) {
            multiplier += WISDOM_MULTIPLIER;
        } else if (wisdomScore >= 60) {
            multiplier += WISDOM_MULTIPLIER / 2;
        }
        
        return (baseReward * multiplier) / 100;
    }
    
    /**
     * @dev Claim wisdom rewards
     */
    function claimRewards() external nonReentrant {
        require(block.timestamp >= lastClaimTime[msg.sender] + 24 hours, "Can only claim once per day");
        
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards available");
        require(bibleToken.balanceOf(address(this)) >= rewards, "Insufficient pool balance");
        
        lastClaimTime[msg.sender] = block.timestamp;
        totalRewardsClaimed[msg.sender] += rewards;
        
        bibleToken.transfer(msg.sender, rewards);
        
        uint256 wisdomScore = bibleToken.wisdomScores(msg.sender);
        emit RewardClaimed(msg.sender, rewards, wisdomScore);
    }
    
    /**
     * @dev Update staking status (called by approved staking contracts)
     */
    function updateStakingStatus(address user, bool active) external {
        require(bibleToken.approvedStakingPools(msg.sender), "Not approved staking pool");
        isActiveStaker[user] = active;
        emit StakingStatusUpdated(user, active);
    }
    
    /**
     * @dev Update farming status (called by approved farming contracts)
     */
    function updateFarmingStatus(address user, bool active) external {
        require(bibleToken.approvedFarmingPools(msg.sender), "Not approved farming pool");
        isActiveFarmer[user] = active;
        emit FarmingStatusUpdated(user, active);
    }
    
    /**
     * @dev Emergency withdrawal for owner
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = bibleToken.balanceOf(address(this));
        bibleToken.transfer(owner(), balance);
    }
    
    /**
     * @dev Get user's reward info
     */
    function getUserRewardInfo(address user) external view returns (
        uint256 availableRewards,
        uint256 totalClaimed,
        uint256 wisdomScore,
        bool stakingActive,
        bool farmingActive,
        uint256 nextClaimTime
    ) {
        return (
            calculateRewards(user),
            totalRewardsClaimed[user],
            bibleToken.wisdomScores(user),
            isActiveStaker[user],
            isActiveFarmer[user],
            lastClaimTime[user] + 24 hours
        );
    }
}
```
