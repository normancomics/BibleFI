// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BWSPCore - Biblical Wisdom Synthesis Protocol Core
 * @notice Gas-optimized Superfluid tithing with ZK-proof verification
 * @dev Implements biblical 10% tithing with Superfluid streaming on Base chain
 * 
 * "Bring ye all the tithes into the storehouse" - Malachi 3:10
 */
contract BWSPCore is Ownable, ReentrancyGuard {
    // ============ Immutables ============
    ISuperfluid public immutable sf;
    IConstantFlowAgreementV1 public immutable cfa;
    
    // ============ State Variables ============
    address public tithingReceiver;
    address public zkVerifier;
    
    // Tithe rate: 10.00% (1000 basis points)
    uint96 public constant TITHE_RATE = 1000;
    uint96 public constant BASIS_POINTS = 10000;
    
    // Wisdom score thresholds for flow rate adjustments
    uint256 public constant WISDOM_THRESHOLD_FAITHFUL = 100;
    uint256 public constant WISDOM_THRESHOLD_GENEROUS = 500;
    
    // Minimum stream duration (30 days in seconds)
    uint256 public constant MIN_STREAM_DURATION = 30 days;
    
    // ============ Mappings ============
    mapping(address => mapping(address => uint256)) public userStreams; // user => token => amount
    mapping(address => uint256) public userWisdomScores;
    mapping(bytes32 => bool) public usedNullifiers;
    
    // ============ Events ============
    event TithingStreamStarted(
        address indexed sender,
        address indexed receiver,
        address indexed token,
        uint256 totalAmount,
        int96 flowRate
    );
    
    event TithingStreamUpdated(
        address indexed sender,
        address indexed receiver,
        address indexed token,
        int96 newFlowRate
    );
    
    event TithingStreamStopped(
        address indexed sender,
        address indexed receiver,
        address indexed token
    );
    
    event AnonymousTitheVerified(
        bytes32 indexed nullifier,
        address indexed receiver,
        uint256 amount
    );
    
    event WisdomScoreUpdated(
        address indexed user,
        uint256 newScore
    );
    
    event TithingReceiverUpdated(
        address indexed oldReceiver,
        address indexed newReceiver
    );
    
    // ============ Errors ============
    error InsufficientBalance();
    error InvalidReceiver();
    error StreamAlreadyExists();
    error StreamDoesNotExist();
    error NullifierAlreadyUsed();
    error InvalidProof();
    error ZeroAmount();
    
    // ============ Constructor ============
    constructor(
        address _sfHost,
        address _cfaV1,
        address _tithingReceiver
    ) Ownable(msg.sender) {
        if (_tithingReceiver == address(0)) revert InvalidReceiver();
        
        sf = ISuperfluid(_sfHost);
        cfa = IConstantFlowAgreementV1(_cfaV1);
        tithingReceiver = _tithingReceiver;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Start a tithing stream (10% of profits)
     * @param superToken SuperToken address (e.g., USDCx, DAIx)
     * @param profitAmount Total profit amount (tithe = 10% of this)
     */
    function startTithingStream(
        ISuperToken superToken,
        uint256 profitAmount
    ) external nonReentrant {
        if (profitAmount == 0) revert ZeroAmount();
        
        // Calculate tithe amount (10%)
        uint256 titheAmount = (profitAmount * TITHE_RATE) / BASIS_POINTS;
        
        // Check SuperToken balance
        uint256 balance = superToken.balanceOf(msg.sender);
        if (balance < titheAmount) revert InsufficientBalance();
        
        // Check if stream already exists
        (, int96 existingFlowRate, , ) = cfa.getFlow(
            superToken,
            msg.sender,
            tithingReceiver
        );
        if (existingFlowRate > 0) revert StreamAlreadyExists();
        
        // Calculate flow rate (amount per second over 30 days)
        int96 flowRate = int96(int256(titheAmount / MIN_STREAM_DURATION));
        
        // Apply wisdom bonus if applicable
        flowRate = _applyWisdomBonus(msg.sender, flowRate);
        
        // Create the flow using host.callAgreement
        bytes memory callData = abi.encodeCall(
            cfa.createFlow,
            (superToken, tithingReceiver, flowRate, new bytes(0))
        );
        
        sf.callAgreement(cfa, callData, new bytes(0));
        
        // Track the stream
        userStreams[msg.sender][address(superToken)] = titheAmount;
        
        emit TithingStreamStarted(
            msg.sender,
            tithingReceiver,
            address(superToken),
            titheAmount,
            flowRate
        );
    }
    
    /**
     * @notice Update an existing tithing stream
     * @param superToken SuperToken address
     * @param newProfitAmount New profit amount for recalculation
     */
    function updateTithingStream(
        ISuperToken superToken,
        uint256 newProfitAmount
    ) external nonReentrant {
        if (newProfitAmount == 0) revert ZeroAmount();
        
        // Check stream exists
        (, int96 existingFlowRate, , ) = cfa.getFlow(
            superToken,
            msg.sender,
            tithingReceiver
        );
        if (existingFlowRate == 0) revert StreamDoesNotExist();
        
        // Calculate new tithe and flow rate
        uint256 newTitheAmount = (newProfitAmount * TITHE_RATE) / BASIS_POINTS;
        int96 newFlowRate = int96(int256(newTitheAmount / MIN_STREAM_DURATION));
        newFlowRate = _applyWisdomBonus(msg.sender, newFlowRate);
        
        // Update the flow
        bytes memory callData = abi.encodeCall(
            cfa.updateFlow,
            (superToken, tithingReceiver, newFlowRate, new bytes(0))
        );
        
        sf.callAgreement(cfa, callData, new bytes(0));
        
        // Update tracking
        userStreams[msg.sender][address(superToken)] = newTitheAmount;
        
        emit TithingStreamUpdated(
            msg.sender,
            tithingReceiver,
            address(superToken),
            newFlowRate
        );
    }
    
    /**
     * @notice Stop a tithing stream
     * @param superToken SuperToken address
     */
    function stopTithingStream(ISuperToken superToken) external nonReentrant {
        // Check stream exists
        (, int96 existingFlowRate, , ) = cfa.getFlow(
            superToken,
            msg.sender,
            tithingReceiver
        );
        if (existingFlowRate == 0) revert StreamDoesNotExist();
        
        // Delete the flow
        bytes memory callData = abi.encodeCall(
            cfa.deleteFlow,
            (superToken, msg.sender, tithingReceiver, new bytes(0))
        );
        
        sf.callAgreement(cfa, callData, new bytes(0));
        
        // Clear tracking
        delete userStreams[msg.sender][address(superToken)];
        
        emit TithingStreamStopped(
            msg.sender,
            tithingReceiver,
            address(superToken)
        );
    }
    
    /**
     * @notice Verify and record anonymous tithe with ZK proof
     * @param proof ZK proof data
     * @param publicInputs Public inputs [root, receiver, amount, ...]
     * @param nullifier Unique nullifier to prevent double-spending
     */
    function verifyAnonymousTithe(
        bytes calldata proof,
        uint256[] calldata publicInputs,
        bytes32 nullifier
    ) external nonReentrant {
        // Check nullifier hasn't been used
        if (usedNullifiers[nullifier]) revert NullifierAlreadyUsed();
        
        // Mark nullifier as used
        usedNullifiers[nullifier] = true;
        
        // Verify the proof (delegated to ZK verifier contract)
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
        
        // Extract amount from public inputs (index 2)
        uint256 amount = publicInputs.length > 2 ? publicInputs[2] : 0;
        
        emit AnonymousTitheVerified(nullifier, tithingReceiver, amount);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update the tithing receiver address
     * @param newReceiver New receiver address
     */
    function setTithingReceiver(address newReceiver) external onlyOwner {
        if (newReceiver == address(0)) revert InvalidReceiver();
        
        address oldReceiver = tithingReceiver;
        tithingReceiver = newReceiver;
        
        emit TithingReceiverUpdated(oldReceiver, newReceiver);
    }
    
    /**
     * @notice Set the ZK verifier contract address
     * @param _zkVerifier ZK verifier contract address
     */
    function setZKVerifier(address _zkVerifier) external onlyOwner {
        zkVerifier = _zkVerifier;
    }
    
    /**
     * @notice Update a user's wisdom score
     * @param user User address
     * @param newScore New wisdom score
     */
    function updateWisdomScore(address user, uint256 newScore) external onlyOwner {
        userWisdomScores[user] = newScore;
        emit WisdomScoreUpdated(user, newScore);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Calculate tithe amount from profit
     * @param profitAmount Total profit amount
     * @return titheAmount 10% tithe amount
     */
    function calculateTithe(uint256 profitAmount) external pure returns (uint256) {
        return (profitAmount * TITHE_RATE) / BASIS_POINTS;
    }
    
    /**
     * @notice Get flow rate for a user's stream
     * @param user User address
     * @param superToken SuperToken address
     * @return flowRate Current flow rate
     */
    function getFlowRate(
        address user,
        ISuperToken superToken
    ) external view returns (int96) {
        (, int96 flowRate, , ) = cfa.getFlow(
            superToken,
            user,
            tithingReceiver
        );
        return flowRate;
    }
    
    /**
     * @notice Get user's wisdom score
     * @param user User address
     * @return score Wisdom score
     */
    function getWisdomScore(address user) external view returns (uint256) {
        return userWisdomScores[user];
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Apply wisdom bonus to flow rate
     * "The generous soul shall be made fat" - Proverbs 11:25
     */
    function _applyWisdomBonus(
        address user,
        int96 baseFlowRate
    ) internal view returns (int96) {
        uint256 wisdomScore = userWisdomScores[user];
        
        if (wisdomScore >= WISDOM_THRESHOLD_GENEROUS) {
            // Generous givers get 5% bonus (voluntary additional giving)
            return baseFlowRate + (baseFlowRate * 5) / 100;
        } else if (wisdomScore >= WISDOM_THRESHOLD_FAITHFUL) {
            // Faithful givers get 2% bonus
            return baseFlowRate + (baseFlowRate * 2) / 100;
        }
        
        return baseFlowRate;
    }
}
