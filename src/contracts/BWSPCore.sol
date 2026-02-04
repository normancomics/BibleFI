// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BWSPCore - Biblical Wisdom Synthesis Protocol Core
 * @notice Gas-optimized Superfluid tithing with ZK-proof verification and tiered bonuses
 * @dev Implements biblical 10%/15%/20% tithing with Superfluid streaming on Base chain
 * 
 * "Bring ye all the tithes into the storehouse" - Malachi 3:10
 * 
 * Features:
 * - Multi-tier tithing (10%, 15%, 20%) with APY bonuses (1.5x, 1.7x, 2.0x)
 * - Church registry with verification system
 * - ZK-proof anonymous tithing via Veil.cash integration
 * - Wisdom score integration for bonus calculations
 * - Emergency pause functionality
 */
contract BWSPCore is Ownable, ReentrancyGuard, Pausable {
    // ============ Immutables ============
    ISuperfluid public immutable sf;
    IConstantFlowAgreementV1 public immutable cfa;
    
    // ============ Enums ============
    enum TitheTier { STANDARD, GENEROUS, ABUNDANT }
    
    // ============ Structs ============
    struct Church {
        string name;
        address wallet;
        bool verified;
        uint256 totalReceived;
        uint256 streamCount;
        uint256 registeredAt;
    }
    
    struct TitheStream {
        address church;
        ISuperToken token;
        int96 flowRate;
        TitheTier tier;
        uint256 startedAt;
        uint256 totalStreamed;
        bool active;
    }
    
    struct UserStats {
        uint256 totalTithed;
        uint256 streamsCreated;
        uint256 consecutiveMonths;
        uint256 wisdomScore;
        TitheTier highestTier;
        uint256 lastTitheTime;
    }
    
    // ============ State Variables ============
    address public zkVerifier;
    address public wisdomOracle;
    address public bwtya;
    
    // Tithe rates in basis points (1000 = 10%)
    uint96 public constant TITHE_RATE_STANDARD = 1000;   // 10%
    uint96 public constant TITHE_RATE_GENEROUS = 1500;   // 15%
    uint96 public constant TITHE_RATE_ABUNDANT = 2000;   // 20%
    uint96 public constant BASIS_POINTS = 10000;
    
    // APY bonus multipliers (in basis points, 10000 = 1.0x)
    uint256 public constant BONUS_STANDARD = 15000;  // 1.5x
    uint256 public constant BONUS_GENEROUS = 17000;  // 1.7x
    uint256 public constant BONUS_ABUNDANT = 20000;  // 2.0x
    
    // Wisdom score thresholds
    uint256 public constant WISDOM_THRESHOLD_FAITHFUL = 100;
    uint256 public constant WISDOM_THRESHOLD_GENEROUS = 500;
    uint256 public constant WISDOM_THRESHOLD_STEWARD = 800;
    
    // Minimum stream duration (30 days)
    uint256 public constant MIN_STREAM_DURATION = 30 days;
    
    // ============ Mappings ============
    mapping(bytes32 => Church) public churches;
    bytes32[] public churchIds;
    
    mapping(address => mapping(address => TitheStream)) public userStreams; // user => church => stream
    mapping(address => UserStats) public userStats;
    mapping(address => uint256) public userWisdomScores;
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(address => bool) public approvedTokens;
    
    // ============ Events ============
    event ChurchRegistered(bytes32 indexed churchId, string name, address wallet);
    event ChurchVerified(bytes32 indexed churchId, address verifier);
    event ChurchRemoved(bytes32 indexed churchId);
    
    event TitheStreamStarted(
        address indexed sender,
        address indexed church,
        address indexed token,
        TitheTier tier,
        int96 flowRate,
        uint256 amount
    );
    
    event TitheStreamUpdated(
        address indexed sender,
        address indexed church,
        TitheTier newTier,
        int96 newFlowRate
    );
    
    event TitheStreamStopped(
        address indexed sender,
        address indexed church,
        uint256 totalStreamed
    );
    
    event AnonymousTitheVerified(
        bytes32 indexed nullifier,
        bytes32 indexed churchId,
        uint256 amount
    );
    
    event WisdomScoreUpdated(address indexed user, uint256 newScore);
    event ConsecutiveTithingMilestone(address indexed user, uint256 months);
    
    // ============ Errors ============
    error InsufficientBalance();
    error InvalidReceiver();
    error InvalidTier();
    error ChurchNotVerified();
    error ChurchNotFound();
    error StreamAlreadyExists();
    error StreamDoesNotExist();
    error NullifierAlreadyUsed();
    error InvalidProof();
    error ZeroAmount();
    error TokenNotApproved();
    error InsufficientWisdomScore();
    
    // ============ Constructor ============
    constructor(
        address _sfHost,
        address _cfaV1
    ) Ownable(msg.sender) {
        sf = ISuperfluid(_sfHost);
        cfa = IConstantFlowAgreementV1(_cfaV1);
    }
    
    // ============ Church Management ============
    
    /**
     * @notice Register a new church
     * @param name Church name
     * @param wallet Church receiving wallet
     */
    function registerChurch(
        string calldata name,
        address wallet
    ) external returns (bytes32 churchId) {
        if (wallet == address(0)) revert InvalidReceiver();
        
        churchId = keccak256(abi.encodePacked(name, wallet, block.timestamp));
        
        churches[churchId] = Church({
            name: name,
            wallet: wallet,
            verified: false,
            totalReceived: 0,
            streamCount: 0,
            registeredAt: block.timestamp
        });
        
        churchIds.push(churchId);
        
        emit ChurchRegistered(churchId, name, wallet);
    }
    
    /**
     * @notice Verify a church (admin only)
     * @param churchId Church identifier
     */
    function verifyChurch(bytes32 churchId) external onlyOwner {
        Church storage church = churches[churchId];
        if (church.wallet == address(0)) revert ChurchNotFound();
        
        church.verified = true;
        emit ChurchVerified(churchId, msg.sender);
    }
    
    /**
     * @notice Get all verified churches
     */
    function getVerifiedChurches() external view returns (bytes32[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < churchIds.length; i++) {
            if (churches[churchIds[i]].verified) count++;
        }
        
        bytes32[] memory verified = new bytes32[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < churchIds.length; i++) {
            if (churches[churchIds[i]].verified) {
                verified[j++] = churchIds[i];
            }
        }
        
        return verified;
    }
    
    // ============ Tithing Functions ============
    
    /**
     * @notice Start a tithing stream with tier selection
     * @param churchId Church identifier
     * @param superToken SuperToken address (e.g., USDCx)
     * @param profitAmount Total profit amount (tithe calculated based on tier)
     * @param tier Tithe tier (STANDARD=10%, GENEROUS=15%, ABUNDANT=20%)
     */
    function startTithingStream(
        bytes32 churchId,
        ISuperToken superToken,
        uint256 profitAmount,
        TitheTier tier
    ) external nonReentrant whenNotPaused {
        if (profitAmount == 0) revert ZeroAmount();
        if (!approvedTokens[address(superToken)]) revert TokenNotApproved();
        
        Church storage church = churches[churchId];
        if (!church.verified) revert ChurchNotVerified();
        
        // Check if stream already exists
        TitheStream storage existing = userStreams[msg.sender][church.wallet];
        if (existing.active) revert StreamAlreadyExists();
        
        // Calculate tithe based on tier
        uint96 titheRate = _getTitheRate(tier);
        uint256 titheAmount = (profitAmount * titheRate) / BASIS_POINTS;
        
        // Check balance
        uint256 balance = superToken.balanceOf(msg.sender);
        if (balance < titheAmount) revert InsufficientBalance();
        
        // Calculate flow rate
        int96 flowRate = int96(int256(titheAmount / MIN_STREAM_DURATION));
        
        // Apply wisdom bonus
        flowRate = _applyWisdomBonus(msg.sender, flowRate);
        
        // Create the flow
        bytes memory callData = abi.encodeCall(
            cfa.createFlow,
            (superToken, church.wallet, flowRate, new bytes(0))
        );
        sf.callAgreement(cfa, callData, new bytes(0));
        
        // Track the stream
        userStreams[msg.sender][church.wallet] = TitheStream({
            church: church.wallet,
            token: superToken,
            flowRate: flowRate,
            tier: tier,
            startedAt: block.timestamp,
            totalStreamed: 0,
            active: true
        });
        
        // Update stats
        UserStats storage stats = userStats[msg.sender];
        stats.totalTithed += titheAmount;
        stats.streamsCreated++;
        stats.lastTitheTime = block.timestamp;
        if (tier > stats.highestTier) stats.highestTier = tier;
        
        // Update church stats
        church.streamCount++;
        
        // Notify BWTYA of tithe bonus activation
        _notifyBWTYA(msg.sender, tier);
        
        emit TitheStreamStarted(
            msg.sender,
            church.wallet,
            address(superToken),
            tier,
            flowRate,
            titheAmount
        );
    }
    
    /**
     * @notice Update tithe tier (upgrade/downgrade)
     * @param churchWallet Church wallet address
     * @param newProfitAmount New profit base for calculation
     * @param newTier New tithe tier
     */
    function updateTithingStream(
        address churchWallet,
        uint256 newProfitAmount,
        TitheTier newTier
    ) external nonReentrant whenNotPaused {
        if (newProfitAmount == 0) revert ZeroAmount();
        
        TitheStream storage stream = userStreams[msg.sender][churchWallet];
        if (!stream.active) revert StreamDoesNotExist();
        
        // Calculate new tithe and flow rate
        uint96 titheRate = _getTitheRate(newTier);
        uint256 newTitheAmount = (newProfitAmount * titheRate) / BASIS_POINTS;
        int96 newFlowRate = int96(int256(newTitheAmount / MIN_STREAM_DURATION));
        newFlowRate = _applyWisdomBonus(msg.sender, newFlowRate);
        
        // Update the flow
        bytes memory callData = abi.encodeCall(
            cfa.updateFlow,
            (stream.token, churchWallet, newFlowRate, new bytes(0))
        );
        sf.callAgreement(cfa, callData, new bytes(0));
        
        // Update stream
        stream.flowRate = newFlowRate;
        stream.tier = newTier;
        
        // Update stats
        UserStats storage stats = userStats[msg.sender];
        stats.totalTithed += newTitheAmount;
        if (newTier > stats.highestTier) stats.highestTier = newTier;
        
        emit TitheStreamUpdated(msg.sender, churchWallet, newTier, newFlowRate);
    }
    
    /**
     * @notice Stop a tithing stream
     * @param churchWallet Church wallet address
     */
    function stopTithingStream(address churchWallet) external nonReentrant {
        TitheStream storage stream = userStreams[msg.sender][churchWallet];
        if (!stream.active) revert StreamDoesNotExist();
        
        // Calculate total streamed
        uint256 duration = block.timestamp - stream.startedAt;
        uint256 totalStreamed = uint256(int256(stream.flowRate)) * duration;
        
        // Delete the flow
        bytes memory callData = abi.encodeCall(
            cfa.deleteFlow,
            (stream.token, msg.sender, churchWallet, new bytes(0))
        );
        sf.callAgreement(cfa, callData, new bytes(0));
        
        // Update stream
        stream.active = false;
        stream.totalStreamed = totalStreamed;
        
        emit TitheStreamStopped(msg.sender, churchWallet, totalStreamed);
    }
    
    /**
     * @notice Check if user has active tithe (for BWTYA bonus)
     * @param user User address
     */
    function hasActiveTithe(address user) external view returns (bool) {
        for (uint256 i = 0; i < churchIds.length; i++) {
            address wallet = churches[churchIds[i]].wallet;
            if (userStreams[user][wallet].active) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Get tithe bonus multiplier for BWTYA
     * @param user User address
     * @return multiplier in basis points (15000 = 1.5x)
     */
    function getTitheBonus(address user) external view returns (uint256) {
        TitheTier highestActive = TitheTier.STANDARD;
        bool hasActive = false;
        
        for (uint256 i = 0; i < churchIds.length; i++) {
            address wallet = churches[churchIds[i]].wallet;
            TitheStream memory stream = userStreams[user][wallet];
            if (stream.active && stream.tier >= highestActive) {
                highestActive = stream.tier;
                hasActive = true;
            }
        }
        
        if (!hasActive) return BASIS_POINTS; // 1.0x
        
        if (highestActive == TitheTier.ABUNDANT) return BONUS_ABUNDANT;
        if (highestActive == TitheTier.GENEROUS) return BONUS_GENEROUS;
        return BONUS_STANDARD;
    }
    
    // ============ Anonymous Tithing (ZK) ============
    
    /**
     * @notice Verify and record anonymous tithe with ZK proof
     * @param proof ZK proof data from Veil.cash or Noir
     * @param publicInputs Public inputs [churchId, minAmount, commitment]
     * @param nullifier Unique nullifier to prevent double-spending
     */
    function verifyAnonymousTithe(
        bytes calldata proof,
        uint256[] calldata publicInputs,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        if (usedNullifiers[nullifier]) revert NullifierAlreadyUsed();
        
        usedNullifiers[nullifier] = true;
        
        // Verify the proof
        if (zkVerifier != address(0)) {
            (bool success, ) = zkVerifier.staticcall(
                abi.encodeWithSignature(
                    "verify(bytes,uint256[])",
                    proof,
                    publicInputs
                )
            );
            if (!success) revert InvalidProof();
        }
        
        // Extract church ID and amount from public inputs
        bytes32 churchId = bytes32(publicInputs[0]);
        uint256 amount = publicInputs.length > 1 ? publicInputs[1] : 0;
        
        // Update church stats
        Church storage church = churches[churchId];
        if (church.wallet != address(0)) {
            church.totalReceived += amount;
        }
        
        emit AnonymousTitheVerified(nullifier, churchId, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Calculate tithe amount for a given profit and tier
     */
    function calculateTithe(
        uint256 profitAmount,
        TitheTier tier
    ) external pure returns (uint256) {
        uint96 rate = tier == TitheTier.ABUNDANT ? TITHE_RATE_ABUNDANT :
                      tier == TitheTier.GENEROUS ? TITHE_RATE_GENEROUS :
                      TITHE_RATE_STANDARD;
        return (profitAmount * rate) / BASIS_POINTS;
    }
    
    /**
     * @notice Get flow rate for a user's stream to a church
     */
    function getFlowRate(
        address user,
        address churchWallet
    ) external view returns (int96) {
        return userStreams[user][churchWallet].flowRate;
    }
    
    /**
     * @notice Get user's wisdom score
     */
    function getWisdomScore(address user) external view returns (uint256) {
        return userWisdomScores[user];
    }
    
    /**
     * @notice Get user's complete stats
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    // ============ Admin Functions ============
    
    function setZKVerifier(address _zkVerifier) external onlyOwner {
        zkVerifier = _zkVerifier;
    }
    
    function setWisdomOracle(address _oracle) external onlyOwner {
        wisdomOracle = _oracle;
    }
    
    function setBWTYA(address _bwtya) external onlyOwner {
        bwtya = _bwtya;
    }
    
    function approveToken(address token, bool approved) external onlyOwner {
        approvedTokens[token] = approved;
    }
    
    function updateWisdomScore(address user, uint256 newScore) external {
        require(
            msg.sender == wisdomOracle || msg.sender == owner(),
            "Unauthorized"
        );
        userWisdomScores[user] = newScore;
        emit WisdomScoreUpdated(user, newScore);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ Internal Functions ============
    
    function _getTitheRate(TitheTier tier) internal pure returns (uint96) {
        if (tier == TitheTier.ABUNDANT) return TITHE_RATE_ABUNDANT;
        if (tier == TitheTier.GENEROUS) return TITHE_RATE_GENEROUS;
        return TITHE_RATE_STANDARD;
    }
    
    function _applyWisdomBonus(
        address user,
        int96 baseFlowRate
    ) internal view returns (int96) {
        uint256 wisdomScore = userWisdomScores[user];
        
        if (wisdomScore >= WISDOM_THRESHOLD_STEWARD) {
            // Kingdom Steward: 10% bonus
            return baseFlowRate + (baseFlowRate * 10) / 100;
        } else if (wisdomScore >= WISDOM_THRESHOLD_GENEROUS) {
            // Generous: 5% bonus
            return baseFlowRate + (baseFlowRate * 5) / 100;
        } else if (wisdomScore >= WISDOM_THRESHOLD_FAITHFUL) {
            // Faithful: 2% bonus
            return baseFlowRate + (baseFlowRate * 2) / 100;
        }
        
        return baseFlowRate;
    }
    
    function _notifyBWTYA(address user, TitheTier tier) internal {
        if (bwtya != address(0)) {
            uint256 bonus = tier == TitheTier.ABUNDANT ? BONUS_ABUNDANT :
                           tier == TitheTier.GENEROUS ? BONUS_GENEROUS :
                           BONUS_STANDARD;
            
            (bool success, ) = bwtya.call(
                abi.encodeWithSignature(
                    "updateWisdomProfile(address,uint256,uint256,uint256,bool)",
                    user,
                    userWisdomScores[user],
                    userStats[user].consecutiveMonths,
                    bonus,
                    true // hasTitheBonus
                )
            );
            // Silently continue if call fails
        }
    }
}
