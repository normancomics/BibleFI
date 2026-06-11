// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  BibleFiSuperfluid
 * @notice Protocol-enforced tithe streaming via Superfluid CFA on Base.
 *
 *         "Bring the whole tithe into the storehouse." — Malachi 3:10
 *
 *         Every yield interaction in BibleFi routes 10% (TITHE_RATE) of
 *         the principal flow to the user's chosen verified Church address
 *         via a Superfluid Constant Flow Agreement stream — automatically,
 *         on-chain, in real time.
 *
 * Key constants
 * ─────────────
 * TITHE_RATE = 1_000 (basis points) = 10%
 *
 * Flow lifecycle
 * ──────────────
 *   openTitheStream()   — creates or updates a per-second CFA stream to Church
 *   closeTitheStream()  — terminates the stream (user opt-out / migration)
 *   getFlowInfo()       — view helper for current flow rate + accrued balance
 */

import {
    ISuperfluid,
    ISuperToken,
    ISuperApp
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {
    CFAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BibleFiSuperfluid is Ownable, ReentrancyGuard {
    using CFAv1Library for CFAv1Library.InitData;

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice Tithe rate in basis points. 1000 bp = 10%.
    ///         "A tithe of everything … belongs to the LORD" (Leviticus 27:30)
    uint256 public constant TITHE_RATE = 1_000;
    uint256 public constant BASIS_POINTS = 10_000;

    // ─── Superfluid protocol references (Base mainnet) ────────────────────────

    ISuperfluid           public immutable host;
    IConstantFlowAgreementV1 public immutable cfa;
    CFAv1Library.InitData private _cfaLib;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice Maps (user, superToken) → their chosen Church receiver address.
    mapping(address => mapping(address => address)) public userChurch;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TitheStreamOpened(
        address indexed user,
        address indexed superToken,
        address indexed church,
        int96   flowRate
    );
    event TitheStreamClosed(
        address indexed user,
        address indexed superToken,
        address indexed church
    );
    event ChurchUpdated(
        address indexed user,
        address indexed superToken,
        address oldChurch,
        address newChurch
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroFlowRate();
    error ZeroChurch();
    error NoActiveStream();
    error SameChurch();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        ISuperfluid     _host,
        IConstantFlowAgreementV1 _cfa
    ) {
        host   = _host;
        cfa    = _cfa;
        _cfaLib = CFAv1Library.InitData({ host: _host, cfa: _cfa });
    }

    // ─── Tithe helpers ────────────────────────────────────────────────────────

    /**
     * @notice Calculates the tithe portion of a given flow rate.
     * @param totalFlowRate The user's intended total per-second flow rate (wei/s).
     * @return titheFlow    10% of totalFlowRate — the Church's portion.
     * @return netFlow      90% of totalFlowRate — the user's retained portion.
     */
    function calculateTithe(int96 totalFlowRate)
        public
        pure
        returns (int96 titheFlow, int96 netFlow)
    {
        titheFlow = int96(int256((uint256(uint96(totalFlowRate)) * TITHE_RATE) / BASIS_POINTS));
        netFlow   = totalFlowRate - titheFlow;
    }

    // ─── Core streaming ───────────────────────────────────────────────────────

    /**
     * @notice Opens (or updates) a per-second tithe stream from `msg.sender`
     *         to their designated Church address, denominated in `superToken`.
     *
     *         The protocol enforces the 10% tithe automatically:
     *         the caller specifies `totalFlowRate`; the contract splits it
     *         into 10% to the Church and 90% retained by the caller.
     *
     * @param superToken     $BIBLEFI or $WISDOM Pure Super Token address.
     * @param church         Verified Church receiver address.
     * @param totalFlowRate  Total desired flow rate in wei/sec (int96).
     *                       Must be > 0. Superfluid streams are per-second.
     */
    function openTitheStream(
        ISuperToken superToken,
        address church,
        int96 totalFlowRate
    ) external nonReentrant {
        if (totalFlowRate <= 0) revert ZeroFlowRate();
        if (church == address(0)) revert ZeroChurch();

        address oldChurch = userChurch[msg.sender][address(superToken)];
        if (oldChurch != address(0) && oldChurch != church) {
            // Close old stream before opening new one to different Church
            _closeTitheStream(superToken, oldChurch);
            emit ChurchUpdated(msg.sender, address(superToken), oldChurch, church);
        }

        userChurch[msg.sender][address(superToken)] = church;

        (int96 titheFlow, ) = calculateTithe(totalFlowRate);

        (, int96 existingFlow,,) = cfa.getFlow(superToken, msg.sender, church);
        if (existingFlow == 0) {
            _cfaLib.createFlowByOperator(msg.sender, church, superToken, titheFlow);
        } else {
            _cfaLib.updateFlowByOperator(msg.sender, church, superToken, titheFlow);
        }

        emit TitheStreamOpened(msg.sender, address(superToken), church, titheFlow);
    }

    /**
     * @notice Closes the active tithe stream from `msg.sender` to their Church.
     * @param superToken $BIBLEFI or $WISDOM Super Token address.
     */
    function closeTitheStream(ISuperToken superToken) external nonReentrant {
        address church = userChurch[msg.sender][address(superToken)];
        if (church == address(0)) revert NoActiveStream();

        _closeTitheStream(superToken, church);
        delete userChurch[msg.sender][address(superToken)];

        emit TitheStreamClosed(msg.sender, address(superToken), church);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    /**
     * @notice Returns the active flow rate from `user` to their Church for a
     *         given super token.
     */
    function getFlowInfo(address user, ISuperToken superToken)
        external
        view
        returns (
            address church,
            int96   flowRate,
            uint256 deposit,
            uint256 owedDeposit,
            uint256 timestamp
        )
    {
        church = userChurch[user][address(superToken)];
        if (church != address(0)) {
            (timestamp, flowRate, deposit, owedDeposit) = cfa.getFlow(
                superToken,
                user,
                church
            );
        }
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _closeTitheStream(ISuperToken superToken, address church) internal {
        _cfaLib.deleteFlowByOperator(msg.sender, church, superToken);
    }
}
