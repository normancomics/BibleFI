// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice Minimal Superfluid host interface used for CFA calls
 */
interface ISuperfluidHost {
    function callAgreement(
        address agreementClass,
        bytes calldata callData,
        bytes calldata userData
    ) external returns (bytes memory returnedData);
}

/**
 * @notice Minimal Superfluid SuperToken interface
 */
interface ISuperToken is IERC20 {
    function upgrade(uint256 amount) external;
    function downgrade(uint256 amount) external;
}

/**
 * @notice Minimal Constant Flow Agreement (CFA) interface
 */
interface IConstantFlowAgreement {
    function createFlow(
        ISuperToken token,
        address receiver,
        int96 flowRate,
        bytes calldata ctx
    ) external returns (bytes memory newCtx);

    function updateFlow(
        ISuperToken token,
        address receiver,
        int96 flowRate,
        bytes calldata ctx
    ) external returns (bytes memory newCtx);

    function deleteFlow(
        ISuperToken token,
        address sender,
        address receiver,
        bytes calldata ctx
    ) external returns (bytes memory newCtx);

    function getFlow(
        ISuperToken token,
        address sender,
        address receiver
    )
        external
        view
        returns (
            uint256 timestamp,
            int96 flowRate,
            uint256 deposit,
            uint256 owedDeposit
        );
}

/**
 * @title BibleFiSuperfluid
 * @notice Enables continuous tithing streams via Superfluid for real-time yield earning by receivers
 * @dev Wraps Superfluid CFA calls with biblical-principle guardrails and tithe-stream management
 *
 * "Give, and it will be given to you." - Luke 6:38
 * "Bring ye all the tithes into the storehouse" - Malachi 3:10
 *
 * Features:
 * - Open a per-second tithe stream to any receiver via Superfluid CFA
 * - Update or cancel existing streams
 * - On-chain scripture reference logged with every stream action
 * - Enforces a minimum monthly tithe equivalent (~$1/month)
 * - Owner can add/remove approved Super Tokens
 */
contract BibleFiSuperfluid is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice Minimum flow rate: 1 token unit per 30 days (prevents dust streams)
    int96 public constant MIN_FLOW_RATE = int96(1e18) / int96(30 days);

    /// @notice Canonical scripture reference appended to every stream event
    string public constant SCRIPTURE = "Malachi 3:10 - Bring the full tithe into the storehouse";

    // ============ State ============

    ISuperfluidHost public immutable sfHost;
    IConstantFlowAgreement public immutable cfa;

    /// @notice Super Tokens approved for use with this contract
    mapping(address => bool) public approvedTokens;

    // ============ Events ============

    event TitheStreamStarted(
        address indexed sender,
        address indexed receiver,
        address indexed token,
        int96 flowRate,
        string scripture
    );
    event TitheStreamUpdated(
        address indexed sender,
        address indexed receiver,
        address indexed token,
        int96 newFlowRate,
        string scripture
    );
    event TitheStreamCancelled(
        address indexed sender,
        address indexed receiver,
        address indexed token,
        string scripture
    );
    event TokenApprovalChanged(address indexed token, bool approved);

    // ============ Constructor ============

    /**
     * @param _sfHost Superfluid host contract on Base Mainnet
     * @param _cfa    Constant Flow Agreement contract on Base Mainnet
     * @param _owner  Initial owner (2-step transfer)
     */
    constructor(address _sfHost, address _cfa, address _owner) {
        require(_sfHost != address(0), "BibleFiSuperfluid: zero host");
        require(_cfa != address(0), "BibleFiSuperfluid: zero cfa");
        require(_owner != address(0), "BibleFiSuperfluid: zero owner");
        sfHost = ISuperfluidHost(_sfHost);
        cfa = IConstantFlowAgreement(_cfa);
        _transferOwnership(_owner);
    }

    // ============ External: Stream Management ============

    /**
     * @notice Start a new continuous tithe stream to a receiver.
     * @param token     Approved SuperToken address (e.g. USDCx on Base)
     * @param receiver  Recipient of the stream (church, charity, individual)
     * @param flowRate  Tokens per second (18-decimal denominated per Superfluid convention)
     * @param scripture User-supplied scripture reference logged on-chain
     */
    function startTitheStream(
        address token,
        address receiver,
        int96 flowRate,
        string calldata scripture
    ) external nonReentrant {
        require(approvedTokens[token], "BibleFiSuperfluid: token not approved");
        require(receiver != address(0) && receiver != msg.sender, "BibleFiSuperfluid: invalid receiver");
        require(flowRate >= MIN_FLOW_RATE, "BibleFiSuperfluid: flow rate too low");

        sfHost.callAgreement(
            address(cfa),
            abi.encodeCall(
                cfa.createFlow,
                (ISuperToken(token), receiver, flowRate, new bytes(0))
            ),
            new bytes(0)
        );

        emit TitheStreamStarted(msg.sender, receiver, token, flowRate, scripture);
    }

    /**
     * @notice Update an existing tithe stream's flow rate.
     * @param token       SuperToken address
     * @param receiver    Existing stream receiver
     * @param newFlowRate New tokens-per-second rate
     * @param scripture   Updated scripture note
     */
    function updateTitheStream(
        address token,
        address receiver,
        int96 newFlowRate,
        string calldata scripture
    ) external nonReentrant {
        require(approvedTokens[token], "BibleFiSuperfluid: token not approved");
        require(newFlowRate >= MIN_FLOW_RATE, "BibleFiSuperfluid: flow rate too low");

        sfHost.callAgreement(
            address(cfa),
            abi.encodeCall(
                cfa.updateFlow,
                (ISuperToken(token), receiver, newFlowRate, new bytes(0))
            ),
            new bytes(0)
        );

        emit TitheStreamUpdated(msg.sender, receiver, token, newFlowRate, scripture);
    }

    /**
     * @notice Cancel an active tithe stream.
     * @param token    SuperToken address
     * @param receiver Stream receiver to stop
     */
    function cancelTitheStream(address token, address receiver) external nonReentrant {
        require(approvedTokens[token], "BibleFiSuperfluid: token not approved");

        sfHost.callAgreement(
            address(cfa),
            abi.encodeCall(
                cfa.deleteFlow,
                (ISuperToken(token), msg.sender, receiver, new bytes(0))
            ),
            new bytes(0)
        );

        emit TitheStreamCancelled(msg.sender, receiver, token, SCRIPTURE);
    }

    // ============ View ============

    /**
     * @notice Fetch current flow rate from sender to receiver for a given token.
     * @return flowRate Current per-second flow rate (0 if no active stream)
     */
    function getFlowRate(
        address token,
        address sender,
        address receiver
    ) external view returns (int96 flowRate) {
        (, flowRate, , ) = cfa.getFlow(ISuperToken(token), sender, receiver);
    }

    // ============ Owner: Configuration ============

    /**
     * @notice Approve or revoke a SuperToken for use with tithe streams.
     * @param token    SuperToken address
     * @param approved true to approve, false to revoke
     */
    function setTokenApproval(address token, bool approved) external onlyOwner {
        require(token != address(0), "BibleFiSuperfluid: zero token");
        approvedTokens[token] = approved;
        emit TokenApprovalChanged(token, approved);
    }
}
