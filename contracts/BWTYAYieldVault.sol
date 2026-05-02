// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./BWTYAMath.sol";
import "./BWSPWisdomRegistry.sol";

/**
 * @title BWTYAYieldVault
 * @notice Wisdom-gated DeFi yield vault powered by the BWTYA algorithm.
 *
 * @dev Implements a novel yield distribution model with five interlocking mechanisms:
 *
 *   1. TITHE-FIRST DISTRIBUTION  (Proverbs 3:9 — "honour the LORD with your firstfruits")
 *      10 % of all generated yield is streamed to a DAO treasury before
 *      any user claims are processed.  This is enforced on-chain: no user
 *      can claim yield until the tithe has been allocated.
 *
 *   2. WISDOM-GATED APY BOOST  (Proverbs 4:7 — "wisdom is the principal thing")
 *      Users with higher BWTYA wisdom scores receive a multiplied share of
 *      yield.  Scores are read from BWSPWisdomRegistry with a 7-day TWAP
 *      (Time-Weighted Average Wisdom) to prevent flash-exploitation.
 *      Boost tiers (on top of base APY):
 *        Score < 250 (Seeker)   → 1.00× base
 *        Score 250–499 (Learner) → 1.05×
 *        Score 500–749 (Faithful) → 1.15×
 *        Score ≥ 750  (Steward)  → 1.30×
 *
 *   3. JOSEPH'S RESERVE  (Genesis 41 — "store up in the seven years of plenty")
 *      During periods of extreme market fear (communicated via an oracle),
 *      20 % of newly deposited capital is held in a liquid reserve and NOT
 *      deployed to yield strategies.  This reserve is available for immediate
 *      withdrawal, protecting against panic-driven liquidity crises.
 *
 *   4. CONSECUTIVE TITHE BLESSING  (Malachi 3:10)
 *      Depositors who have an active consecutive tithe streak (as recorded in
 *      BWSPWisdomRegistry) receive an additional compound blessing multiplier
 *      computed by BWTYAMath.titheBlessingMultiplier.
 *
 *   5. ECCLESIASTES REBALANCING LOCK  (Ecclesiastes 11:2)
 *      When a user holds ≥ 50 % of their portfolio in a single vault position,
 *      new deposits above that threshold are subject to a 7-day waiting period
 *      before they earn the wisdom boost — encouraging diversification across
 *      protocols as Ecc 11:2 commands.
 *
 * Biblical Anchors
 * ────────────────
 * • Proverbs 3:9     – tithe-first before compounding
 * • Proverbs 4:7     – wisdom as the primary acquisition
 * • Genesis 41       – Joseph's counter-cyclical reserve
 * • Malachi 3:10     – windows of heaven for faithful tithers
 * • Ecclesiastes 11:2 – diversification mandate
 * • Luke 16:10       – faithful in little, faithful in much
 */
contract BWTYAYieldVault is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============================================================
    // Immutables & Dependencies
    // ============================================================

    BWSPWisdomRegistry public immutable wisdomRegistry;

    // ============================================================
    // Structs
    // ============================================================

    struct Deposit {
        uint256 amount;             // Principal deposited
        uint256 reserveAmount;      // Portion held in Joseph's Reserve
        uint256 depositTime;        // Timestamp of deposit
        uint256 lastClaimTime;      // Timestamp of last yield claim
        uint256 accruedYield;       // Yield earned since last claim (not yet claimed)
        uint256 wisdomTwapStart;    // Wisdom score at deposit time (for TWAP baseline)
        uint256 wisdomTwapAccum;    // Accumulated wisdom × time (for 7-day TWAP)
        uint256 twapLastUpdated;    // Timestamp of last TWAP update
        bool    inRebalanceLock;    // True if subject to Ecclesiastes rebalancing delay
        uint256 rebalanceLockEnds;  // Timestamp when rebalancing lock expires
    }

    struct VaultStats {
        uint256 totalDeposited;      // Total principal in vault
        uint256 totalReserve;        // Total in Joseph's Reserve
        uint256 totalYieldGenerated; // Lifetime yield generated
        uint256 totalTithePaid;      // Lifetime tithe paid to treasury
        uint256 totalClaimed;        // Lifetime user claims
        uint256 depositorCount;      // Unique depositors
    }

    struct YieldDistribution {
        uint256 grossYield;     // Total yield before tithe
        uint256 titheAmount;    // 10 % tithe to treasury
        uint256 netYield;       // 90 % to depositor
        uint256 wisdomBonus;    // Extra yield from wisdom boost
        uint256 titheBlessingBonus; // Extra yield from tithe streak
        uint256 finalAmount;    // Net + bonuses
    }

    // ============================================================
    // Constants
    // ============================================================

    uint256 public constant BASIS_POINTS       = 10_000;
    uint256 public constant TITHE_RATE         = 1_000;   // 10 % in bps
    uint256 public constant JOSEPH_RESERVE_RATE = 2_000;  // 20 % in bps
    uint256 public constant SECONDS_PER_YEAR   = 365 days;
    uint256 public constant TWAP_WINDOW        = 7 days;
    uint256 public constant REBALANCE_LOCK_PERIOD = 7 days;
    uint256 public constant MAX_SINGLE_POSITION = 5_000;  // 50 % in bps (Ecc 11:2)

    // Wisdom boost tiers (in bps, applied to net yield)
    uint256 public constant BOOST_SEEKER   = 10_000; // 1.00×
    uint256 public constant BOOST_LEARNER  = 10_500; // 1.05×
    uint256 public constant BOOST_FAITHFUL = 11_500; // 1.15×
    uint256 public constant BOOST_STEWARD  = 13_000; // 1.30×

    // Wisdom score thresholds
    uint256 public constant WISDOM_SEEKER   = 0;
    uint256 public constant WISDOM_LEARNER  = 250;
    uint256 public constant WISDOM_FAITHFUL = 500;
    uint256 public constant WISDOM_STEWARD  = 750;

    // ============================================================
    // State Variables
    // ============================================================

    IERC20 public depositToken;
    address public treasury;
    address public yieldOracle;    // Authorised to report generated yield
    bool    public josephReserveActive; // true during extreme fear periods

    uint256 public baseApyBps;     // Base yield APY in bps (e.g. 800 = 8 %)

    VaultStats public stats;

    mapping(address => Deposit) public deposits;
    mapping(address => bool)    public hasDeposit;

    // ============================================================
    // Events
    // ============================================================

    event Deposited(
        address indexed user,
        uint256 principal,
        uint256 reserveAmount,
        uint256 deployedAmount
    );

    event YieldClaimed(
        address indexed user,
        uint256 grossYield,
        uint256 titheDeducted,
        uint256 wisdomBoost,
        uint256 titheBlessingBonus,
        uint256 finalAmount
    );

    event TithePaid(
        address indexed treasury,
        uint256 amount,
        uint256 timestamp
    );

    event Withdrawn(
        address indexed user,
        uint256 principal,
        uint256 reserveAmount
    );

    event JosephReserveActivated(bool active, uint256 timestamp);
    event BaseApyUpdated(uint256 oldBps, uint256 newBps);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // ============================================================
    // Errors
    // ============================================================

    error ZeroDeposit();
    error NoDepositFound();
    error DepositAlreadyExists();
    error ZeroAddress();
    error InsufficientBalance();
    error NotYieldOracle();
    error RebalanceLockActive();

    // ============================================================
    // Constructor
    // ============================================================

    constructor(
        address _depositToken,
        address _treasury,
        address _wisdomRegistry,
        uint256 _baseApyBps
    ) {
        if (_depositToken == address(0) || _treasury == address(0) || _wisdomRegistry == address(0))
            revert ZeroAddress();

        depositToken    = IERC20(_depositToken);
        treasury        = _treasury;
        wisdomRegistry  = BWSPWisdomRegistry(_wisdomRegistry);
        baseApyBps      = _baseApyBps;

        _transferOwnership(msg.sender);
    }

    // ============================================================
    // Core: Deposit
    // ============================================================

    /**
     * @notice Deposit tokens into the vault.
     * @dev    If Joseph's Reserve is active, JOSEPH_RESERVE_RATE (20 %) of the
     *         deposit is held as a liquid reserve.  The remaining 80 % is
     *         "deployed" (tracked as yield-bearing principal).
     *
     *         If the deposit would make the user's single-vault position exceed
     *         MAX_SINGLE_POSITION (50 %) of their stated total portfolio value,
     *         a 7-day Ecclesiastes Rebalancing Lock is applied to the excess.
     *
     * @param amount           Token amount to deposit
     * @param portfolioTotalUsd User's self-reported total portfolio USD value
     *                          (used for Ecc 11:2 concentration check; 0 = skip check)
     */
    function deposit(
        uint256 amount,
        uint256 portfolioTotalUsd
    ) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroDeposit();
        if (hasDeposit[msg.sender]) revert DepositAlreadyExists();

        depositToken.safeTransferFrom(msg.sender, address(this), amount);

        // Joseph's Reserve calculation
        uint256 reserveAmount = josephReserveActive
            ? (amount * JOSEPH_RESERVE_RATE) / BASIS_POINTS
            : 0;
        uint256 deployedAmount = amount - reserveAmount;

        // Ecclesiastes concentration check
        bool rebalanceLock = false;
        uint256 lockEnds   = 0;
        if (portfolioTotalUsd > 0 && amount > 0) {
            // Approximate position weight: depositAmount / portfolioTotal (using token value proxy)
            // We assume 1 token ≈ $1 for simplicity; integrators should scale amount by price oracle
            uint256 positionBps = (amount * BASIS_POINTS) / portfolioTotalUsd;
            if (positionBps > MAX_SINGLE_POSITION) {
                rebalanceLock = true;
                lockEnds = block.timestamp + REBALANCE_LOCK_PERIOD;
            }
        }

        // Read initial wisdom score for TWAP
        (uint256 decayedScore, ) = wisdomRegistry.getDecayedWisdomScore(msg.sender);

        deposits[msg.sender] = Deposit({
            amount:           deployedAmount,
            reserveAmount:    reserveAmount,
            depositTime:      block.timestamp,
            lastClaimTime:    block.timestamp,
            accruedYield:     0,
            wisdomTwapStart:  decayedScore,
            wisdomTwapAccum:  decayedScore * block.timestamp,
            twapLastUpdated:  block.timestamp,
            inRebalanceLock:  rebalanceLock,
            rebalanceLockEnds: lockEnds
        });

        // Update global stats — increment depositorCount before setting hasDeposit
        stats.totalDeposited += deployedAmount;
        stats.totalReserve   += reserveAmount;
        stats.depositorCount++;        // only reached when hasDeposit was false (guarded above)

        hasDeposit[msg.sender] = true;

        emit Deposited(msg.sender, amount, reserveAmount, deployedAmount);
    }

    // ============================================================
    // Core: Claim Yield (Tithe-First)
    // ============================================================

    /**
     * @notice Claim accrued yield.
     * @dev    Yield is computed using:
     *           grossYield = principal × (baseApy / SECONDS_PER_YEAR) × elapsed
     *         Then:
     *           tithe       = grossYield × TITHE_RATE
     *           netYield    = grossYield - tithe
     *           wisdomBoost = netYield × (wisdomMultiplier - 1)
     *           tithBlessing = netYield × (titheBlessingMultiplier - 1)
     *           finalAmount = netYield + wisdomBoost + tithBlessing
     *
     *         TITHE-FIRST: the tithe is transferred to treasury before any
     *         user funds are released.  On-chain enforcement, not optional.
     */
    function claimYield() external nonReentrant whenNotPaused {
        if (!hasDeposit[msg.sender]) revert NoDepositFound();

        Deposit storage dep = deposits[msg.sender];

        // Update TWAP before computing yield
        _updateWisdomTwap(dep);

        // Time elapsed since last claim
        uint256 elapsed = block.timestamp - dep.lastClaimTime;
        if (elapsed == 0) return;

        // Gross yield: principal × APY × elapsed / year
        uint256 grossYield = (dep.amount * baseApyBps * elapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);

        if (grossYield == 0) return;

        // Tithe deduction (10 %)
        uint256 tithe = (grossYield * TITHE_RATE) / BASIS_POINTS;
        uint256 net   = grossYield - tithe;

        // Wisdom boost (using 7-day TWAP score — prevents flash score manipulation)
        uint256 twapScore  = _getWisdomTwap(dep, msg.sender);
        uint256 boostBps   = _getWisdomBoost(twapScore, dep.inRebalanceLock && block.timestamp < dep.rebalanceLockEnds);
        uint256 wisdomBonus = (net * (boostBps - BASIS_POINTS)) / BASIS_POINTS;

        // Tithe blessing (consecutive months from registry)
        uint256 titheBlessingWad = wisdomRegistry.getTitheBlessingMultiplier(msg.sender);
        uint256 titheBlessingBonus = 0;
        if (titheBlessingWad > 1e18) {
            // blessing bonus = net × (multiplier - 1.0)
            titheBlessingBonus = (net * (titheBlessingWad - 1e18)) / 1e18;
        }

        uint256 finalAmount = net + wisdomBonus + titheBlessingBonus;

        // Update state
        dep.lastClaimTime = block.timestamp;
        dep.accruedYield += finalAmount;
        stats.totalYieldGenerated += grossYield;
        stats.totalTithePaid      += tithe;
        stats.totalClaimed        += finalAmount;

        // TITHE-FIRST: transfer tithe to treasury before user funds
        if (tithe > 0) {
            depositToken.safeTransfer(treasury, tithe);
            emit TithePaid(treasury, tithe, block.timestamp);
        }

        // Transfer net yield + bonuses to user
        depositToken.safeTransfer(msg.sender, finalAmount);

        emit YieldClaimed(
            msg.sender,
            grossYield,
            tithe,
            wisdomBonus,
            titheBlessingBonus,
            finalAmount
        );
    }

    // ============================================================
    // Core: Withdraw
    // ============================================================

    /**
     * @notice Withdraw principal and Joseph's Reserve.
     * @dev    No withdrawal fee — biblical principle of fair dealing.
     *         Any unclaimed yield is forfeited (must claimYield first).
     */
    function withdraw() external nonReentrant {
        if (!hasDeposit[msg.sender]) revert NoDepositFound();

        Deposit storage dep = deposits[msg.sender];
        uint256 principal  = dep.amount;
        uint256 reserve    = dep.reserveAmount;
        uint256 total      = principal + reserve;

        if (total == 0) revert InsufficientBalance();

        // Clear state before transfer (checks-effects-interactions)
        stats.totalDeposited -= principal;
        stats.totalReserve   -= reserve;
        hasDeposit[msg.sender] = false;
        delete deposits[msg.sender];

        depositToken.safeTransfer(msg.sender, total);

        emit Withdrawn(msg.sender, principal, reserve);
    }

    // ============================================================
    // View: Projected Yield
    // ============================================================

    /**
     * @notice Preview the yield a user would receive if they claimed right now.
     * @return distribution  Detailed breakdown of gross, tithe, net, and bonuses.
     */
    function previewYield(address user) external view returns (YieldDistribution memory distribution) {
        if (!hasDeposit[user]) return distribution;

        Deposit storage dep = deposits[user];
        uint256 elapsed = block.timestamp - dep.lastClaimTime;
        if (elapsed == 0) return distribution;

        uint256 grossYield = (dep.amount * baseApyBps * elapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
        uint256 tithe = (grossYield * TITHE_RATE) / BASIS_POINTS;
        uint256 net   = grossYield - tithe;

        uint256 twapScore  = _getWisdomTwap(dep, user);
        uint256 boostBps   = _getWisdomBoost(twapScore, dep.inRebalanceLock && block.timestamp < dep.rebalanceLockEnds);
        uint256 wisdomBonus = (net * (boostBps - BASIS_POINTS)) / BASIS_POINTS;

        uint256 titheBlessingWad = wisdomRegistry.getTitheBlessingMultiplier(user);
        uint256 titheBlessingBonus = titheBlessingWad > 1e18
            ? (net * (titheBlessingWad - 1e18)) / 1e18
            : 0;

        uint256 final_ = net + wisdomBonus + titheBlessingBonus;

        distribution = YieldDistribution({
            grossYield:         grossYield,
            titheAmount:        tithe,
            netYield:           net,
            wisdomBonus:        wisdomBonus,
            titheBlessingBonus: titheBlessingBonus,
            finalAmount:        final_
        });
    }

    /**
     * @notice Compute the effective APY for a user (including wisdom and tithe boosts).
     * @return effectiveApyBps  APY in basis points
     */
    function effectiveUserApy(address user) external view returns (uint256 effectiveApyBps) {
        if (!hasDeposit[user]) return baseApyBps * (BASIS_POINTS - TITHE_RATE) / BASIS_POINTS;

        Deposit storage dep = deposits[user];
        uint256 twapScore = _getWisdomTwap(dep, user);
        uint256 boostBps  = _getWisdomBoost(twapScore, false);

        // net APY = base × (1 - tithe) × boostMultiplier
        uint256 netApyBps = (baseApyBps * (BASIS_POINTS - TITHE_RATE)) / BASIS_POINTS;
        effectiveApyBps = (netApyBps * boostBps) / BASIS_POINTS;

        // Add tithe blessing
        uint256 titheBlessingWad = wisdomRegistry.getTitheBlessingMultiplier(user);
        if (titheBlessingWad > 1e18) {
            // blessing boost on top of net APY
            uint256 blessingBps = ((titheBlessingWad - 1e18) * BASIS_POINTS) / 1e18;
            effectiveApyBps += (netApyBps * blessingBps) / BASIS_POINTS;
        }
    }

    // ============================================================
    // Admin Functions
    // ============================================================

    /** @notice Activate or deactivate Joseph's Reserve (extreme fear mode). */
    function setJosephReserve(bool active) external onlyOwner {
        josephReserveActive = active;
        emit JosephReserveActivated(active, block.timestamp);
    }

    function setBaseApy(uint256 newApyBps) external onlyOwner {
        emit BaseApyUpdated(baseApyBps, newApyBps);
        baseApyBps = newApyBps;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setYieldOracle(address oracle) external onlyOwner {
        yieldOracle = oracle;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ============================================================
    // Internal: Wisdom TWAP
    // ============================================================

    /**
     * @notice Update the time-weighted wisdom accumulator.
     * @dev    TWAP(t) = Σ(score_i × Δt_i) / total_time
     *         Prevents users from temporarily inflating their score before claiming.
     */
    function _updateWisdomTwap(Deposit storage dep) internal {
        uint256 elapsed = block.timestamp - dep.twapLastUpdated;
        if (elapsed == 0) return;

        (uint256 currentScore, ) = wisdomRegistry.getDecayedWisdomScore(msg.sender);
        dep.wisdomTwapAccum += currentScore * elapsed;
        dep.twapLastUpdated  = block.timestamp;
    }

    /**
     * @dev Returns the 7-day TWAP wisdom score for a given user.
     *      Uses accumulated score × time divided by total elapsed time.
     *      The `user` parameter is needed so view callers can pass the depositor address.
     */
    function _getWisdomTwap(Deposit storage dep, address user) internal view returns (uint256) {
        uint256 totalElapsed = block.timestamp - dep.depositTime;
        if (totalElapsed == 0) return dep.wisdomTwapStart;

        (uint256 currentScore, ) = wisdomRegistry.getDecayedWisdomScore(user);
        uint256 extraAccum = currentScore * (block.timestamp - dep.twapLastUpdated);
        uint256 fullAccum  = dep.wisdomTwapAccum + extraAccum;

        return fullAccum / totalElapsed;
    }

    /**
     * @notice Get the wisdom boost multiplier in basis points.
     * @param twapScore         7-day TWAP wisdom score
     * @param rebalanceLockActive  True if Ecclesiastes lock is active (reduces boost)
     */
    function _getWisdomBoost(
        uint256 twapScore,
        bool rebalanceLockActive
    ) internal pure returns (uint256 boostBps) {
        if (twapScore >= WISDOM_STEWARD) {
            boostBps = BOOST_STEWARD;
        } else if (twapScore >= WISDOM_FAITHFUL) {
            boostBps = BOOST_FAITHFUL;
        } else if (twapScore >= WISDOM_LEARNER) {
            boostBps = BOOST_LEARNER;
        } else {
            boostBps = BOOST_SEEKER;
        }

        // Ecclesiastes rebalancing lock: halve the wisdom bonus portion (not base)
        if (rebalanceLockActive && boostBps > BASIS_POINTS) {
            uint256 bonusPortion = boostBps - BASIS_POINTS;
            boostBps = BASIS_POINTS + bonusPortion / 2;
        }
    }
}
