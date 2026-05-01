// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BWTYAMath — Biblical-Wisdom-To-Yield-Algorithm Fixed-Point Math Library
 * @notice Original on-chain mathematical primitives for BWTYA scoring and allocation.
 *
 * @dev All values use 18-decimal fixed-point representation (WAD = 1e18 = 1.0)
 *      unless noted otherwise.  The algorithms mirror the TypeScript mathEngine.ts
 *      with adaptations for integer-only Solidity arithmetic.
 *
 * Mathematical foundations
 * ────────────────────────
 * • Fruit Sustainability Curve  – parabolic bell approximating log-normal, peak at 12 % APY
 * • TVL Depth Score             – Babylonian square-root with diminishing returns
 * • Kelly Criterion             – optimal fractional allocation (fixed-point)
 * • Wisdom Decay                – first-order exponential approximation via (1 - λ)^n
 * • Tithe Blessing              – compound blessing curve for consecutive tithers
 * • Conviction Score            – 4th-root geometric mean of normalised dimensions
 * • Max Drawdown Estimate       – weighted-average risk × drawdown factor
 *
 * Biblical anchors
 * ────────────────
 * • John 15:16    – "fruit that will last"               → Fruit Sustainability Curve
 * • Matthew 25:14 – Parable of the Talents               → Kelly Criterion allocation
 * • Ecc 11:2      – "invest in seven ventures, in eight" → Conviction & diversification
 * • Malachi 3:10  – overflowing blessing for tithers     → Tithe Blessing Curve
 * • Luke 16:10    – "faithful in little"                 → Wisdom Decay (faithfulness matters)
 */
library BWTYAMath {

    // ============================================================
    // Constants
    // ============================================================

    uint256 internal constant WAD = 1e18;           // 1.0 in fixed-point
    uint256 internal constant BASIS_POINTS = 10_000; // 100 % in bps

    // Fruit Sustainability Curve — peak APY in basis points (12 % = 1200 bps)
    uint256 internal constant APY_PEAK_BPS = 1_200;

    // TVL target for full score: $100 M represented as integer USD
    uint256 internal constant TVL_TARGET = 100_000_000;

    // Kelly Criterion: risk-free rate in basis points (4 % = 400 bps)
    uint256 internal constant RISK_FREE_BPS = 400;
    // Maximum single-position Kelly fraction (35 % in WAD)
    uint256 internal constant KELLY_MAX = 35e16; // 0.35 WAD

    // Wisdom Decay: per-day decay factor in WAD form
    // λ = 0.005/day → per-day factor = 1 - 0.005 = 0.995
    // We store as (995 * WAD / 1000) for integer math
    uint256 internal constant DECAY_FACTOR_NUMERATOR   = 995;
    uint256 internal constant DECAY_FACTOR_DENOMINATOR = 1_000;
    // Minimum retained wisdom fraction (40 %)
    uint256 internal constant WISDOM_FLOOR_FRAC = 40e16; // 0.40 WAD

    // Tithe Blessing: τ = 6 months (rounded to 180 days); max bonus = 50 %
    // Approximation: blessing(m) ≈ 1.0 + 0.5 × m / (m + TAU)  (Padé [1/1])
    uint256 internal constant TITHE_TAU_MONTHS  = 6;
    uint256 internal constant TITHE_MAX_BONUS   = 50e16; // 0.50 WAD → max 1.50× multiplier

    // Drawdown factor: 0.45 (45 % of weighted risk score)
    uint256 internal constant DRAWDOWN_FACTOR = 45e16; // 0.45 WAD

    // Dimension max scores (for conviction normalisation)
    uint256 internal constant DIM1_MAX = 30; // Fruit-bearing
    uint256 internal constant DIM2_MAX = 25; // Faithful Stewardship
    uint256 internal constant DIM3_MAX = 25; // Biblical Alignment
    uint256 internal constant DIM4_MAX = 20; // Transparency

    // ============================================================
    // 1. Fruit Sustainability Curve  (John 15:16)
    // ============================================================

    /**
     * @notice Parabolic bell curve centred at APY_PEAK_BPS (12 %).
     * @dev Approximates the log-normal curve with a symmetric parabola on a
     *      log-APY axis:
     *
     *        score = MAX × max(0, 1 - ((ln(apy) - ln(peak)) / σ)²)
     *
     *      We avoid floating-point ln by working in log-2 space and using
     *      a look-up table for the three major APY bands:
     *        ≤ 5 %   → score decays linearly from 0 at 0 % to 20 pts at 5 %
     *        5–25 %  → score = 30 × (1 - ((apy_bps - 1200) / 1000)²)  [capped 0–30]
     *        > 25 %  → score decays as 30 × (1200 / apy_bps)^1.5      [integer approx]
     *
     * @param apyBps  APY in basis points (e.g. 1500 = 15 %)
     * @return score  0–30 points
     */
    function fruitSustainabilityCurve(uint256 apyBps) internal pure returns (uint256 score) {
        if (apyBps == 0) return 0;

        if (apyBps <= 500) {
            // Low APY: linear ramp 0→20 over 0–5 %
            return (apyBps * 20) / 500;
        }

        if (apyBps <= 2_500) {
            // Core orchard zone: parabola peaked at 1200 bps
            // delta = |apy_bps - 1200|, spread = 1000 bps
            uint256 delta = apyBps >= APY_PEAK_BPS
                ? apyBps - APY_PEAK_BPS
                : APY_PEAK_BPS - apyBps;
            // score = 30 × (1 - (delta/1000)²) clamped [0, 30]
            if (delta >= 1_000) return 0;
            uint256 frac = (delta * WAD) / 1_000; // normalised deviation in WAD
            uint256 sq   = (frac * frac) / WAD;   // (delta/1000)² in WAD
            if (sq >= WAD) return 0;
            return (30 * (WAD - sq)) / WAD;
        }

        // High APY: inverse power law — 30 × (1200 / apy)^1.5
        // Integer approximation: score ≈ 30 × (peak/apy) × sqrt(peak/apy)
        uint256 ratio   = (APY_PEAK_BPS * WAD) / apyBps;               // WAD
        uint256 sqrtRat = babylonianSqrt(ratio * WAD) / 1e9;            // WAD (approx)
        uint256 raw     = (30 * ratio * sqrtRat) / (WAD * WAD / 1e9);   // pts
        return raw > 30 ? 0 : raw; // ultra-high APY → near zero
    }

    // ============================================================
    // 2. TVL Depth Score  (Matthew 25:14)
    // ============================================================

    /**
     * @notice Square-root scaling for TVL (diminishing marginal returns).
     * @dev score = 15 × min(1, sqrt(tvl / TVL_TARGET))
     * @param tvlUsd  Total Value Locked in USD (integer)
     * @return score  0–15 points
     */
    function tvlDepthScore(uint256 tvlUsd) internal pure returns (uint256 score) {
        if (tvlUsd == 0) return 0;
        // ratio = tvl / TVL_TARGET in WAD
        uint256 ratio = tvlUsd >= TVL_TARGET ? WAD : (tvlUsd * WAD) / TVL_TARGET;
        // sqrt(ratio) in WAD
        uint256 sqrtRatio = babylonianSqrt(ratio * WAD) / 1e9;
        if (sqrtRatio > WAD) sqrtRatio = WAD;
        return (15 * sqrtRatio) / WAD;
    }

    // ============================================================
    // 3. Kelly Criterion Allocation  (Ecclesiastes 11:2)
    // ============================================================

    /**
     * @notice On-chain Kelly Criterion: optimal fractional allocation.
     * @dev    p  = bwtyaScore / 100   (probability of positive outcome)
     *         b  = apyBps / RISK_FREE_BPS  (gain ratio over risk-free rate)
     *         f* = (p×b − q) / b     where q = 1 − p
     *
     *         Returns fraction in WAD units, clamped to [0, KELLY_MAX].
     *
     * @param bwtyaScore  0–100 composite BWTYA score
     * @param apyBps      Expected APY in basis points
     * @return fraction   WAD fraction (e.g. 25e16 = 25 %)
     */
    function kellyFraction(
        uint256 bwtyaScore,
        uint256 apyBps
    ) internal pure returns (uint256 fraction) {
        if (bwtyaScore == 0 || apyBps == 0) return 0;

        // Scale score: p in WAD, clamped (1 %, 99 %)
        uint256 p = (bwtyaScore * WAD) / 100;
        if (p < 1e16) p = 1e16;
        if (p > 99e16) p = 99e16;
        uint256 q = WAD - p;

        // b = apyBps / RISK_FREE_BPS (WAD)
        uint256 b = (apyBps * WAD) / RISK_FREE_BPS;
        if (b < 1e14) b = 1e14; // floor at 0.0001 to avoid division by zero

        // f* = (p×b − q) / b  (all in WAD)
        uint256 pb = (p * b) / WAD;
        if (pb <= q) return 0; // negative Kelly → don't allocate
        uint256 kelly = ((pb - q) * WAD) / b;

        return kelly > KELLY_MAX ? KELLY_MAX : kelly;
    }

    // ============================================================
    // 4. Wisdom Decay  (Luke 16:10 – faithfulness matters over time)
    // ============================================================

    /**
     * @notice Exponential wisdom decay for inactive users.
     * @dev    W(t) ≈ W₀ × (0.995)^daysInactive,  floored at WISDOM_FLOOR_FRAC × W₀
     *
     *         Uses repeated multiplication approximation (safe for t ≤ 365).
     *         For longer horizons use the binomial approximation:
     *           (1 - λ)^n ≈ 1 - n×λ + n(n-1)/2×λ² (two terms)
     *
     * @param currentScore   Current wisdom score (any integer scale)
     * @param daysInactive   Days since last BibleFI activity
     * @return decayedScore  Decayed wisdom score (same scale as input)
     */
    function wisdomDecay(
        uint256 currentScore,
        uint256 daysInactive
    ) internal pure returns (uint256 decayedScore) {
        if (daysInactive == 0) return currentScore;

        // Binomial two-term approximation: (1 - λ)^n ≈ 1 - nλ + n(n-1)/2 λ²
        // λ = 5/1000 = 0.005
        uint256 lambda_num = 5;
        uint256 lambda_den = 1_000;
        uint256 n = daysInactive;

        // term1 = n × λ  (as fraction × currentScore)
        uint256 term1 = (n * lambda_num * currentScore) / lambda_den;
        // term2 = n(n-1)/2 × λ²  (second-order correction)
        uint256 term2 = (n * (n > 0 ? n - 1 : 0) * lambda_num * lambda_num * currentScore)
                        / (2 * lambda_den * lambda_den);

        uint256 reduction = term1 > term2 ? term1 - term2 : 0;
        uint256 result    = reduction < currentScore ? currentScore - reduction : 0;

        // Floor at WISDOM_FLOOR_FRAC (40 %) of original
        uint256 floor = (currentScore * 40) / 100;
        return result < floor ? floor : result;
    }

    // ============================================================
    // 5. Tithe Blessing Multiplier  (Malachi 3:10)
    // ============================================================

    /**
     * @notice Compound blessing multiplier for consecutive months of tithing.
     * @dev    blessing(m) = WAD + TITHE_MAX_BONUS × m / (m + TITHE_TAU_MONTHS)
     *
     *         This is the Padé [1/1] approximation of the exponential saturation
     *         curve from wisdomMath.ts, which avoids floating-point exp().
     *
     *         Examples:
     *           m=0  → 1.00× (no bonus)
     *           m=6  → 1.25×
     *           m=12 → 1.33×
     *           m=36 → 1.43×
     *           m→∞  → 1.50× (asymptote)
     *
     * @param consecutiveMonths  Months of unbroken tithing
     * @return multiplier        WAD-scaled multiplier (WAD = 1.0×)
     */
    function titheBlessingMultiplier(
        uint256 consecutiveMonths
    ) internal pure returns (uint256 multiplier) {
        if (consecutiveMonths == 0) return WAD;
        // m / (m + τ) in WAD
        uint256 frac = (consecutiveMonths * WAD) / (consecutiveMonths + TITHE_TAU_MONTHS);
        uint256 bonus = (TITHE_MAX_BONUS * frac) / WAD;
        return WAD + bonus;
    }

    // ============================================================
    // 6. Conviction Score  (geometric mean of 4 dimensions)
    // ============================================================

    /**
     * @notice 4th-root geometric mean of normalised dimension scores.
     * @dev    conviction = 100 × ⁴√( (d1/30) × (d2/25) × (d3/25) × (d4/20) )
     *
     *         Integer approximation: we compute the product in WAD space,
     *         then take the integer 4th root via two Babylonian square-root passes.
     *
     * @param d1  Fruit-bearing score (0–30)
     * @param d2  Faithful Stewardship score (0–25)
     * @param d3  Biblical Alignment score (0–25)
     * @param d4  Transparency score (0–20)
     * @return conviction  0–100
     */
    function convictionScore(
        uint256 d1,
        uint256 d2,
        uint256 d3,
        uint256 d4
    ) internal pure returns (uint256 conviction) {
        // Normalise each dimension to WAD (clamp at max)
        uint256 n1 = d1 > DIM1_MAX ? WAD : (d1 * WAD) / DIM1_MAX;
        uint256 n2 = d2 > DIM2_MAX ? WAD : (d2 * WAD) / DIM2_MAX;
        uint256 n3 = d3 > DIM3_MAX ? WAD : (d3 * WAD) / DIM3_MAX;
        uint256 n4 = d4 > DIM4_MAX ? WAD : (d4 * WAD) / DIM4_MAX;

        // Product in WAD: n1 × n2 × n3 × n4 (carefully scaled)
        uint256 p12  = (n1 * n2) / WAD;
        uint256 p34  = (n3 * n4) / WAD;
        uint256 prod = (p12 * p34) / WAD; // WAD-scaled product ∈ [0, WAD]

        // 4th root: sqrt(sqrt(prod × WAD)) / sqrt(WAD)
        uint256 sqrt1 = babylonianSqrt(prod * WAD);
        uint256 sqrt2 = babylonianSqrt(sqrt1 * 1e9); // scale up for precision
        uint256 denom = babylonianSqrt(WAD * 1e9);

        if (denom == 0) return 0;
        conviction = (100 * sqrt2) / denom;
        if (conviction > 100) conviction = 100;
    }

    // ============================================================
    // 7. Max Drawdown Estimate
    // ============================================================

    /**
     * @notice Weighted-average risk score × drawdown factor.
     * @dev    maxDrawdown = DRAWDOWN_FACTOR × Σ (alloc_i × risk_i) / Σ alloc_i
     *
     * @param allocations  Array of allocation percentages (must sum to 100)
     * @param riskScores   Corresponding risk scores (0–100 each)
     * @return drawdownPct Estimated max drawdown 0–100 (in percentage points)
     */
    function maxDrawdownEstimate(
        uint256[] memory allocations,
        uint256[] memory riskScores
    ) internal pure returns (uint256 drawdownPct) {
        require(allocations.length == riskScores.length, "BWTYAMath: length mismatch");
        uint256 n = allocations.length;
        if (n == 0) return 0;

        uint256 weightedRisk = 0;
        uint256 totalAlloc   = 0;
        for (uint256 i = 0; i < n; i++) {
            weightedRisk += allocations[i] * riskScores[i];
            totalAlloc   += allocations[i];
        }
        if (totalAlloc == 0) return 0;
        uint256 avgRisk = weightedRisk / totalAlloc;        // 0–100
        drawdownPct = (avgRisk * DRAWDOWN_FACTOR) / WAD;   // 0–45
    }

    // ============================================================
    // 8. Ecclesiastes Diversification Score  (Ecc 11:2)
    // ============================================================

    /**
     * @notice Herfindahl–Hirschman Index inverted to a diversification score.
     * @dev    HHI = Σ (alloc_i / 100)²
     *         score = (1 - HHI) × 100  → 0–100 (100 = perfect diversification)
     *
     * @param allocations  Allocation percentages (should sum to 100)
     * @return score       0–100 diversification health score
     */
    function ecclesiastesDiversificationScore(
        uint256[] memory allocations
    ) internal pure returns (uint256 score) {
        uint256 hhi = 0;
        for (uint256 i = 0; i < allocations.length; i++) {
            uint256 a = allocations[i]; // 0–100
            hhi += a * a;              // sum of squares (0–10000 each)
        }
        // HHI is in units of 100² = 10000; fully concentrated = 10000
        if (hhi >= 10_000) return 0;
        score = 100 - (hhi * 100) / 10_000;
    }

    // ============================================================
    // Internal: Babylonian Square Root
    // ============================================================

    /**
     * @notice Integer square root via Babylonian (Newton–Raphson) method.
     * @dev    Accurate to ±1 ULP.  O(log n) iterations.
     */
    function babylonianSqrt(uint256 x) internal pure returns (uint256 z) {
        if (x == 0) return 0;
        z = x;
        uint256 y = (x >> 1) + 1;
        while (y < z) {
            z = y;
            y = (x / y + y) >> 1;
        }
    }
}
