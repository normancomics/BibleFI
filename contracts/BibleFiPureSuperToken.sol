// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  BibleFiPureSuperToken
 * @notice Native Superfluid Pure Super Token — no underlying ERC-20,
 *         no upgrade/downgrade ceremony. CFA and GDA streamable from
 *         block zero on Base.
 *
 *         "The earth is the LORD's, and everything in it." — Psalm 24:1
 *
 * Architecture
 * ────────────
 * • UUPS proxy (this contract) delegates all logic to Superfluid's
 *   canonical Super Token implementation via the SuperTokenFactory.
 * • One-shot initialize():
 *     1. Hands the proxy to SuperTokenFactory (registers it as a super token)
 *     2. Initializes name / symbol / 18 decimals with no underlying ERC-20
 *     3. selfMints the full fixed supply to the treasury — no mint() after this
 * • Fixed supply: 1,000,000,000 × 10^18 per token
 * • Streamable: immediately via CFA (per-second) and GDA (pool) on Base
 */

import {
    ISuperTokenFactory
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {
    CustomSuperTokenBase
} from "@superfluid-finance/ethereum-contracts/contracts/tokens/CustomSuperTokenBase.sol";
import {
    UUPSProxy
} from "@superfluid-finance/ethereum-contracts/contracts/upgradability/UUPSProxy.sol";
import {
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {
    IERC20
} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Minimal interface exposed by this proxy before delegation kicks in.
interface IBibleFiPureSuperToken is ISuperToken {
    function initialize(
        ISuperTokenFactory factory,
        string calldata name,
        string calldata symbol,
        address receiver,
        uint256 initialSupply
    ) external;
}

contract BibleFiPureSuperToken is CustomSuperTokenBase, UUPSProxy {

    // ─── Events ──────────────────────────────────────────────────────────────

    event BibleFiTokenInitialized(
        address indexed token,
        string  name,
        string  symbol,
        address indexed treasury,
        uint256 initialSupply
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    error AlreadyInitialized();
    error ZeroReceiver();
    error ZeroSupply();
    error ZeroFactory();

    // ─── Storage ──────────────────────────────────────────────────────────────

    bool private _initialized;

    // ─── Initialize ───────────────────────────────────────────────────────────

    /**
     * @notice One-shot initializer. Must be called exactly once immediately
     *         after deployment by the Foundry deploy script.
     *
     * @param factory       Base canonical SuperTokenFactory
     *                      (0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3)
     * @param name          Token full name  (e.g. "BibleFi Governance")
     * @param symbol        Token symbol     (e.g. "BIBLEFI")
     * @param receiver      Treasury address — receives the entire initial supply
     *                      (biblefi.base.eth = 0x7bEda57074AA917FF0993fb329E16C2c188baF08)
     * @param initialSupply Total token supply minted once at genesis
     *                      (1_000_000_000 * 1e18)
     */
    function initialize(
        ISuperTokenFactory factory,
        string calldata name,
        string calldata symbol,
        address receiver,
        uint256 initialSupply
    ) external {
        if (_initialized)        revert AlreadyInitialized();
        if (address(factory) == address(0)) revert ZeroFactory();
        if (receiver == address(0))         revert ZeroReceiver();
        if (initialSupply == 0)             revert ZeroSupply();

        _initialized = true;

        // Step 1 — hand this proxy to the SuperTokenFactory.
        //          This wires it into the Superfluid protocol registry so that
        //          isSuperToken(address(this)) returns true on the Host.
        factory.initializeCustomSuperToken(address(this));

        // Step 2 — initialize the Super Token metadata.
        //          underlying = address(0) → pure super token (no ERC-20 wrapper).
        ISuperToken(address(this)).initialize(
            IERC20(address(0)),
            18,
            name,
            symbol
        );

        // Step 3 — mint the full fixed supply to the treasury.
        //          selfMint is the only permissible mint path; there is NO
        //          public mint() function — supply is fixed from this point.
        ISuperToken(address(this)).selfMint(receiver, initialSupply, "");

        emit BibleFiTokenInitialized(
            address(this),
            name,
            symbol,
            receiver,
            initialSupply
        );
    }

    // ─── UUPS ─────────────────────────────────────────────────────────────────

    /**
     * @dev No upgrade authority — the treasury multi-sig can be wired here
     *      later if governance votes to enable upgradability. For genesis
     *      deploy, upgrades are intentionally locked.
     */
    function _authorizeUpgrade(address) internal override {
        revert("BibleFi: upgrades locked at genesis");
    }
}
