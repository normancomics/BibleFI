// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  WisdomToken ($WISDOM)
 * @notice Rewards token for the BibleFi Protocol. Earned through faithful tithing,
 *         scripture engagement, community participation, and prudent stewardship.
 *
 *         "How much better to get wisdom than gold, to get insight rather
 *          than silver!" — Proverbs 16:16
 *
 * ────────────────────────────────────────────────────────────────────
 * Max Supply:      1,000,000,000 WISDOM (1 Billion — hard cap)
 * Starting Supply: 0 — minted on-demand by authorised minters
 *
 * Earning schedule (enforced by minter contracts, documented as constants):
 *   • Active tithe stream (30+ day streak) : 100 WISDOM / week
 *   • Scripture quiz completion            :  50 WISDOM / completion
 *   • Biblical wisdom post (engagement)   :  10–100 WISDOM / post
 *   • Refer a church (verified onboard)   : 1,000 WISDOM / referral
 *   • Governance vote participation        :   5 WISDOM / vote
 *   • Avoided risky investment (BWSP)     :  75 WISDOM / warning heeded
 *
 * Wisdom-bonus mint (via mintWithWisdomBonus):
 *   Power score derived from BWSPWisdomRegistry.computeWisdomPowerScore (0–100),
 *   mapped to a 0–1000 range, then tiered:
 *     0–249   (Seeker)   → 1.00×  (no bonus)
 *     250–499 (Learner)  → 1.05×
 *     500–749 (Faithful) → 1.15×
 *     750–999 (Steward)  → 1.30×
 *     ≥ 1000             → 1.50×
 *
 * Token capabilities
 * ──────────────────
 *   • ERC-20 Permit  — gasless approvals (EIP-2612)
 *   • ERC-20 Burnable — holders can burn their own tokens
 *   • Minter role    — authorised contracts mint rewards
 *   • Ownable2Step   — two-step ownership transfer
 * ────────────────────────────────────────────────────────────────────
 */

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";

// ─── Minimal interface to BWSPWisdomRegistry ──────────────────────────────────

interface IBWSPWisdomRegistry {
    /**
     * @notice Compute a composite on-chain Wisdom Power Score (0–100) fusing
     *         decay-adjusted wisdom score, tithe blessing multiplier, top BWTYA
     *         advisory score, and average scripture resonance.
     */
    function computeWisdomPowerScore(address user) external view returns (uint256);
}

// ─────────────────────────────────────────────────────────────────────────────

contract WisdomToken is ERC20, ERC20Burnable, ERC20Permit, Ownable2Step {

    // ─── Hard supply cap ──────────────────────────────────────────────────────

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 Billion

    // ─── Earning rate constants (1e18-scaled) ────────────────────────────────
    // These are informational constants used by authorised minter contracts to
    // enforce the earning schedule defined in the BibleFi tokenomics.

    uint256 public constant TITHE_STREAM_WEEKLY_REWARD      = 100  * 10 ** 18;
    uint256 public constant SCRIPTURE_QUIZ_REWARD           =  50  * 10 ** 18;
    uint256 public constant WISDOM_POST_MIN_REWARD          =  10  * 10 ** 18;
    uint256 public constant WISDOM_POST_MAX_REWARD          = 100  * 10 ** 18;
    uint256 public constant CHURCH_REFERRAL_REWARD          = 1_000 * 10 ** 18;
    uint256 public constant GOVERNANCE_VOTE_REWARD          =   5  * 10 ** 18;
    uint256 public constant AVOIDED_RISKY_INVESTMENT_REWARD =  75  * 10 ** 18;

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice Addresses authorised to call mint() — e.g. BWTYAYieldVault, staking pools
    mapping(address => bool) public authorisedMinters;

    /// @notice Optional link to BWSPWisdomRegistry for on-chain wisdom gating
    IBWSPWisdomRegistry public wisdomRegistry;

    // ─── Events ───────────────────────────────────────────────────────────────

    event MinterUpdated(address indexed minter, bool authorised);
    event WisdomRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    event WisdomMinted(
        address indexed to,
        uint256 baseAmount,
        uint256 bonusAmount,
        uint256 powerScore
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    error UnauthorisedMinter();
    error MaxSupplyExceeded();
    error ZeroAddress();
    error ZeroAmount();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param _initialOwner  Contract owner address (Gnosis Safe / multisig recommended)
     */
    constructor(address _initialOwner)
        ERC20("Wisdom Rewards", "WISDOM")
        ERC20Permit("Wisdom Rewards")
    {
        if (_initialOwner == address(0)) revert ZeroAddress();
        _transferOwnership(_initialOwner);
    }

    // ─── Minter administration ────────────────────────────────────────────────

    /**
     * @notice Authorise or revoke a minter address.
     *         Recommended minters: BWTYAYieldVault, WisdomSuperToken,
     *         staking/reward distribution contracts.
     *
     * @param minter     Address to authorise or revoke
     * @param authorised true = can mint, false = revoked
     */
    function setMinter(address minter, bool authorised) external onlyOwner {
        if (minter == address(0)) revert ZeroAddress();
        authorisedMinters[minter] = authorised;
        emit MinterUpdated(minter, authorised);
    }

    /**
     * @notice Update the BWSPWisdomRegistry reference used for bonus calculations.
     *         Set to address(0) to disable wisdom gating (bonuses will be 0).
     */
    function setWisdomRegistry(address registry) external onlyOwner {
        emit WisdomRegistryUpdated(address(wisdomRegistry), registry);
        wisdomRegistry = IBWSPWisdomRegistry(registry);
    }

    // ─── Mint ─────────────────────────────────────────────────────────────────

    /**
     * @notice Standard mint — called by authorised minter contracts.
     *         No wisdom bonus is applied; the caller is responsible for
     *         computing the correct reward amount before calling.
     *
     * @param to     Recipient address
     * @param amount Amount of WISDOM to mint (18 decimals)
     */
    function mint(address to, uint256 amount) external {
        if (!authorisedMinters[msg.sender]) revert UnauthorisedMinter();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        _mintChecked(to, amount);
    }

    /**
     * @notice Wisdom-gated mint — automatically applies a multiplier bonus on
     *         top of the base reward based on the recipient's wisdom power score
     *         from BWSPWisdomRegistry.
     *
     *         If wisdomRegistry is unset, mints only the base amount.
     *
     * @param to         Recipient address
     * @param baseAmount Base reward before wisdom bonus (18 decimals)
     */
    function mintWithWisdomBonus(address to, uint256 baseAmount) external {
        if (!authorisedMinters[msg.sender]) revert UnauthorisedMinter();
        if (to == address(0)) revert ZeroAddress();
        if (baseAmount == 0) revert ZeroAmount();

        uint256 bonusAmount = 0;
        uint256 powerScore  = 0;

        if (address(wisdomRegistry) != address(0)) {
            powerScore  = wisdomRegistry.computeWisdomPowerScore(to);
            bonusAmount = _wisdomBonus(baseAmount, powerScore);
        }

        _mintChecked(to, baseAmount + bonusAmount);
        emit WisdomMinted(to, baseAmount, bonusAmount, powerScore);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    /**
     * @notice Preview the bonus amount for a given base reward and power score.
     *         Useful for off-chain display before submitting a mintWithWisdomBonus tx.
     *
     * @param base       Base reward amount (18 decimals)
     * @param powerScore Wisdom power score (0–100)
     * @return bonus     Additional tokens that will be minted
     */
    function previewWisdomBonus(uint256 base, uint256 powerScore)
        external
        pure
        returns (uint256 bonus)
    {
        return _wisdomBonus(base, powerScore);
    }

    /**
     * @notice Returns the remaining mintable supply before the hard cap.
     */
    function remainingMintableSupply() external view returns (uint256) {
        uint256 supply = totalSupply();
        return supply >= MAX_SUPPLY ? 0 : MAX_SUPPLY - supply;
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    /// @dev Mint with hard-cap enforcement.
    function _mintChecked(address to, uint256 amount) internal {
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        _mint(to, amount);
    }

    /**
     * @dev Compute bonus tokens based on wisdom power score.
     *
     *      BWSPWisdomRegistry.computeWisdomPowerScore returns 0–100.
     *      We multiply by 10 to map to a 0–1000 tier scale, matching
     *      the BWTYA wisdom tier thresholds.
     *
     *      Tier thresholds (mapped 0–1000):
     *        0–249   (Seeker)   →   0% bonus
     *        250–499 (Learner)  →   5% bonus
     *        500–749 (Faithful) →  15% bonus
     *        750–999 (Steward)  →  30% bonus
     *        ≥ 1000             →  50% bonus
     */
    function _wisdomBonus(uint256 base, uint256 powerScore)
        internal
        pure
        returns (uint256 bonus)
    {
        uint256 mapped = powerScore * 10; // 0–100 → 0–1000

        uint256 bpBonus;
        if      (mapped >= 1000) bpBonus = 5_000; // +50%
        else if (mapped >=  750) bpBonus = 3_000; // +30%
        else if (mapped >=  500) bpBonus = 1_500; // +15%
        else if (mapped >=  250) bpBonus =   500; // + 5%
        else                     bpBonus =     0; // +0%

        bonus = (base * bpBonus) / 10_000;
    }
}
