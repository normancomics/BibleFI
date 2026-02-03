// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BWTYACore - Biblical Wisdom To Yield Algorithm
 * @notice Yield optimization engine based on Biblical financial principles
 * @dev Implements wisdom-guided DeFi strategies on Base chain
 * 
 * Biblical Foundations:
 * - "Divide your portion to seven, or even to eight" - Ecclesiastes 11:2 (Diversification)
 * - "The wise store up choice food and olive oil" - Proverbs 21:20 (Reserves)
 * - "He who gathers money little by little makes it grow" - Proverbs 13:11 (DCA)
 * - "Be not among winebibbers; among riotous eaters of flesh" - Proverbs 23:20 (Avoid Excess)
 */
contract BWTYACore is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct Pool {
        string name;
        string biblicalReference;
        address token;
        uint256 baseAPY;           // In basis points (10000 = 100%)
        uint256 riskLevel;         // 1-10 scale
        uint256 minWisdomScore;    // Minimum wisdom score to participate
        uint256 totalDeposited;
        bool active;
    }
    
    struct UserPosition {
        uint256 amount;
        uint256 depositTime;
        uint256 lastClaimTime;
        uint256 accumulatedRewards;
    }
    
    struct WisdomProfile {
        uint256 score;                // 0-1000 scale
        uint256 titheConsistency;     // Months of consistent tithing
        uint256 generosityMultiplier; // Additional giving bonus (basis points)
        uint256 diversificationScore; // Ecclesiastes 11:2 compliance
        bool hasTitheBonus;           // Active tithe stream detected
        uint256 lastUpdated;
    }

    // ============ Constants ============
    
    // Pool Names (Parable-Based)
    string public constant POOL_TALENTS = "talents";       // Matthew 25:14-30
    string public constant POOL_JOSEPH = "joseph";         // Genesis 41 (Seven Years)
    string public constant POOL_SOLOMON = "solomon";       // 1 Kings 3:12 (Wisdom)
    string public constant POOL_WIDOW = "widow";           // Luke 21:1-4 (Faithful Small Giving)
    
    // APY Calculation
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Wisdom Score Thresholds
    uint256 public constant WISDOM_BEGINNER = 250;
    uint256 public constant WISDOM_FAITHFUL = 500;
    uint256 public constant WISDOM_WISE = 750;
    uint256 public constant WISDOM_STEWARD = 1000;
    
    // Multipliers (in basis points)
    uint256 public constant TITHE_BONUS = 1500;           // 1.5x for active tithers
    uint256 public constant COMMUNITY_FACTOR = 1200;      // 1.2x base community
    uint256 public constant MAX_WISDOM_MULTIPLIER = 3000; // 3x max from wisdom

    // ============ State ============
    
    mapping(string => Pool) public pools;
    string[] public poolNames;
    
    mapping(address => WisdomProfile) public wisdomProfiles;
    mapping(address => mapping(string => UserPosition)) public userPositions;
    
    address public bwspCore;        // BWSP contract for tithe verification
    address public wisdomOracle;    // Off-chain wisdom calculator
    address public treasury;

    // ============ Events ============
    
    event PoolCreated(string indexed name, address token, uint256 baseAPY);
    event Invested(address indexed user, string indexed pool, uint256 amount, string reasoning);
    event Withdrawn(address indexed user, string indexed pool, uint256 amount);
    event YieldClaimed(address indexed user, string indexed pool, uint256 reward);
    event WisdomProfileUpdated(address indexed user, uint256 newScore, uint256 multiplier);
    event PoolAPYAdjusted(string indexed pool, uint256 oldAPY, uint256 newAPY);

    // ============ Errors ============
    
    error PoolNotFound();
    error PoolInactive();
    error InsufficientWisdomScore();
    error InsufficientBalance();
    error NoPositionFound();
    error InvalidAmount();
    error InvalidReasoning();

    // ============ Constructor ============
    
    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
        _initializePools();
    }

    // ============ External Functions ============
    
    /**
     * @notice Invest in a pool with Biblical reasoning
     * @param poolName Pool identifier (talents, joseph, solomon, widow)
     * @param amount Amount to invest
     * @param reasoning Biblical justification for the investment
     * 
     * "For which of you, intending to build a tower, sitteth not down first, 
     *  and counteth the cost" - Luke 14:28
     */
    function invest(
        string calldata poolName,
        uint256 amount,
        string calldata reasoning
    ) external nonReentrant returns (bool) {
        Pool storage pool = pools[poolName];
        
        if (!pool.active) revert PoolInactive();
        if (amount == 0) revert InvalidAmount();
        if (bytes(reasoning).length < 20) revert InvalidReasoning();
        
        WisdomProfile memory profile = wisdomProfiles[msg.sender];
        if (profile.score < pool.minWisdomScore) revert InsufficientWisdomScore();
        
        // Transfer tokens
        IERC20(pool.token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update position
        UserPosition storage position = userPositions[msg.sender][poolName];
        
        // Claim any pending rewards first
        if (position.amount > 0) {
            _claimRewards(msg.sender, poolName);
        }
        
        position.amount += amount;
        position.depositTime = block.timestamp;
        position.lastClaimTime = block.timestamp;
        
        pool.totalDeposited += amount;
        
        // Update diversification score
        _updateDiversificationScore(msg.sender);
        
        emit Invested(msg.sender, poolName, amount, reasoning);
        return true;
    }
    
    /**
     * @notice Withdraw from a pool
     * @param poolName Pool identifier
     * @param amount Amount to withdraw (0 = all)
     */
    function withdraw(
        string calldata poolName,
        uint256 amount
    ) external nonReentrant returns (bool) {
        UserPosition storage position = userPositions[msg.sender][poolName];
        Pool storage pool = pools[poolName];
        
        if (position.amount == 0) revert NoPositionFound();
        
        // Claim pending rewards
        _claimRewards(msg.sender, poolName);
        
        uint256 withdrawAmount = amount == 0 ? position.amount : amount;
        if (withdrawAmount > position.amount) revert InsufficientBalance();
        
        position.amount -= withdrawAmount;
        pool.totalDeposited -= withdrawAmount;
        
        IERC20(pool.token).safeTransfer(msg.sender, withdrawAmount);
        
        emit Withdrawn(msg.sender, poolName, withdrawAmount);
        return true;
    }
    
    /**
     * @notice Claim accumulated yield rewards
     * @param poolName Pool identifier
     */
    function claimYield(string calldata poolName) external nonReentrant returns (uint256) {
        return _claimRewards(msg.sender, poolName);
    }

    // ============ View Functions ============
    
    /**
     * @notice Calculate effective APY including all multipliers
     * @param user User address
     * @param poolName Pool identifier
     * 
     * Formula: effectiveAPY = baseAPY × wisdomMultiplier × titheBonus × communityFactor
     */
    function calculateEffectiveAPY(
        address user,
        string calldata poolName
    ) external view returns (uint256) {
        Pool memory pool = pools[poolName];
        WisdomProfile memory profile = wisdomProfiles[user];
        
        uint256 effectiveAPY = pool.baseAPY;
        
        // Apply wisdom multiplier (1.0x - 1.8x based on score)
        uint256 wisdomMultiplier = _calculateWisdomMultiplier(profile.score);
        effectiveAPY = (effectiveAPY * wisdomMultiplier) / BASIS_POINTS;
        
        // Apply tithe bonus (1.5x if active tithe)
        if (profile.hasTitheBonus) {
            effectiveAPY = (effectiveAPY * TITHE_BONUS) / BASIS_POINTS;
        }
        
        // Apply community factor
        effectiveAPY = (effectiveAPY * COMMUNITY_FACTOR) / BASIS_POINTS;
        
        return effectiveAPY;
    }
    
    /**
     * @notice Get pending rewards for a user position
     */
    function getPendingRewards(
        address user,
        string calldata poolName
    ) external view returns (uint256) {
        return _calculatePendingRewards(user, poolName);
    }
    
    /**
     * @notice Get user's complete profile
     */
    function getUserProfile(address user) external view returns (
        uint256 wisdomScore,
        uint256 totalInvested,
        uint256 totalYieldEarned,
        bool titheActive,
        uint256 governanceVotes
    ) {
        WisdomProfile memory profile = wisdomProfiles[user];
        wisdomScore = profile.score;
        titheActive = profile.hasTitheBonus;
        
        // Calculate totals across all pools
        for (uint256 i = 0; i < poolNames.length; i++) {
            UserPosition memory pos = userPositions[user][poolNames[i]];
            totalInvested += pos.amount;
            totalYieldEarned += pos.accumulatedRewards;
        }
        
        // Governance power based on wisdom score
        governanceVotes = wisdomScore;
    }
    
    /**
     * @notice Get pool information
     */
    function getPool(string calldata poolName) external view returns (Pool memory) {
        return pools[poolName];
    }
    
    /**
     * @notice Get all pool names
     */
    function getAllPools() external view returns (string[] memory) {
        return poolNames;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Update wisdom profile for a user
     * @dev Called by wisdom oracle or BWSP contract
     */
    function updateWisdomProfile(
        address user,
        uint256 score,
        uint256 titheConsistency,
        uint256 generosityMultiplier,
        bool hasTitheBonus
    ) external {
        require(msg.sender == wisdomOracle || msg.sender == bwspCore || msg.sender == owner(), "Unauthorized");
        
        WisdomProfile storage profile = wisdomProfiles[user];
        profile.score = score > WISDOM_STEWARD ? WISDOM_STEWARD : score;
        profile.titheConsistency = titheConsistency;
        profile.generosityMultiplier = generosityMultiplier;
        profile.hasTitheBonus = hasTitheBonus;
        profile.lastUpdated = block.timestamp;
        
        uint256 multiplier = _calculateWisdomMultiplier(score);
        emit WisdomProfileUpdated(user, score, multiplier);
    }
    
    /**
     * @notice Set BWSP Core contract
     */
    function setBWSPCore(address _bwspCore) external onlyOwner {
        bwspCore = _bwspCore;
    }
    
    /**
     * @notice Set wisdom oracle
     */
    function setWisdomOracle(address _oracle) external onlyOwner {
        wisdomOracle = _oracle;
    }
    
    /**
     * @notice Create a new pool
     */
    function createPool(
        string calldata name,
        string calldata biblicalReference,
        address token,
        uint256 baseAPY,
        uint256 riskLevel,
        uint256 minWisdomScore
    ) external onlyOwner {
        pools[name] = Pool({
            name: name,
            biblicalReference: biblicalReference,
            token: token,
            baseAPY: baseAPY,
            riskLevel: riskLevel,
            minWisdomScore: minWisdomScore,
            totalDeposited: 0,
            active: true
        });
        poolNames.push(name);
        
        emit PoolCreated(name, token, baseAPY);
    }

    // ============ Internal Functions ============
    
    function _initializePools() internal {
        // Note: Actual token addresses would be set on deployment
        // These are placeholder structures
    }
    
    function _calculateWisdomMultiplier(uint256 score) internal pure returns (uint256) {
        if (score >= WISDOM_STEWARD) {
            return 18000; // 1.8x (Kingdom Steward)
        } else if (score >= WISDOM_WISE) {
            return 15000; // 1.5x (Wise)
        } else if (score >= WISDOM_FAITHFUL) {
            return 12000; // 1.2x (Faithful)
        } else if (score >= WISDOM_BEGINNER) {
            return 10500; // 1.05x (Beginner)
        }
        return 10000; // 1.0x (Base)
    }
    
    function _calculatePendingRewards(
        address user,
        string memory poolName
    ) internal view returns (uint256) {
        UserPosition memory position = userPositions[user][poolName];
        if (position.amount == 0) return 0;
        
        Pool memory pool = pools[poolName];
        WisdomProfile memory profile = wisdomProfiles[user];
        
        uint256 timeElapsed = block.timestamp - position.lastClaimTime;
        
        // Calculate effective APY
        uint256 effectiveAPY = pool.baseAPY;
        uint256 wisdomMultiplier = _calculateWisdomMultiplier(profile.score);
        effectiveAPY = (effectiveAPY * wisdomMultiplier) / BASIS_POINTS;
        
        if (profile.hasTitheBonus) {
            effectiveAPY = (effectiveAPY * TITHE_BONUS) / BASIS_POINTS;
        }
        
        // Calculate rewards: amount × APY × timeElapsed / SECONDS_PER_YEAR
        uint256 rewards = (position.amount * effectiveAPY * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
        
        return rewards;
    }
    
    function _claimRewards(address user, string memory poolName) internal returns (uint256) {
        uint256 rewards = _calculatePendingRewards(user, poolName);
        
        if (rewards > 0) {
            UserPosition storage position = userPositions[user][poolName];
            position.lastClaimTime = block.timestamp;
            position.accumulatedRewards += rewards;
            
            Pool memory pool = pools[poolName];
            
            // Transfer rewards from treasury
            IERC20(pool.token).safeTransferFrom(treasury, user, rewards);
            
            emit YieldClaimed(user, poolName, rewards);
        }
        
        return rewards;
    }
    
    function _updateDiversificationScore(address user) internal {
        uint256 poolCount = 0;
        
        for (uint256 i = 0; i < poolNames.length; i++) {
            if (userPositions[user][poolNames[i]].amount > 0) {
                poolCount++;
            }
        }
        
        // Ecclesiastes 11:2 - "Give portions to seven, yes to eight"
        // Score based on number of diversified pools
        WisdomProfile storage profile = wisdomProfiles[user];
        profile.diversificationScore = poolCount * 125; // Up to 500 points for 4 pools
    }
}
