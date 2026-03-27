// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title xBibleFiToken — $xBIBLEFI (Super Token)
 * @author BibleFi.eth
 * @notice Superfluid Super Token wrapper for $BIBLEFI.
 *
 * "For everyone who has will be given more, and he will have an abundance."
 * — Matthew 25:29
 *
 * Overview
 * ─────────────────────────────────────────────────────────────────────────────
 * $xBIBLEFI is the Superfluid Super Token that wraps $BIBLEFI (the base ERC-20
 * governance token).  It enables:
 *
 *   • Real-time DAO treasury streaming (IDA / GDA pools)
 *   • Governance-weight distributions via Constant Flow Agreement (CFA)
 *   • VIP DAO reward streaming to active governance participants
 *   • SUP + xBIBLEFI liquidity on Aerodrome (Base)
 *
 * Deployment
 * ─────────────────────────────────────────────────────────────────────────────
 * $xBIBLEFI is NOT deployed by calling this contract directly. Instead, the
 * deployer calls Superfluid's SuperTokenFactory on Base:
 *
 *   ISuperTokenFactory(SUPERFLUID_TOKEN_FACTORY).createERC20Wrapper(
 *       IERC20(BIBLEFI_ADDRESS),
 *       18,                              // same decimals as underlying
 *       ISuperTokenFactory.Upgradability.NON_UPGRADABLE,
 *       "BibleFi Governance Super Token",
 *       "xBIBLEFI"
 *   );
 *
 * This file documents:
 *   a) The Superfluid interfaces used (for IDE / audit clarity)
 *   b) A deployment helper (SuperfluidSuperTokenDeployer)
 *   c) A DAO treasury streaming controller (BibleFiDAOTreasury)
 *
 * Base Chain Addresses
 * ─────────────────────────────────────────────────────────────────────────────
 * Superfluid Host           : 0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74
 * Superfluid CFA Forwarder  : 0x19ba78B9cDB05A877718841c574325fdB53601bb
 * SuperTokenFactory         : 0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3
 */

// ─────────────────────────────────────── Superfluid interfaces (subset) ──

interface IERC20Minimal {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ISuperfluidToken {
    function getUnderlyingToken() external view returns (address);
    function upgrade(uint256 amount) external;
    function downgrade(uint256 amount) external;
    function realtimeBalanceOfNow(address account)
        external
        view
        returns (
            int256  availableBalance,
            uint256 deposit,
            uint256 owedDeposit,
            uint256 timestamp
        );
}

interface ISuperTokenFactory {
    enum Upgradability { NON_UPGRADABLE, SEMI_UPGRADABLE, FULL_UPGRADABLE }

    function createERC20Wrapper(
        IERC20Minimal underlyingToken,
        uint8 underlyingDecimals,
        Upgradability upgradability,
        string calldata name,
        string calldata symbol
    ) external returns (ISuperfluidToken superToken);
}

interface ICFAv1Forwarder {
    function createFlow(
        address token,
        address receiver,
        int96  flowRate,
        bytes  calldata userData
    ) external returns (bool);

    function updateFlow(
        address token,
        address receiver,
        int96  flowRate,
        bytes  calldata userData
    ) external returns (bool);

    function deleteFlow(
        address token,
        address sender,
        address receiver,
        bytes  calldata userData
    ) external returns (bool);

    function getFlow(
        address token,
        address sender,
        address receiver
    )
        external
        view
        returns (
            uint256 lastUpdated,
            int96  flowRate,
            uint256 deposit,
            uint256 owedDeposit
        );
}

// ────────────────────────────────────────────── Deployment helper ──

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev One-shot helper that:
 *      1. Deploys the $xBIBLEFI wrapper via Superfluid's factory.
 *      2. Emits the wrapper address for the frontend / indexer.
 *      3. Optionally notifies the underlying $BIBLEFI token.
 *
 * Deploy this contract once.  Call deployXBIBLEFI() after $BIBLEFI is live.
 */
contract XBibleFiDeployer is Ownable {
    // ── Base chain addresses ──
    address public constant SUPERFLUID_TOKEN_FACTORY =
        0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3;

    address public xBibleFiAddress;

    event XBibleFiDeployed(address indexed xBibleFi, address indexed underlying);

    /**
     * @param biblefiToken Address of the deployed $BIBLEFI ERC-20.
     */
    function deployXBIBLEFI(address biblefiToken) external onlyOwner {
        require(xBibleFiAddress == address(0), "xBIBLEFI already deployed");
        require(biblefiToken != address(0), "invalid underlying");

        ISuperfluidToken wrapper = ISuperTokenFactory(SUPERFLUID_TOKEN_FACTORY)
            .createERC20Wrapper(
                IERC20Minimal(biblefiToken),
                18,
                ISuperTokenFactory.Upgradability.NON_UPGRADABLE,
                "BibleFi Governance Super Token",
                "xBIBLEFI"
            );

        xBibleFiAddress = address(wrapper);
        emit XBibleFiDeployed(xBibleFiAddress, biblefiToken);
    }
}

// ─────────────────────────────────── DAO Treasury streaming controller ──

/**
 * @title BibleFiDAOTreasury
 * @notice Controls $xBIBLEFI streaming from the DAO treasury to
 *         contributors, stakers, and church-partnership beneficiaries.
 *
 *   "Each of you should give what you have decided in your heart to give,
 *    not reluctantly or under compulsion, for God loves a cheerful giver."
 *    — 2 Corinthians 9:7
 */
contract BibleFiDAOTreasury is Ownable {
    // ── Superfluid forwarder on Base ──
    ICFAv1Forwarder public constant CFA_FORWARDER =
        ICFAv1Forwarder(0x19ba78B9cDB05A877718841c574325fdB53601bb);

    ISuperfluidToken public xBibleFi;   // set after deployment

    // Stream types
    bytes32 public constant CONTRIBUTOR_STREAM   = keccak256("CONTRIBUTOR");
    bytes32 public constant CHURCH_STREAM        = keccak256("CHURCH");
    bytes32 public constant GOVERNANCE_STREAM    = keccak256("GOVERNANCE");

    mapping(address => bytes32) public streamType;

    event TreasuryStreamCreated(address indexed recipient, int96 flowRate, bytes32 streamType);
    event TreasuryStreamUpdated(address indexed recipient, int96 newFlowRate);
    event TreasuryStreamDeleted(address indexed recipient);

    constructor(address _xBibleFi) {
        if (_xBibleFi != address(0)) {
            xBibleFi = ISuperfluidToken(_xBibleFi);
        }
    }

    // ── Admin ──

    function setXBibleFi(address _xBibleFi) external onlyOwner {
        require(address(xBibleFi) == address(0), "already set");
        xBibleFi = ISuperfluidToken(_xBibleFi);
    }

    // ── Stream management ──

    /**
     * @notice Start or replace a treasury stream to a recipient.
     * @param recipient   Address receiving the stream.
     * @param flowRate    Tokens per second (int96, must be > 0).
     * @param sType       Stream-type tag (CONTRIBUTOR, CHURCH, GOVERNANCE).
     */
    function createTreasuryStream(
        address recipient,
        int96   flowRate,
        bytes32 sType
    ) external onlyOwner {
        require(address(xBibleFi) != address(0), "xBIBLEFI not set");
        require(recipient != address(0),          "zero recipient");
        require(flowRate > 0,                     "flowRate must be > 0");

        streamType[recipient] = sType;
        CFA_FORWARDER.createFlow(address(xBibleFi), recipient, flowRate, "");
        emit TreasuryStreamCreated(recipient, flowRate, sType);
    }

    /**
     * @notice Adjust an existing treasury stream.
     */
    function updateTreasuryStream(address recipient, int96 newFlowRate) external onlyOwner {
        require(newFlowRate > 0, "use deleteTreasuryStream to stop");
        CFA_FORWARDER.updateFlow(address(xBibleFi), recipient, newFlowRate, "");
        emit TreasuryStreamUpdated(recipient, newFlowRate);
    }

    /**
     * @notice Stop a treasury stream.
     */
    function deleteTreasuryStream(address recipient) external onlyOwner {
        CFA_FORWARDER.deleteFlow(address(xBibleFi), address(this), recipient, "");
        delete streamType[recipient];
        emit TreasuryStreamDeleted(recipient);
    }

    /**
     * @notice Wrap $BIBLEFI held in the treasury into $xBIBLEFI.
     * @param biblefiToken The underlying $BIBLEFI ERC-20 address.
     * @param amount       Amount to wrap (18-decimal).
     */
    function wrapBibleFi(address biblefiToken, uint256 amount) external onlyOwner {
        IERC20Minimal(biblefiToken).approve(address(xBibleFi), amount);
        xBibleFi.upgrade(amount);
    }

    /**
     * @notice Unwrap $xBIBLEFI back to $BIBLEFI.
     */
    function unwrapBibleFi(uint256 amount) external onlyOwner {
        xBibleFi.downgrade(amount);
    }

    /**
     * @notice Helper to compute a monthly-equivalent flow rate.
     * @param monthlyAmount Tokens per month (18-decimal).
     * @return flowRate     Tokens per second as int96.
     */
    function monthlyToFlowRate(uint256 monthlyAmount) external pure returns (int96) {
        uint256 flowRate = monthlyAmount / 30 days;
        require(flowRate <= uint256(uint96(type(int96).max)), "DAOTreasury: flowRate overflows int96");
        return int96(int256(flowRate));
    }
}
