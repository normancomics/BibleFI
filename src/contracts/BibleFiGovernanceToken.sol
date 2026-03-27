// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title BibleFiGovernanceToken — $BIBLEFI
 * @author BibleFi.eth
 * @notice Superfluid-native governance token for the BibleFi protocol on Base chain.
 *
 * "The plans of the diligent lead to profit as surely as haste leads to poverty."
 * — Proverbs 21:5
 *
 * Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * This ERC-20 token is designed to be wrapped into a Superfluid Super Token
 * ($xBIBLEFI) via Superfluid's SuperTokenFactory.  Holding $xBIBLEFI allows
 * continuous governance-stream distributions (DAO treasury flows, reward
 * streams, and IDA/GDA pool subscriptions).
 *
 * Token Specs
 * ─────────────────────────────────────────────────────────────────────────────
 * Symbol         : BIBLEFI
 * Total Supply   : 1,000,000,000 (1 billion)
 * Decimals       : 18
 * Chain          : Base (8453)
 * Superfluid wrap: Deploy xBIBLEFI via SuperTokenFactory.createERC20Wrapper()
 *
 * Distribution
 * ─────────────────────────────────────────────────────────────────────────────
 * 40 % — Community Rewards    (400,000,000) — stewardship, liquidity mining
 * 30 % — Development & Ops    (300,000,000) — audits, infra, protocol R&D
 * 15 % — Church Partnerships  (150,000,000) — onboarding incentives
 * 10 % — Team & Advisors      (100,000,000) — 4-year vest, 1-year cliff
 *  5 % — Early Supporters      (50,000,000) — theological board, angels
 */
contract BibleFiGovernanceToken is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    ERC20Votes,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    // ─────────────────────────────────────────────────────── roles ──
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");

    // ─────────────────────────────────────────────────── constants ──
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18;

    // Distribution buckets (in tokens, before 10**18 scaling)
    uint256 public constant COMMUNITY_REWARDS_ALLOC   = 400_000_000 * 10 ** 18;
    uint256 public constant DEVELOPMENT_ALLOC         = 300_000_000 * 10 ** 18;
    uint256 public constant CHURCH_PARTNERSHIPS_ALLOC = 150_000_000 * 10 ** 18;
    uint256 public constant TEAM_ALLOC                = 100_000_000 * 10 ** 18;
    uint256 public constant EARLY_SUPPORTERS_ALLOC    =  50_000_000 * 10 ** 18;

    // Vesting parameters (Team & Advisors)
    uint256 public constant VESTING_CLIFF    = 365 days;
    uint256 public constant VESTING_DURATION = 4 * 365 days;
    uint256 public immutable vestingStart;

    // ─────────────────────────────────────────────────── addresses ──
    address public immutable communityRewardsWallet;
    address public immutable developmentWallet;
    address public immutable churchPartnershipsWallet;
    address public immutable teamWallet;
    address public immutable earlySupportersWallet;

    // Vesting tracking for team wallet
    uint256 public teamTokensClaimed;

    // ─────────────────────────────────────────────────────── events ──
    event TeamTokensVested(address indexed beneficiary, uint256 amount);
    event SuperfluidWrapperRegistered(address indexed wrapper);

    // ───────────────────────────────────────────────── constructor ──

    /**
     * @param _communityRewards   Wallet receiving the 40 % community allocation
     * @param _development        Wallet receiving the 30 % dev allocation
     * @param _churchPartnerships Wallet receiving the 15 % church allocation
     * @param _team               Vesting beneficiary (10 %)
     * @param _earlySupport       Wallet receiving the 5 % early-supporter allocation
     */
    constructor(
        address _communityRewards,
        address _development,
        address _churchPartnerships,
        address _team,
        address _earlySupport
    )
        ERC20("BibleFi Governance", "BIBLEFI")
        ERC20Permit("BibleFi Governance")
    {
        require(
            _communityRewards   != address(0) &&
            _development        != address(0) &&
            _churchPartnerships != address(0) &&
            _team               != address(0) &&
            _earlySupport       != address(0),
            "BIBLEFI: zero address"
        );

        communityRewardsWallet   = _communityRewards;
        developmentWallet        = _development;
        churchPartnershipsWallet = _churchPartnerships;
        teamWallet               = _team;
        earlySupportersWallet    = _earlySupport;
        vestingStart             = block.timestamp;

        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE,        msg.sender);
        _grantRole(PAUSER_ROLE,        msg.sender);
        _grantRole(TREASURER_ROLE,     msg.sender);

        // Mint non-vested allocations immediately
        _mint(_communityRewards,   COMMUNITY_REWARDS_ALLOC);
        _mint(_development,        DEVELOPMENT_ALLOC);
        _mint(_churchPartnerships, CHURCH_PARTNERSHIPS_ALLOC);
        _mint(_earlySupport,       EARLY_SUPPORTERS_ALLOC);
        // Team tokens are minted to this contract and released via claimTeamTokens()
        _mint(address(this),       TEAM_ALLOC);
    }

    // ───────────────────────────────────────────── vesting ──

    /**
     * @notice Release vested team tokens to the team wallet.
     *         Follows a linear vesting schedule with a 1-year cliff.
     */
    function claimTeamTokens() external nonReentrant {
        require(
            block.timestamp >= vestingStart + VESTING_CLIFF,
            "BIBLEFI: cliff not reached"
        );

        uint256 elapsed = block.timestamp - vestingStart;
        uint256 vested;
        if (elapsed >= VESTING_DURATION) {
            vested = TEAM_ALLOC;
        } else {
            vested = (TEAM_ALLOC * elapsed) / VESTING_DURATION;
        }

        uint256 claimable = vested - teamTokensClaimed;
        require(claimable > 0, "BIBLEFI: nothing to claim");

        teamTokensClaimed += claimable;
        _transfer(address(this), teamWallet, claimable);

        emit TeamTokensVested(teamWallet, claimable);
    }

    /**
     * @notice Returns tokens available for the team to claim now.
     */
    function unvestedTeamTokens() external view returns (uint256 claimable) {
        if (block.timestamp < vestingStart + VESTING_CLIFF) return 0;
        uint256 elapsed = block.timestamp - vestingStart;
        uint256 vested = elapsed >= VESTING_DURATION
            ? TEAM_ALLOC
            : (TEAM_ALLOC * elapsed) / VESTING_DURATION;
        claimable = vested - teamTokensClaimed;
    }

    // ───────────────────────────────────────────── admin ──

    /**
     * @notice Mint additional tokens (e.g., liquidity-mining rewards).
     *         Capped to TOTAL_SUPPLY.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= TOTAL_SUPPLY, "BIBLEFI: cap exceeded");
        _mint(to, amount);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ───────────────────────────────── Superfluid compatibility ──

    /**
     * @notice Emits an event when the Superfluid $xBIBLEFI wrapper is deployed,
     *         so indexers can link the underlying token to its super token.
     */
    function registerSuperfluidWrapper(address wrapper) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(wrapper != address(0), "BIBLEFI: invalid wrapper");
        emit SuperfluidWrapperRegistered(wrapper);
    }

    // ───────────────────────────────────────── overrides ──

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
