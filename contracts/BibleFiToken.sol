// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  BibleFiToken ($BIBLEFI)
 * @notice Governance token for the BibleFi Protocol on Base Chain.
 *
 *         "For wisdom is more precious than rubies, and nothing you
 *          desire can compare with her." — Proverbs 8:11
 *
 * ────────────────────────────────────────────────────────────────────
 * Total Supply: 1,000,000,000 BIBLEFI (1 Billion)
 *
 * Distribution (minted at construction, immutable thereafter):
 *   40% → communityRewardsPool    — stewardship incentives, liquidity mining, early adopters
 *   30% → developmentWallet       — protocol development, audits, infrastructure
 *   15% → churchPartnershipFund   — church onboarding incentives, pilot programmes
 *   10% → teamVestingContract     — team & core contributors (4-year vest, 1-year cliff)
 *    5% → advisorPool             — theological board, strategic advisors
 *
 * Token capabilities
 * ──────────────────
 *   • ERC-20 Votes  — on-chain delegation for Governor-compatible DAO
 *   • ERC-20 Permit — gasless approvals (EIP-2612)
 *   • Pausable      — emergency circuit-breaker (owner-controlled)
 *   • Ownable2Step  — two-step ownership transfer for safety
 * ────────────────────────────────────────────────────────────────────
 */

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
// OpenZeppelin ≤ 4.x ships ERC20Permit under the draft- prefix; ERC20Votes
// inherits it, so we import ERC20Votes and call ERC20Permit("name") in the
// constructor to initialise EIP-712.
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract BibleFiToken is ERC20, ERC20Burnable, ERC20Pausable, ERC20Votes, Ownable2Step {

    // ─── Supply ───────────────────────────────────────────────────────────────

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 Billion

    // ─── Distribution basis points (must sum to 10 000) ──────────────────────

    uint256 public constant COMMUNITY_REWARDS_BPS  = 4_000; // 40%
    uint256 public constant DEVELOPMENT_BPS        = 3_000; // 30%
    uint256 public constant CHURCH_PARTNER_BPS     = 1_500; // 15%
    uint256 public constant TEAM_VESTING_BPS       = 1_000; // 10%
    uint256 public constant ADVISOR_POOL_BPS       =   500; //  5%

    // ─── Immutable allocation addresses ──────────────────────────────────────

    address public immutable communityRewardsPool;
    address public immutable developmentWallet;
    address public immutable churchPartnershipFund;
    address public immutable teamVestingContract;
    address public immutable advisorPool;

    // ─── Operator registry ────────────────────────────────────────────────────
    // Addresses (e.g. BibleFiSuperToken.sol) authorised to act as CFA flow
    // operators on behalf of holders — approved by the owner after deployment.

    mapping(address => bool) public approvedSuperTokenOperators;

    // ─── Events ───────────────────────────────────────────────────────────────

    event SuperTokenOperatorUpdated(address indexed operator, bool approved);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAddress();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _communityRewardsPool  40% — stewardship incentives, LM, early adopters
     * @param _developmentWallet     30% — protocol dev, audits, infra
     * @param _churchPartnershipFund 15% — church onboarding & pilot programmes
     * @param _teamVestingContract   10% — external vesting contract (4yr / 1yr cliff)
     * @param _advisorPool            5% — theological board, strategic advisors
     * @param _initialOwner          Contract owner (Gnosis Safe / multisig recommended)
     */
    constructor(
        address _communityRewardsPool,
        address _developmentWallet,
        address _churchPartnershipFund,
        address _teamVestingContract,
        address _advisorPool,
        address _initialOwner
    )
        ERC20("BibleFi Governance", "BIBLEFI")
        ERC20Permit("BibleFi Governance")
    {
        if (_communityRewardsPool  == address(0) ||
            _developmentWallet     == address(0) ||
            _churchPartnershipFund == address(0) ||
            _teamVestingContract   == address(0) ||
            _advisorPool           == address(0) ||
            _initialOwner          == address(0)) revert ZeroAddress();

        communityRewardsPool  = _communityRewardsPool;
        developmentWallet     = _developmentWallet;
        churchPartnershipFund = _churchPartnershipFund;
        teamVestingContract   = _teamVestingContract;
        advisorPool           = _advisorPool;

        _transferOwnership(_initialOwner);

        // Mint entire fixed supply at construction, distributed to allocation slots.
        _mint(_communityRewardsPool,  (TOTAL_SUPPLY * COMMUNITY_REWARDS_BPS) / 10_000);
        _mint(_developmentWallet,     (TOTAL_SUPPLY * DEVELOPMENT_BPS)       / 10_000);
        _mint(_churchPartnershipFund, (TOTAL_SUPPLY * CHURCH_PARTNER_BPS)    / 10_000);
        _mint(_teamVestingContract,   (TOTAL_SUPPLY * TEAM_VESTING_BPS)      / 10_000);
        _mint(_advisorPool,           (TOTAL_SUPPLY * ADVISOR_POOL_BPS)      / 10_000);
    }

    // ─── Emergency pause ─────────────────────────────────────────────────────

    /// @notice Pause all token transfers. Only callable by the owner.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause token transfers. Only callable by the owner.
    function unpause() external onlyOwner {
        _unpause();
    }

    // ─── SuperToken operator management ──────────────────────────────────────

    /**
     * @notice Authorise or revoke an address as a Superfluid CFA flow operator.
     *         Set to `true` for the deployed BibleFiSuperToken contract after
     *         it has been deployed, so it can open governance tithe streams on
     *         behalf of $BIBLEFI holders who opt in.
     *
     * @param operator  Address to approve/revoke
     * @param approved  true = authorised, false = revoked
     */
    function setSuperTokenOperator(address operator, bool approved) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        approvedSuperTokenOperators[operator] = approved;
        emit SuperTokenOperatorUpdated(operator, approved);
    }

    // ─── ERC-20 overrides (resolve multiple-inheritance) ─────────────────────

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(account, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
