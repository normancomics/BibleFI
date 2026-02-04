// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BWTYACore - Biblical Wisdom To Yield Algorithm
 * @notice Yield optimization engine based on Biblical financial principles
 * @dev Implements wisdom-guided DeFi strategies on Base chain with tithe bonuses
 * 
 * Biblical Foundations:
 * - "Divide your portion to seven, or even to eight" - Ecclesiastes 11:2 (Diversification)
 * - "The wise store up choice food and olive oil" - Proverbs 21:20 (Reserves)
 * - "He who gathers money little by little makes it grow" - Proverbs 13:11 (DCA)
 * - "Be not among winebibbers; among riotous eaters of flesh" - Proverbs 23:20 (Avoid Excess)
 * 
 * Features:
 * - Four Parable-based yield pools with different risk profiles
 * - Wisdom score multipliers (1.0x - 1.8x)
 * - Tithe bonus integration (1.5x - 2.0x for active tithers)
 * - Community factor for ecosystem participation
 * - Emergency pause and rate limiting
 */
contract BWTYACore is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct Pool {
        string name;
        string biblicalReference;
        string description;
        address token;
        uint256 baseAPY;           // In basis points (10000 = 100%)
        uint256 riskLevel;         // 1-10 scale
        uint256 minWisdomScore;    // Minimum wisdom score to participate
        uint256 minInvestment;     // Minimum investment amount
        uint256 totalDeposited;
        uint256 totalYieldPaid;
        bool active;
    }
    
    struct UserPosition {
        uint256 amount;
        uint256 depositTime;
        uint256 lastClaimTime;
        uint256 accumulatedRewards;
        string investmentReasoning; // Biblical justification
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
    uint256 public constant TITHE_BONUS_STANDARD = 15000;   // 1.5x for 10% tithers
    uint256 public constant TITHE_BONUS_GENEROUS = 17000;   // 1.7x for 15% tithers
    uint256 public constant TITHE_BONUS_ABUNDANT = 20000;   // 2.0x for 20% tithers
    uint256 public constant COMMUNITY_FACTOR = 12000;       // 1.2x base community
    uint256 public constant MAX_WISDOM_MULTIPLIER = 30000;  // 3.0x max from wisdom

    // ============ State ============
    
    mapping(string => Pool) public pools;
    string[] public poolNames;
    
    mapping(address => WisdomProfile) public wisdomProfiles;
    mapping(address => mapping(string => UserPosition)) public userPositions;
    
    address public bwspCore;        // BWSP contract for tithe verification
    address public wisdomOracle;    // Off-chain wisdom calculator
    address public treasury;
    
    // Rate limiting
    uint256 public maxDailyWithdrawal;
    mapping(address => uint256) public dailyWithdrawals;
    mapping(address => uint256) public lastWithdrawalDay;

    // ============ Events ============
    
    event PoolCreated(string indexed name, address token, uint256 baseAPY, uint256 riskLevel);
    event PoolUpdated(string indexed name, uint256 newAPY, bool active);
    event Invested(address indexed user, string indexed pool, uint256 amount, string reasoning);
    event Withdrawn(address indexed user, string indexed pool, uint256 amount);
    event YieldClaimed(address indexed user, string indexed pool, uint256 reward);
    event WisdomProfileUpdated(address indexed user, uint256 newScore, uint256 multiplier, bool hasTitheBonus);
    event EmergencyWithdraw(address indexed user, string indexed pool, uint256 amount);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // ============ Errors ============
    
    error PoolNotFound();
    error PoolInactive();
    error InsufficientWisdomScore();
    error InsufficientBalance();
    error NoPositionFound();
    error InvalidAmount();
    error InvalidReasoning();
    error BelowMinimumInvestment();
    error DailyLimitExceeded();
    error Unauthorized();

    // ============ Constructor ============
    
    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
        maxDailyWithdrawal = 100000 * 10**6; // 100k USDC default
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
    ) external nonReentrant whenNotPaused returns (bool) {
        Pool storage pool = pools[poolName];
        
        if (bytes(pool.name).length == 0) revert PoolNotFound();
        if (!pool.active) revert PoolInactive();
        if (amount == 0) revert InvalidAmount();
        if (amount < pool.minInvestment) revert BelowMinimumInvestment();
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
        position.investmentReasoning = reasoning;
        
        pool.totalDeposited += amount;
        
        // Update diversification score
        _updateDiversificationScore(msg.sender);
        
        emit Invested(msg.sender, poolName, amount, reasoning);
        return true;
    }
    
    /**
     * @notice Withdraw from a pool with rate limiting
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
        
        uint256 withdrawAmount = amount == 0 ? position.amount : amount;
        if (withdrawAmount > position.amount) revert InsufficientBalance();
        
        // Check daily withdrawal limit
        uint256 today = block.timestamp / 1 days;
        if (lastWithdrawalDay[msg.sender] < today) {
            dailyWithdrawals[msg.sender] = 0;
            lastWithdrawalDay[msg.sender] = today;
        }
        
        if (dailyWithdrawals[msg.sender] + withdrawAmount > maxDailyWithdrawal) {
            revert DailyLimitExceeded();
        }
        
        // Claim pending rewards
        _claimRewards(msg.sender, poolName);
        
        position.amount -= withdrawAmount;
        pool.totalDeposited -= withdrawAmount;
        dailyWithdrawals[msg.sender] += withdrawAmount;
        
        IERC20(pool.token).safeTransfer(msg.sender, withdrawAmount);
        
        // Update diversification score
        _updateDiversificationScore(msg.sender);
        
        emit Withdrawn(msg.sender, poolName, withdrawAmount);
        return true;
    }
    
    /**
     * @notice Emergency withdraw without rewards (bypasses rate limit)
     * @param poolName Pool identifier
     */
    function emergencyWithdraw(string calldata poolName) external nonReentrant {
        UserPosition storage position = userPositions[msg.sender][poolName];
        Pool storage pool = pools[poolName];
        
        if (position.amount == 0) revert NoPositionFound();
        
        uint256 amount = position.amount;
        position.amount = 0;
        position.lastClaimTime = block.timestamp;
        pool.totalDeposited -= amount;
        
        IERC20(pool.token).safeTransfer(msg.sender, amount);
        
        emit EmergencyWithdraw(msg.sender, poolName, amount);
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
        if (bytes(pool.name).length == 0) return 0;
        
        WisdomProfile memory profile = wisdomProfiles[user];
        
        uint256 effectiveAPY = pool.baseAPY;
        
        // Apply wisdom multiplier (1.0x - 1.8x based on score)
        uint256 wisdomMultiplier = _calculateWisdomMultiplier(profile.score);
        effectiveAPY = (effectiveAPY * wisdomMultiplier) / BASIS_POINTS;
        
        // Apply tithe bonus (1.5x - 2.0x if active tithe)
        if (profile.hasTitheBonus) {
            uint256 titheBonus = profile.generosityMultiplier > 0 
                ? profile.generosityMultiplier 
                : TITHE_BONUS_STANDARD;
            effectiveAPY = (effectiveAPY * titheBonus) / BASIS_POINTS;
        }
        
        // Apply community factor
        effectiveAPY = (effectiveAPY * COMMUNITY_FACTOR) / BASIS_POINTS;
        
        // Apply diversification bonus (up to 1.2x for 4 pools)
        uint256 diversificationBonus = _calculateDiversificationBonus(profile.diversificationScore);
        effectiveAPY = (effectiveAPY * diversificationBonus) / BASIS_POINTS;
        
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
        uint256 governanceVotes,
        string memory preferredChurch
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
        
        // Governance power based on wisdom score + investment
        governanceVotes = wisdomScore + (totalInvested / 1e18);
        preferredChurch = ""; // Set via BWSP
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
    
    /**
     * @notice Get user's position in a pool
     */
    function getPosition(
        address user,
        string calldata poolName
    ) external view returns (UserPosition memory) {
        return userPositions[user][poolName];
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
        if (msg.sender != wisdomOracle && msg.sender != bwspCore && msg.sender != owner()) {
            revert Unauthorized();
        }
        
        WisdomProfile storage profile = wisdomProfiles[user];
        profile.score = score > WISDOM_STEWARD ? WISDOM_STEWARD : score;
        profile.titheConsistency = titheConsistency;
        profile.generosityMultiplier = generosityMultiplier;
        profile.hasTitheBonus = hasTitheBonus;
        profile.lastUpdated = block.timestamp;
        
        uint256 multiplier = _calculateWisdomMultiplier(score);
        emit WisdomProfileUpdated(user, score, multiplier, hasTitheBonus);
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
     * @notice Update treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }
    
    /**
     * @notice Update daily withdrawal limit
     */
    function setMaxDailyWithdrawal(uint256 _max) external onlyOwner {
        maxDailyWithdrawal = _max;
    }
    
    /**
     * @notice Create a new pool
     */
    function createPool(
        string calldata name,
        string calldata biblicalReference,
        string calldata description,
        address token,
        uint256 baseAPY,
        uint256 riskLevel,
        uint256 minWisdomScore,
        uint256 minInvestment
    ) external onlyOwner {
        pools[name] = Pool({
            name: name,
            biblicalReference: biblicalReference,
            description: description,
            token: token,
            baseAPY: baseAPY,
            riskLevel: riskLevel,
            minWisdomScore: minWisdomScore,
            minInvestment: minInvestment,
            totalDeposited: 0,
            totalYieldPaid: 0,
            active: true
        });
        poolNames.push(name);
        
        emit PoolCreated(name, token, baseAPY, riskLevel);
    }
    
    /**
     * @notice Update pool parameters
     */
    function updatePool(
        string calldata name,
        uint256 newAPY,
        bool active
    ) external onlyOwner {
        Pool storage pool = pools[name];
        if (bytes(pool.name).length == 0) revert PoolNotFound();
        
        pool.baseAPY = newAPY;
        pool.active = active;
        
        emit PoolUpdated(name, newAPY, active);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Internal Functions ============
    
    function _initializePools() internal {
        // Pools will be initialized via createPool() after deployment
        // with actual token addresses for Base mainnet
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
    
    function _calculateDiversificationBonus(uint256 diversificationScore) internal pure returns (uint256) {
        // Ecclesiastes 11:2 - "Give portions to seven, yes to eight"
        // Bonus for diversifying across multiple pools
        if (diversificationScore >= 500) return 12000; // 1.2x for 4 pools
        if (diversificationScore >= 375) return 11500; // 1.15x for 3 pools
        if (diversificationScore >= 250) return 11000; // 1.1x for 2 pools
        return 10000; // 1.0x for 1 pool
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
        
        // Calculate effective APY with all multipliers
        uint256 effectiveAPY = pool.baseAPY;
        uint256 wisdomMultiplier = _calculateWisdomMultiplier(profile.score);
        effectiveAPY = (effectiveAPY * wisdomMultiplier) / BASIS_POINTS;
        
        if (profile.hasTitheBonus) {
            uint256 titheBonus = profile.generosityMultiplier > 0 
                ? profile.generosityMultiplier 
                : TITHE_BONUS_STANDARD;
            effectiveAPY = (effectiveAPY * titheBonus) / BASIS_POINTS;
        }
        
        effectiveAPY = (effectiveAPY * COMMUNITY_FACTOR) / BASIS_POINTS;
        
        uint256 diversificationBonus = _calculateDiversificationBonus(profile.diversificationScore);
        effectiveAPY = (effectiveAPY * diversificationBonus) / BASIS_POINTS;
        
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
            
            Pool storage pool = pools[poolName];
            pool.totalYieldPaid += rewards;
            
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
