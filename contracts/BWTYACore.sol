// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  BWTYACore  (Biblical-Wisdom-To-Yield-Algorithm Core)
 * @notice Four parable-based yield pools with protocol-enforced 10% tithe on
 *         every yield distribution. APY multiplied by stewardship score via
 *         Talent Protocol V3 reputation integration.
 *
 *         "His master replied, 'Well done, good and faithful servant!
 *          You have been faithful with a few things; I will put you in
 *          charge of many things.'" — Matthew 25:21
 *
 * Pools
 * ─────
 *   0 — Talents Pool         (Matthew 25:14-30) — Stewardship-rewarded, active yield
 *   1 — Joseph's Storehouse  (Genesis 41:29-36) — Counter-cyclical, volatility-adjusted
 *   2 — Solomon's Treasury   (1 Kings 10:23)    — Blue-chip, wisdom-guided yield
 *   3 — Sabbath Rest Pool    (Exodus 20:8-11)   — Low-risk, stable yield (Sabbath-observed)
 *
 * Tithe enforcement
 * ─────────────────
 *   TITHE_RATE = 1000 bp = 10%  (Leviticus 27:30 / Malachi 3:10)
 *   On every yield harvest:
 *     titheAmount = yield × 10%  → routed to user's Church via Superfluid stream
 *     netYield    = yield × 90%  → returned to user
 *
 * APY calculation
 * ───────────────
 *   effectiveApy = baseApy × stewardshipMultiplier
 *   stewardshipMultiplier ∈ [1.00×, 2.00×]
 *   multiplier is driven by Talent Protocol V3 Builder Score (0–10000)
 */

import { Ownable }        from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Pausable }        from "@openzeppelin/contracts/security/Pausable.sol";
import { IERC20 }          from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import { WisdomOracle }    from "./WisdomOracle.sol";

// ─── External interfaces ──────────────────────────────────────────────────────

interface ITalentProtocol {
    /// @dev Returns the Builder Score (0–10000) for a given address on Base.
    function getBuilderScore(address user) external view returns (uint256);
}

interface IBibleFiSuperfluid {
    function openTitheStream(
        ISuperToken superToken,
        address church,
        int96 totalFlowRate
    ) external;
}

// ─────────────────────────────────────────────────────────────────────────────

contract BWTYACore is Ownable, ReentrancyGuard, Pausable {

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant TITHE_RATE      = 1_000;   // 10% in basis points
    uint256 public constant BASIS_POINTS    = 10_000;
    uint256 public constant POOL_COUNT      = 4;

    // Pool IDs
    uint8 public constant POOL_TALENTS    = 0;
    uint8 public constant POOL_JOSEPHS    = 1;
    uint8 public constant POOL_SOLOMONS   = 2;
    uint8 public constant POOL_SABBATH    = 3;

    // Talent Protocol V3 on Base
    address public constant TALENT_PROTOCOL =
        0x3E3B16b3e1Ba7d0cc2D77e3Bde23700c8e94Ea4A; // Base mainnet (verify before deploy)

    // ─── Types ────────────────────────────────────────────────────────────────

    struct Pool {
        string  name;
        string  parable;        // e.g. "Matthew 25:14-30"
        uint256 baseApyBps;     // base APY in basis points
        uint256 maxApyBps;      // max APY at 2× stewardship (= base × 2)
        uint256 totalDeposited; // total $BIBLEFI or $WISDOM deposited
        bool    sabbathPaused;  // true during Sabbath window
        bool    active;
    }

    struct UserPosition {
        uint256 deposited;          // principal in wei
        uint256 depositTimestamp;   // when they deposited
        uint256 lastHarvestTime;    // last time yield was claimed
        uint256 accruedYield;       // unharvested yield (wei)
        address church;             // user's chosen Church receiver
        uint8   poolId;
    }

    struct TitheReceipt {
        address user;
        address church;
        uint256 titheAmount;
        uint256 yieldAmount;
        uint256 timestamp;
        uint8   poolId;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    Pool[POOL_COUNT] public pools;

    /// @notice user → poolId → position
    mapping(address => mapping(uint8 => UserPosition)) public positions;

    /// @notice All tithe receipts (on-chain tax record)
    TitheReceipt[] public titheReceipts;

    ISuperToken           public immutable biblefiToken;
    ISuperToken           public immutable wisdomToken;
    WisdomOracle          public immutable oracle;
    IBibleFiSuperfluid    public superfluidRouter;
    ITalentProtocol       public talentProtocol;

    // Sabbath window — agents enforce this; contract enforces for Pool 3
    uint256 public sabbathStartOffsetSeconds; // seconds from midnight UTC Friday
    uint256 public sabbathDurationSeconds;    // 25 hours (sundown Fri → sundown Sat)

    // ─── Events ───────────────────────────────────────────────────────────────

    event Deposited(address indexed user, uint8 indexed poolId, uint256 amount);
    event Withdrawn(address indexed user, uint8 indexed poolId, uint256 amount);
    event YieldHarvested(
        address indexed user,
        uint8   indexed poolId,
        uint256 netYield,
        uint256 titheAmount,
        address church
    );
    event TitheRouted(
        address indexed user,
        address indexed church,
        uint256 titheAmount,
        uint8   poolId
    );
    event StewardshipMultiplierApplied(
        address indexed user,
        uint256 builderScore,
        uint256 multiplierBps,
        uint256 effectiveApyBps
    );
    event PoolUpdated(uint8 indexed poolId, uint256 newBaseApyBps);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error InvalidPool(uint8 poolId);
    error ZeroDeposit();
    error InsufficientBalance();
    error NoYieldToHarvest();
    error NoChurchSet();
    error SabbathWindow();
    error PoolInactive();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        ISuperToken    _biblefiToken,
        ISuperToken    _wisdomToken,
        WisdomOracle   _oracle,
        address        _superfluidRouter
    ) {
        biblefiToken     = _biblefiToken;
        wisdomToken      = _wisdomToken;
        oracle           = _oracle;
        superfluidRouter = IBibleFiSuperfluid(_superfluidRouter);
        talentProtocol   = ITalentProtocol(TALENT_PROTOCOL);

        // Sabbath: Friday 18:00 UTC → Saturday 19:00 UTC (25 hours)
        sabbathStartOffsetSeconds = 4 days + 18 hours; // from Sunday midnight
        sabbathDurationSeconds    = 25 hours;

        _initPools();
    }

    // ─── Deposit ──────────────────────────────────────────────────────────────

    /**
     * @notice Deposit $BIBLEFI into a yield pool.
     *         The 10% tithe on yield is enforced at harvest time, not deposit.
     *
     * @param poolId    0=Talents, 1=Joseph's, 2=Solomon's, 3=Sabbath
     * @param amount    Amount of $BIBLEFI to deposit (wei)
     * @param church    Church receiver address for tithe streams
     */
    function deposit(
        uint8   poolId,
        uint256 amount,
        address church
    ) external nonReentrant whenNotPaused {
        if (poolId >= POOL_COUNT)        revert InvalidPool(poolId);
        if (amount == 0)                  revert ZeroDeposit();
        if (!pools[poolId].active)        revert PoolInactive();
        if (church == address(0))         revert NoChurchSet();
        if (_isSabbath() && poolId == POOL_SABBATH) {
            // Sabbath Rest pool observes the Sabbath — no new deposits
            revert SabbathWindow();
        }

        // Accrue any existing yield before changing the position
        _accrueYield(msg.sender, poolId);

        UserPosition storage pos = positions[msg.sender][poolId];
        pos.deposited         += amount;
        pos.depositTimestamp   = block.timestamp;
        pos.church             = church;
        pos.poolId             = poolId;

        pools[poolId].totalDeposited += amount;

        biblefiToken.transferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, poolId, amount);
    }

    // ─── Withdraw ─────────────────────────────────────────────────────────────

    /**
     * @notice Withdraw principal from a pool.
     *         Automatically harvests and tithes any accrued yield first.
     */
    function withdraw(uint8 poolId, uint256 amount)
        external
        nonReentrant
    {
        if (poolId >= POOL_COUNT) revert InvalidPool(poolId);
        UserPosition storage pos = positions[msg.sender][poolId];
        if (pos.deposited < amount) revert InsufficientBalance();

        _accrueYield(msg.sender, poolId);
        if (pos.accruedYield > 0) {
            _harvestAndTithe(msg.sender, poolId);
        }

        pos.deposited            -= amount;
        pools[poolId].totalDeposited -= amount;

        biblefiToken.transfer(msg.sender, amount);

        emit Withdrawn(msg.sender, poolId, amount);
    }

    // ─── Harvest ──────────────────────────────────────────────────────────────

    /**
     * @notice Harvest accrued yield and automatically route 10% tithe to Church.
     *
     *         The protocol enforces Leviticus 27:30 / Malachi 3:10:
     *         the tithe is separated before any yield reaches the user.
     */
    function harvest(uint8 poolId)
        external
        nonReentrant
        whenNotPaused
    {
        if (poolId >= POOL_COUNT) revert InvalidPool(poolId);
        _accrueYield(msg.sender, poolId);

        UserPosition storage pos = positions[msg.sender][poolId];
        if (pos.accruedYield == 0) revert NoYieldToHarvest();

        _harvestAndTithe(msg.sender, poolId);
    }

    // ─── View: effective APY ──────────────────────────────────────────────────

    /**
     * @notice Returns the effective APY for a user in a pool, factoring in
     *         their Talent Protocol Builder Score.
     */
    function getEffectiveApy(address user, uint8 poolId)
        external
        view
        returns (uint256 effectiveApyBps, uint256 builderScore, uint256 multiplierBps)
    {
        if (poolId >= POOL_COUNT) revert InvalidPool(poolId);
        builderScore    = _getBuilderScore(user);
        multiplierBps   = _stewardshipMultiplier(builderScore);
        effectiveApyBps = (pools[poolId].baseApyBps * multiplierBps) / 100;
    }

    /**
     * @notice Returns a user's pending (unharvested) yield, plus the tithe
     *         and net amounts that will be distributed on next harvest.
     */
    function pendingYield(address user, uint8 poolId)
        external
        view
        returns (uint256 totalYield, uint256 titheAmount, uint256 netYield)
    {
        if (poolId >= POOL_COUNT) revert InvalidPool(poolId);
        UserPosition storage pos = positions[user][poolId];

        uint256 newYield     = _computeNewYield(user, poolId, pos);
        totalYield           = pos.accruedYield + newYield;
        titheAmount          = (totalYield * TITHE_RATE) / BASIS_POINTS;
        netYield             = totalYield - titheAmount;
    }

    /**
     * @notice Returns the full tithe receipt history for a user (for tax records).
     */
    function getTitheReceiptCount() external view returns (uint256) {
        return titheReceipts.length;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setPoolApy(uint8 poolId, uint256 newBaseApyBps) external onlyOwner {
        if (poolId >= POOL_COUNT) revert InvalidPool(poolId);
        pools[poolId].baseApyBps = newBaseApyBps;
        pools[poolId].maxApyBps  = newBaseApyBps * 2;
        emit PoolUpdated(poolId, newBaseApyBps);
    }

    function setTalentProtocol(address _talentProtocol) external onlyOwner {
        talentProtocol = ITalentProtocol(_talentProtocol);
    }

    function setSuperfluidRouter(address _router) external onlyOwner {
        superfluidRouter = IBibleFiSuperfluid(_router);
    }

    function pause()   external onlyOwner { _pause();   }
    function unpause() external onlyOwner { _unpause(); }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _initPools() internal {
        pools[POOL_TALENTS] = Pool({
            name:           "Talents Pool",
            parable:        "Matthew 25:14-30",
            baseApyBps:     1_200,   // 12% base APY; up to 24% at 2× multiplier
            maxApyBps:      2_400,
            totalDeposited: 0,
            sabbathPaused:  false,
            active:         true
        });

        pools[POOL_JOSEPHS] = Pool({
            name:           "Joseph's Storehouse",
            parable:        "Genesis 41:29-36",
            baseApyBps:     800,     // 8% base; counter-cyclical strategy
            maxApyBps:      1_600,
            totalDeposited: 0,
            sabbathPaused:  false,
            active:         true
        });

        pools[POOL_SOLOMONS] = Pool({
            name:           "Solomon's Treasury",
            parable:        "1 Kings 10:23",
            baseApyBps:     500,     // 5% base; blue-chip, low risk
            maxApyBps:      1_000,
            totalDeposited: 0,
            sabbathPaused:  false,
            active:         true
        });

        pools[POOL_SABBATH] = Pool({
            name:           "Sabbath Rest Pool",
            parable:        "Exodus 20:8-11",
            baseApyBps:     300,     // 3% base; stable yield, Sabbath-observed
            maxApyBps:      600,
            totalDeposited: 0,
            sabbathPaused:  true,    // pauses during Sabbath window
            active:         true
        });
    }

    function _accrueYield(address user, uint8 poolId) internal {
        UserPosition storage pos = positions[user][poolId];
        if (pos.deposited == 0) return;

        uint256 newYield = _computeNewYield(user, poolId, pos);
        pos.accruedYield      += newYield;
        pos.lastHarvestTime    = block.timestamp;
    }

    function _computeNewYield(
        address user,
        uint8   poolId,
        UserPosition storage pos
    ) internal view returns (uint256) {
        if (pos.deposited == 0 || pos.lastHarvestTime == 0) return 0;

        uint256 elapsed  = block.timestamp - pos.lastHarvestTime;
        uint256 builderScore = _getBuilderScore(user);
        uint256 multiplier   = _stewardshipMultiplier(builderScore);
        uint256 effectiveApy = (pools[poolId].baseApyBps * multiplier) / 100;

        // yield = principal × effectiveApy × elapsed / (365 days × 10000)
        return (pos.deposited * effectiveApy * elapsed) / (365 days * BASIS_POINTS);
    }

    function _harvestAndTithe(address user, uint8 poolId) internal {
        UserPosition storage pos = positions[user][poolId];
        uint256 totalYield  = pos.accruedYield;
        pos.accruedYield    = 0;
        pos.lastHarvestTime = block.timestamp;

        uint256 titheAmount = (totalYield * TITHE_RATE) / BASIS_POINTS;
        uint256 netYield    = totalYield - titheAmount;

        // Route tithe to Church via transfer (Superfluid streaming for tithe
        // is handled at the BibleFiSuperfluid layer per user preference)
        if (titheAmount > 0 && pos.church != address(0)) {
            biblefiToken.transfer(pos.church, titheAmount);

            titheReceipts.push(TitheReceipt({
                user:        user,
                church:      pos.church,
                titheAmount: titheAmount,
                yieldAmount: totalYield,
                timestamp:   block.timestamp,
                poolId:      poolId
            }));

            emit TitheRouted(user, pos.church, titheAmount, poolId);
        }

        // Return net yield to user
        if (netYield > 0) {
            biblefiToken.transfer(user, netYield);
        }

        uint256 builderScore = _getBuilderScore(user);
        uint256 multiplier   = _stewardshipMultiplier(builderScore);
        uint256 effectiveApy = (pools[poolId].baseApyBps * multiplier) / 100;

        emit StewardshipMultiplierApplied(user, builderScore, multiplier, effectiveApy);
        emit YieldHarvested(user, poolId, netYield, titheAmount, pos.church);
    }

    function _getBuilderScore(address user) internal view returns (uint256) {
        try talentProtocol.getBuilderScore(user) returns (uint256 score) {
            return score > 10_000 ? 10_000 : score; // normalize to 0–10000
        } catch {
            return 0; // no score = no multiplier bonus
        }
    }

    /// @dev Maps Builder Score 0–10000 → multiplier 100–200 (1.00×–2.00×)
    function _stewardshipMultiplier(uint256 builderScore) internal pure returns (uint256) {
        uint256 m = 100 + (builderScore * 100) / 10_000;
        return m > 200 ? 200 : m;
    }

    function _isSabbath() internal view returns (bool) {
        uint256 secondsInWeek = block.timestamp % 7 days;
        uint256 sabbathEnd    = sabbathStartOffsetSeconds + sabbathDurationSeconds;
        return (secondsInWeek >= sabbathStartOffsetSeconds && secondsInWeek < sabbathEnd);
    }
}
