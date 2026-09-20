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
 * @dev SOLVENCY MODEL (remediates audit findings C-1, C-2, M-1, M-2)
 *
 *      Depositor principal and Joseph's Reserve are NEVER payable as yield.
 *      All yield — including the wisdom boost and the tithe blessing — is paid
 *      exclusively from `yieldPool`, which can only be credited by the yield
 *      oracle through `reportYield`. When the computed yield exceeds the funded
 *      pool, every component (tithe, net, bonuses) is scaled down pro-rata
 *      rather than dipping into principal. Every state-changing path ends with
 *      a solvency assertion:
 *
 *          balance >= totalDeposited + totalReserve + yieldPool
 *
 *      Five interlocking biblical mechanisms remain:
 *
 *   1. TITHE-FIRST DISTRIBUTION  (Proverbs 3:9 — "honour the LORD with your firstfruits")
 *      10 % of all generated yield is transferred to the DAO treasury before
 *      any user funds are released. The rate is a `constant` — not settable.
 *
 *   2. WISDOM-GATED APY BOOST  (Proverbs 4:7 — "wisdom is the principal thing")
 *      Boost tiers on top of base APY, keyed off a discrete 7-day time-weighted
 *      wisdom average (see `_updateWisdomTwap`):
 *        Score < 250 (Seeker)    → 1.00×
 *        Score 250–499 (Learner) → 1.05×
 *        Score 500–749 (Faithful)→ 1.15×
 *        Score ≥ 750  (Steward)  → 1.30×
 *
 *   3. JOSEPH'S RESERVE  (Genesis 41 — "store up in the seven years of plenty")
 *      During extreme market fear, 20 % of new capital is held liquid and
 *      segregated: it is excluded from every payout path.
 *
 *   4. CONSECUTIVE TITHE BLESSING  (Malachi 3:10)
 *      Additional compound blessing multiplier for active tithe streaks,
 *      funded from `yieldPool` like all other yield.
 *
 *   5. ECCLESIASTES REBALANCING LOCK  (Ecclesiastes 11:2)
 *      Concentrated positions earn a halved wisdom bonus for 7 days.
 *
 * Time accounting excludes seconds spent paused (audit H-2), so an emergency
 * pause cannot accumulate a claim that lands the moment the vault reopens.
 * Owner control over the payout rate is capped and timelocked (audit H-3).
 *
 * "The prudent considereth his steps" — Proverbs 14:15 (KJV)
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
        uint256 amount;             // Principal deployed to yield strategies
        uint256 reserveAmount;      // Portion held in Joseph's Reserve (never payable)
        uint256 depositTime;        // Timestamp of first deposit
        uint256 lastClaimTime;      // Timestamp of last yield settlement
        uint256 pausedSnapshot;     // Vault paused-seconds at last settlement
        uint256 wisdomTwapStart;    // Wisdom score at deposit time
        uint256 wisdomTwapAccum;    // Accumulated wisdom × time (current window)
        uint256 twapWindowStart;    // Start of the current 7-day TWAP window
        uint256 twapLastUpdated;    // Timestamp of last TWAP update
        bool    inRebalanceLock;    // Ecclesiastes rebalancing delay active
        uint256 rebalanceLockEnds;  // Timestamp when rebalancing lock expires
    }

    struct VaultStats {
        uint256 totalDeposited;      // Total principal in vault
        uint256 totalReserve;        // Total in Joseph's Reserve
        uint256 totalYieldGenerated; // Lifetime yield FUNDED by the oracle (single source)
        uint256 totalTithePaid;      // Lifetime tithe paid to treasury
        uint256 totalClaimed;        // Lifetime user claims
        uint256 depositorCount;      // Unique depositors
    }

    struct YieldDistribution {
        uint256 grossYield;         // Total yield before tithe (after solvency scaling)
        uint256 titheAmount;        // 10 % tithe to treasury
        uint256 netYield;           // 90 % to depositor
        uint256 wisdomBonus;        // Extra yield from wisdom boost
        uint256 titheBlessingBonus; // Extra yield from tithe streak
        uint256 finalAmount;        // Net + bonuses
    }

    // ============================================================
    // Constants
    // ============================================================

    uint256 public constant BASIS_POINTS        = 10_000;
    uint256 public constant TITHE_RATE          = 1_000;   // 10 % in bps — immutable
    uint256 public constant JOSEPH_RESERVE_RATE = 2_000;   // 20 % in bps
    uint256 public constant SECONDS_PER_YEAR    = 365 days;
    uint256 public constant TWAP_WINDOW         = 7 days;
    uint256 public constant REBALANCE_LOCK_PERIOD = 7 days;
    uint256 public constant MAX_SINGLE_POSITION = 5_000;   // 50 % in bps (Ecc 11:2)

    /// @notice Hard ceiling on the payout rate the owner may set (audit H-3).
    uint256 public constant MAX_BASE_APY_BPS = 3_000;      // 30 %
    /// @notice Delay enforced on payout-rate and treasury changes (audit H-3).
    uint256 public constant ADMIN_TIMELOCK = 2 days;

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

    IERC20  public immutable depositToken;
    address public treasury;
    address public yieldOracle;
    bool    public josephReserveActive;

    uint256 public baseApyBps;

    /// @notice Funded yield available for payouts. Only `reportYield` credits it.
    uint256 public yieldPool;

    /// @notice Cumulative seconds the vault has spent paused (audit H-2).
    uint256 public totalPausedSeconds;
    uint256 public pauseStartedAt;

    // Timelocked admin changes
    uint256 public pendingBaseApyBps;
    uint256 public pendingBaseApyEta;
    address public pendingTreasury;
    uint256 public pendingTreasuryEta;

    VaultStats public stats;

    mapping(address => Deposit) public deposits;
    mapping(address => bool)    public hasDeposit;

    // ============================================================
    // Events
    // ============================================================

    event Deposited(address indexed user, uint256 principal, uint256 reserveAmount, uint256 deployedAmount);
    event YieldClaimed(
        address indexed user,
        uint256 grossYield,
        uint256 titheDeducted,
        uint256 wisdomBoost,
        uint256 titheBlessingBonus,
        uint256 finalAmount
    );
    event TithePaid(address indexed treasury, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 principal, uint256 reserveAmount);
    event YieldReported(address indexed oracle, uint256 amount, uint256 yieldPool, uint256 timestamp);
    event YieldShortfall(address indexed user, uint256 requested, uint256 paid);
    event JosephReserveActivated(bool active, uint256 timestamp);
    event BaseApyChangeQueued(uint256 newBps, uint256 eta);
    event BaseApyUpdated(uint256 oldBps, uint256 newBps);
    event TreasuryChangeQueued(address newTreasury, uint256 eta);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event YieldOracleUpdated(address oldOracle, address newOracle);
    event TokenRescued(address indexed token, address indexed to, uint256 amount);

    // ============================================================
    // Errors
    // ============================================================

    error ZeroDeposit();
    error NoDepositFound();
    error ZeroAddress();
    error InsufficientBalance();
    error NotYieldOracle();
    error NothingToClaim();
    error ApyAboveCap();
    error TimelockPending();
    error NoPendingChange();
    error Insolvent();
    error CannotRescueDepositToken();

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
        if (_baseApyBps > MAX_BASE_APY_BPS) revert ApyAboveCap();

        depositToken   = IERC20(_depositToken);
        treasury       = _treasury;
        wisdomRegistry = BWSPWisdomRegistry(_wisdomRegistry);
        baseApyBps     = _baseApyBps;

        _transferOwnership(msg.sender);
    }

    // ============================================================
    // Core: Deposit
    // ============================================================

    /**
     * @notice Deposit tokens into the vault.
     * @dev    The credited amount is the measured balance delta, so fee-on-transfer
     *         tokens cannot over-credit a depositor (audit M-4).
     * @param amount            Token amount to deposit
     * @param portfolioTotalUsd Self-reported portfolio value for the Ecc 11:2
     *                          concentration check (0 = skip). Unverified and
     *                          therefore advisory only.
     */
    function deposit(uint256 amount, uint256 portfolioTotalUsd) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroDeposit();

        uint256 balanceBefore = depositToken.balanceOf(address(this));
        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 credited = depositToken.balanceOf(address(this)) - balanceBefore;
        if (credited == 0) revert ZeroDeposit();

        uint256 reserveAmount = josephReserveActive
            ? (credited * JOSEPH_RESERVE_RATE) / BASIS_POINTS
            : 0;
        uint256 deployedAmount = credited - reserveAmount;

        bool rebalanceLock = false;
        uint256 lockEnds = 0;
        if (portfolioTotalUsd > 0) {
            uint256 positionBps = (credited * BASIS_POINTS) / portfolioTotalUsd;
            if (positionBps > MAX_SINGLE_POSITION) {
                rebalanceLock = true;
                lockEnds = block.timestamp + REBALANCE_LOCK_PERIOD;
            }
        }

        if (!hasDeposit[msg.sender]) {
            (uint256 decayedScore, ) = wisdomRegistry.getDecayedWisdomScore(msg.sender);

            deposits[msg.sender] = Deposit({
                amount:            deployedAmount,
                reserveAmount:     reserveAmount,
                depositTime:       block.timestamp,
                lastClaimTime:     block.timestamp,
                pausedSnapshot:    _pausedSecondsNow(),
                wisdomTwapStart:   decayedScore,
                wisdomTwapAccum:   0,
                twapWindowStart:   block.timestamp,
                twapLastUpdated:   block.timestamp,
                inRebalanceLock:   rebalanceLock,
                rebalanceLockEnds: lockEnds
            });

            stats.depositorCount++;
            hasDeposit[msg.sender] = true;
        } else {
            Deposit storage dep = deposits[msg.sender];
            // Settle any funded yield first so the new principal does not
            // retroactively earn on the elapsed period.
            _settleYield(msg.sender, false);
            _updateWisdomTwap(dep, msg.sender);

            dep.amount        += deployedAmount;
            dep.reserveAmount += reserveAmount;

            if (rebalanceLock && !dep.inRebalanceLock) {
                dep.inRebalanceLock   = true;
                dep.rebalanceLockEnds = lockEnds;
            }
        }

        stats.totalDeposited += deployedAmount;
        stats.totalReserve   += reserveAmount;

        emit Deposited(msg.sender, credited, reserveAmount, deployedAmount);
        _assertSolvent();
    }

    // ============================================================
    // Core: Claim Yield (Tithe-First)
    // ============================================================

    /**
     * @notice Claim accrued yield. The tithe is transferred to the treasury
     *         before any user funds are released, and every component is paid
     *         only from the funded `yieldPool`.
     */
    function claimYield() external nonReentrant whenNotPaused {
        if (!hasDeposit[msg.sender]) revert NoDepositFound();
        uint256 paid = _settleYield(msg.sender, true);
        if (paid == 0) revert NothingToClaim();
    }

    // ============================================================
    // Core: Withdraw
    // ============================================================

    /**
     * @notice Withdraw principal and Joseph's Reserve. Accrued funded yield is
     *         settled first, so exiting never silently forfeits it (audit H-1).
     * @dev    Intentionally NOT guarded by whenNotPaused: users must always be
     *         able to exit, even during an emergency pause.
     */
    function withdraw() external nonReentrant {
        if (!hasDeposit[msg.sender]) revert NoDepositFound();

        _settleYield(msg.sender, false);

        Deposit storage dep = deposits[msg.sender];
        uint256 principal = dep.amount;
        uint256 reserve   = dep.reserveAmount;
        uint256 total     = principal + reserve;
        if (total == 0) revert InsufficientBalance();

        stats.totalDeposited -= principal;
        stats.totalReserve   -= reserve;
        hasDeposit[msg.sender] = false;
        delete deposits[msg.sender];

        depositToken.safeTransfer(msg.sender, total);

        emit Withdrawn(msg.sender, principal, reserve);
        _assertSolvent();
    }

    // ============================================================
    // Views
    // ============================================================

    /**
     * @notice Preview the yield a user would receive if they claimed right now,
     *         already capped at the funded yield pool.
     */
    function previewYield(address user) external view returns (YieldDistribution memory distribution) {
        if (!hasDeposit[user]) return distribution;
        return _computeDistribution(user);
    }

    /// @notice Effective APY in bps (net of tithe, including boosts). Advisory.
    function effectiveUserApy(address user) external view returns (uint256 effectiveApyBps) {
        uint256 netApyBps = (baseApyBps * (BASIS_POINTS - TITHE_RATE)) / BASIS_POINTS;
        if (!hasDeposit[user]) return netApyBps;

        Deposit storage dep = deposits[user];
        uint256 boostBps = _getWisdomBoost(_getWisdomTwap(dep, user), false);
        effectiveApyBps = (netApyBps * boostBps) / BASIS_POINTS;

        uint256 titheBlessingWad = wisdomRegistry.getTitheBlessingMultiplier(user);
        if (titheBlessingWad > 1e18) {
            uint256 blessingBps = ((titheBlessingWad - 1e18) * BASIS_POINTS) / 1e18;
            effectiveApyBps += (netApyBps * blessingBps) / BASIS_POINTS;
        }
    }

    /// @notice Tokens backing principal + reserve + funded yield.
    function solvencyFloor() public view returns (uint256) {
        return stats.totalDeposited + stats.totalReserve + yieldPool;
    }

    // ============================================================
    // Admin: yield funding
    // ============================================================

    /**
     * @notice Fund the vault with externally generated yield.
     * @dev    This is the ONLY way `yieldPool` grows, and the only source of
     *         user payouts (audit C-1 / C-2).
     */
    function reportYield(uint256 amount) external nonReentrant {
        if (msg.sender != yieldOracle) revert NotYieldOracle();
        if (amount == 0) revert ZeroDeposit();

        uint256 before = depositToken.balanceOf(address(this));
        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 credited = depositToken.balanceOf(address(this)) - before;
        if (credited == 0) revert ZeroDeposit();

        yieldPool += credited;
        stats.totalYieldGenerated += credited; // single source of truth (audit M-2)

        emit YieldReported(msg.sender, credited, yieldPool, block.timestamp);
        _assertSolvent();
    }

    // ============================================================
    // Admin: configuration
    // ============================================================

    function setJosephReserve(bool active) external onlyOwner {
        josephReserveActive = active;
        emit JosephReserveActivated(active, block.timestamp);
    }

    function setYieldOracle(address oracle) external onlyOwner {
        emit YieldOracleUpdated(yieldOracle, oracle);
        yieldOracle = oracle;
    }

    /// @notice Queue a payout-rate change; capped and timelocked (audit H-3).
    function queueBaseApy(uint256 newApyBps) external onlyOwner {
        if (newApyBps > MAX_BASE_APY_BPS) revert ApyAboveCap();
        pendingBaseApyBps = newApyBps;
        pendingBaseApyEta = block.timestamp + ADMIN_TIMELOCK;
        emit BaseApyChangeQueued(newApyBps, pendingBaseApyEta);
    }

    function executeBaseApy() external onlyOwner {
        if (pendingBaseApyEta == 0) revert NoPendingChange();
        if (block.timestamp < pendingBaseApyEta) revert TimelockPending();
        emit BaseApyUpdated(baseApyBps, pendingBaseApyBps);
        baseApyBps = pendingBaseApyBps;
        pendingBaseApyEta = 0;
    }

    /// @notice Queue a treasury change; timelocked so the tithe cannot be silently redirected.
    function queueTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        pendingTreasury    = newTreasury;
        pendingTreasuryEta = block.timestamp + ADMIN_TIMELOCK;
        emit TreasuryChangeQueued(newTreasury, pendingTreasuryEta);
    }

    function executeTreasury() external onlyOwner {
        if (pendingTreasuryEta == 0) revert NoPendingChange();
        if (block.timestamp < pendingTreasuryEta) revert TimelockPending();
        emit TreasuryUpdated(treasury, pendingTreasury);
        treasury = pendingTreasury;
        pendingTreasuryEta = 0;
    }

    function pause() external onlyOwner {
        pauseStartedAt = block.timestamp;
        _pause();
    }

    function unpause() external onlyOwner {
        if (pauseStartedAt != 0) {
            totalPausedSeconds += block.timestamp - pauseStartedAt;
            pauseStartedAt = 0;
        }
        _unpause();
    }

    /// @notice Rescue tokens sent here by mistake. The deposit token is excluded (audit L-4).
    function rescueToken(address token, address to, uint256 amount) external onlyOwner {
        if (token == address(depositToken)) revert CannotRescueDepositToken();
        if (to == address(0)) revert ZeroAddress();
        IERC20(token).safeTransfer(to, amount);
        emit TokenRescued(token, to, amount);
    }

    // ============================================================
    // Internal: settlement
    // ============================================================

    /**
     * @dev Settles funded yield for `user`, tithe-first, capped at `yieldPool`.
     *      Returns the total amount moved (tithe + user share).
     */
    function _settleYield(address user, bool /* strict */) internal returns (uint256) {
        Deposit storage dep = deposits[user];
        _updateWisdomTwap(dep, user);

        YieldDistribution memory d = _computeDistribution(user);
        uint256 payout = d.titheAmount + d.finalAmount;

        // Always advance the clock so unpaid time is not double-counted later.
        dep.lastClaimTime  = block.timestamp;
        dep.pausedSnapshot = _pausedSecondsNow();

        if (payout == 0) return 0;

        yieldPool -= payout;
        stats.totalTithePaid += d.titheAmount;
        stats.totalClaimed   += d.finalAmount;

        // TITHE-FIRST: the LORD's portion moves before the steward's.
        if (d.titheAmount > 0) {
            depositToken.safeTransfer(treasury, d.titheAmount);
            emit TithePaid(treasury, d.titheAmount, block.timestamp);
        }
        if (d.finalAmount > 0) {
            depositToken.safeTransfer(user, d.finalAmount);
        }

        emit YieldClaimed(
            user,
            d.grossYield,
            d.titheAmount,
            d.wisdomBonus,
            d.titheBlessingBonus,
            d.finalAmount
        );

        _assertSolvent();
        return payout;
    }

    /**
     * @dev Computes the distribution for `user`, scaled down pro-rata when the
     *      funded `yieldPool` cannot cover it. Principal and Joseph's Reserve
     *      are never touched.
     */
    function _computeDistribution(address user) internal view returns (YieldDistribution memory d) {
        Deposit storage dep = deposits[user];
        uint256 elapsed = _effectiveElapsed(dep);
        if (elapsed == 0 || dep.amount == 0 || yieldPool == 0) return d;

        uint256 gross = (dep.amount * baseApyBps * elapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
        if (gross == 0) return d;

        uint256 tithe = (gross * TITHE_RATE) / BASIS_POINTS;
        uint256 net   = gross - tithe;

        uint256 boostBps = _getWisdomBoost(
            _getWisdomTwap(dep, user),
            dep.inRebalanceLock && block.timestamp < dep.rebalanceLockEnds
        );
        uint256 wisdomBonus = (net * (boostBps - BASIS_POINTS)) / BASIS_POINTS;

        uint256 titheBlessingWad = wisdomRegistry.getTitheBlessingMultiplier(user);
        uint256 blessingBonus = titheBlessingWad > 1e18
            ? (net * (titheBlessingWad - 1e18)) / 1e18
            : 0;

        uint256 finalAmount = net + wisdomBonus + blessingBonus;
        uint256 payout = tithe + finalAmount;

        // Solvency cap: scale every component to what the funded pool can cover.
        if (payout > yieldPool) {
            uint256 pool = yieldPool;
            gross         = (gross * pool) / payout;
            tithe         = (tithe * pool) / payout;
            net           = (net * pool) / payout;
            wisdomBonus   = (wisdomBonus * pool) / payout;
            blessingBonus = (blessingBonus * pool) / payout;
            finalAmount   = net + wisdomBonus + blessingBonus;
            if (tithe + finalAmount > pool) {
                // Rounding guard — never exceed the funded pool.
                finalAmount = pool - tithe;
            }
        }

        d = YieldDistribution({
            grossYield:         gross,
            titheAmount:        tithe,
            netYield:           net,
            wisdomBonus:        wisdomBonus,
            titheBlessingBonus: blessingBonus,
            finalAmount:        finalAmount
        });
    }

    /// @dev Seconds eligible for yield since last settlement, excluding paused time.
    function _effectiveElapsed(Deposit storage dep) internal view returns (uint256) {
        uint256 raw = block.timestamp - dep.lastClaimTime;
        uint256 pausedSince = _pausedSecondsNow() - dep.pausedSnapshot;
        return raw > pausedSince ? raw - pausedSince : 0;
    }

    function _pausedSecondsNow() internal view returns (uint256) {
        if (paused() && pauseStartedAt != 0) {
            return totalPausedSeconds + (block.timestamp - pauseStartedAt);
        }
        return totalPausedSeconds;
    }

    function _assertSolvent() internal view {
        if (depositToken.balanceOf(address(this)) < solvencyFloor()) revert Insolvent();
    }

    // ============================================================
    // Internal: Wisdom TWAP (discrete 7-day window)
    // ============================================================

    /**
     * @dev Accumulates score × time within the current 7-day window. When the
     *      window expires it rolls forward, so the average reflects recent
     *      wisdom rather than a lifetime average (audit M-3).
     */
    function _updateWisdomTwap(Deposit storage dep, address user) internal {
        uint256 elapsed = block.timestamp - dep.twapLastUpdated;
        if (elapsed == 0) return;

        (uint256 currentScore, ) = wisdomRegistry.getDecayedWisdomScore(user);

        if (block.timestamp - dep.twapWindowStart >= TWAP_WINDOW) {
            // Roll the window forward, seeded with the current score.
            dep.wisdomTwapAccum = currentScore * TWAP_WINDOW;
            dep.twapWindowStart = block.timestamp - TWAP_WINDOW;
        } else {
            dep.wisdomTwapAccum += currentScore * elapsed;
        }
        dep.twapLastUpdated = block.timestamp;
    }

    /// @dev Time-weighted wisdom score over the current window (max TWAP_WINDOW).
    function _getWisdomTwap(Deposit storage dep, address user) internal view returns (uint256) {
        uint256 windowElapsed = block.timestamp - dep.twapWindowStart;
        if (windowElapsed == 0) return dep.wisdomTwapStart;
        if (windowElapsed > TWAP_WINDOW) windowElapsed = TWAP_WINDOW;

        (uint256 currentScore, ) = wisdomRegistry.getDecayedWisdomScore(user);
        uint256 pending = currentScore * (block.timestamp - dep.twapLastUpdated);
        uint256 accum   = dep.wisdomTwapAccum + pending;

        uint256 twap = accum / windowElapsed;
        return twap;
    }

    /// @notice Wisdom boost multiplier in bps; halved bonus while the Ecc 11:2 lock is active.
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

        if (rebalanceLockActive && boostBps > BASIS_POINTS) {
            uint256 bonusPortion = boostBps - BASIS_POINTS;
            boostBps = BASIS_POINTS + bonusPortion / 2;
        }
    }
}
