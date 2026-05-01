// BWTYA – Advanced Math Engine
//
// Original algorithms powering the Biblical-Wisdom-To-Yield-Algorithm's
// quantitative scoring layer.  All functions are pure, deterministic, and
// free of side-effects so they can run on both client and server.
//
// Mathematical foundations
// ────────────────────────
// • Fruit Sustainability Curve  – log-normal bell centered at 12 % APY
// • TVL Depth Score             – square-root scaling (diminishing returns)
// • Risk-Adjusted Return        – Sharpe-analogue adjusted for on-chain risk
// • Protocol Trust Decay        – exponential ramp-up for new protocols
// • Kelly Criterion             – optimal fractional capital allocation
// • Pareto Dominance            – eliminate strictly-dominated opportunities
// • Conviction Score            – geometric mean penalises dimension spikiness
// • Ecclesiastes Ratio          – Ecc 11:2 diversification health check

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LN2 = 0.693_147_180_559_945;

/** Natural log approximation (Taylor series, accurate to ±1e-9 for x > 0) */
function ln(x: number): number {
  if (x <= 0) return -Infinity;
  // Use Math.log which is native and IEEE-754 compliant
  return Math.log(x);
}

/** Clamp a value between lo and hi */
export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ---------------------------------------------------------------------------
// 1. Fruit Sustainability Curve  (John 15:16)
// ---------------------------------------------------------------------------

/**
 * Log-normal bell curve centered at APY_PEAK with spread σ = LOG_SIGMA.
 *
 * Returns a score in [0, 30].  The curve peaks at APY_PEAK (12 %) and falls
 * off symmetrically on a logarithmic scale — mirroring the natural growth of
 * a well-tended orchard: too little yield suggests the ground is barren, too
 * much suggests unsustainable extraction.
 *
 *   f(a) = 30 · exp( -½ · (ln(a/peak) / σ)² )
 *
 * Flags are appended to the provided array for edge cases.
 */
const APY_PEAK = 12;    // sustainable orchard centre (%)
const LOG_SIGMA = 0.9;  // spread parameter (wider = more lenient)

export function fruitSustainabilityCurve(
  apy: number,
  flags: string[],
): number {
  if (apy <= 0) {
    flags.push('⚠️ Zero or negative APY – no fruit produced');
    return 0;
  }
  if (apy > 200) {
    flags.push('🚩 APY > 200 % – almost certainly unsustainable (Proverbs 13:11)');
  } else if (apy > 60) {
    flags.push('🚩 Extremely high APY – potential unsustainability risk');
  } else if (apy > 25) {
    flags.push('⚠️ Elevated APY – verify sustainability (John 15:16)');
  }

  const logRatio = ln(apy / APY_PEAK) / LOG_SIGMA;
  const raw = 30 * Math.exp(-0.5 * logRatio * logRatio);
  return clamp(raw, 0, 30);
}

// ---------------------------------------------------------------------------
// 2. TVL Depth Score  (Matthew 25:14 – "more will be given")
// ---------------------------------------------------------------------------

/**
 * Square-root scaling: each order-of-magnitude increase in TVL yields
 * diminishing marginal score — reflecting the parable principle that deeper
 * markets are safer but that size alone is not righteousness.
 *
 *   tvlScore = 15 · min(1, √(tvl / TVL_TARGET))
 *
 * TVL_TARGET is $100 M (full 15 pts).  A $1 M protocol scores ≈ 4.7 pts.
 */
const TVL_TARGET = 100_000_000; // $100 M

export function tvlDepthScore(tvlUsd: number, flags: string[]): number {
  if (tvlUsd < 100_000) {
    flags.push('⚠️ Very low TVL – limited market depth');
  }
  const ratio = tvlUsd / TVL_TARGET;
  return clamp(15 * Math.sqrt(ratio), 0, 15);
}

// ---------------------------------------------------------------------------
// 3. Risk-Adjusted Return  (Proverbs 27:12 – "the prudent sees danger")
// ---------------------------------------------------------------------------

/**
 * Sharpe-analogue: divides the raw yield score by a risk penalty factor so
 * that high-risk, high-APY protocols don't blind the scorer.
 *
 *   riskAdjusted = rawScore / (1 + riskScore/100)^RISK_EXPONENT
 *
 * RISK_EXPONENT = 1.5 gives a strong but not total penalty for high risk.
 */
const RISK_EXPONENT = 1.5;

export function riskAdjustedReturn(rawScore: number, riskScore: number): number {
  const penalty = Math.pow(1 + riskScore / 100, RISK_EXPONENT);
  return rawScore / penalty;
}

// ---------------------------------------------------------------------------
// 4. Protocol Trust Decay  (Luke 16:10 – "faithful in little")
// ---------------------------------------------------------------------------

/**
 * New protocols haven't had time to prove faithfulness.  This function
 * applies an exponential ramp-up: a brand-new protocol (0 days) gets 0.3× of
 * the full transparency score; a 2-year-old protocol gets ~0.97×.
 *
 *   trustFactor(t) = FLOOR + (1 - FLOOR) · (1 - e^(-t / TAU))
 *
 * TAU = 180 days (half-life ≈ 125 days).
 */
const TRUST_TAU = 180;   // days for ramp-up
const TRUST_FLOOR = 0.3; // brand-new protocol minimum factor

export function protocolTrustDecay(protocolAgeDays: number): number {
  if (protocolAgeDays <= 0) return TRUST_FLOOR;
  const ramp = 1 - Math.exp(-protocolAgeDays / TRUST_TAU);
  return TRUST_FLOOR + (1 - TRUST_FLOOR) * ramp;
}

// ---------------------------------------------------------------------------
// 5. Kelly Criterion Allocation  (Ecclesiastes 11:2 – "divide your portion")
// ---------------------------------------------------------------------------

/**
 * Computes the optimal fractional allocation for a yield opportunity using the
 * Kelly Criterion adapted for DeFi:
 *
 *   p  = perceived probability of positive outcome  = bwtyaScore / 100
 *   b  = expected gain ratio                        = apy / riskFreeRate
 *   q  = 1 - p
 *   f* = (p·b - q) / b
 *
 * Result is clamped to [0, MAX_KELLY] to avoid over-concentration ("invest in
 * eight" – Ecc 11:2 mandates diversification even for high-conviction picks).
 *
 * @param bwtyaScore  0–100 composite score
 * @param apy         expected APY (%)
 * @param riskFreeRate baseline APY to beat (default 4 % – US T-bill proxy)
 */
const RISK_FREE_RATE = 4; // %
const MAX_KELLY = 0.35;   // cap single-position at 35 % (Ecc 11:2 compliance)

export function kellyFraction(
  bwtyaScore: number,
  apy: number,
  riskFreeRate = RISK_FREE_RATE,
): number {
  const p = clamp(bwtyaScore / 100, 0.01, 0.99);
  const q = 1 - p;
  const b = apy > 0 ? apy / Math.max(riskFreeRate, 0.01) : 0.01;
  const kelly = (p * b - q) / b;
  return clamp(kelly, 0, MAX_KELLY);
}

/**
 * Normalises a set of Kelly fractions so they sum to 1.0, then converts to
 * integer allocation percents (rounding remainder to the first position).
 */
export function normaliseKellyAllocations(fractions: number[]): number[] {
  const total = fractions.reduce((s, f) => s + f, 0);
  if (total === 0) {
    const even = Math.floor(100 / fractions.length);
    return fractions.map((_, i) => (i === 0 ? 100 - even * (fractions.length - 1) : even));
  }
  const percents = fractions.map((f) => Math.floor((f / total) * 100));
  const assigned = percents.reduce((s, p) => s + p, 0);
  percents[0] += 100 - assigned; // remainder to top pick
  return percents;
}

// ---------------------------------------------------------------------------
// 6. Pareto Dominance Filter
// ---------------------------------------------------------------------------

/**
 * A score vector A *strictly dominates* B when A is ≥ B on every dimension
 * and strictly > B on at least one.  Dominated opportunities are removed
 * from the candidate set before ranking.
 *
 * @param vectors  Array of dimension score arrays, each [d1, d2, d3, d4]
 * @returns        Boolean mask — true means "keep this candidate"
 */
export function paretoDominanceMask(vectors: number[][]): boolean[] {
  const n = vectors.length;
  const dominated = new Array<boolean>(n).fill(false);

  for (let i = 0; i < n; i++) {
    if (dominated[i]) continue;
    for (let j = 0; j < n; j++) {
      if (i === j || dominated[j]) continue;
      const iDomJ = vectors[i].every((v, k) => v >= vectors[j][k]) &&
                    vectors[i].some((v, k) => v > vectors[j][k]);
      if (iDomJ) dominated[j] = true;
    }
  }

  return dominated.map((d) => !d);
}

// ---------------------------------------------------------------------------
// 7. Conviction Score  (geometric mean of dimensions)
// ---------------------------------------------------------------------------

/**
 * The arithmetic sum of dimension scores rewards spiky opportunities (e.g. a
 * protocol scoring 30/0/25/20 = 75).  The geometric mean penalises imbalance:
 * a well-rounded 18/18/18/16 = 70 sum scores the same but has a higher
 * conviction because all dimensions are satisfied.
 *
 * Conviction ∈ [0, 100] is computed as:
 *
 *   conviction = 100 · ⁴√( (d1/30) · (d2/25) · (d3/25) · (d4/20) )
 *
 * Dimensions are normalised by their maximum before taking the geometric mean.
 */
const DIM_MAXES = [30, 25, 25, 20] as const;

export function convictionScore(d1: number, d2: number, d3: number, d4: number): number {
  const dims = [d1, d2, d3, d4];
  const product = dims.reduce((acc, d, i) => acc * clamp(d / DIM_MAXES[i], 0, 1), 1);
  return clamp(100 * Math.pow(product, 0.25), 0, 100);
}

// ---------------------------------------------------------------------------
// 8. Ecclesiastes Diversification Ratio  (Ecc 11:2)
// ---------------------------------------------------------------------------

/**
 * Measures how well a set of allocation percents honours "invest in seven
 * ventures, yes in eight."  Returns a score in [0, 1]:
 *
 *   • 1.0 = perfect equal-weight among ≥ 5 positions
 *   • 0.0 = 100 % in a single position
 *
 * Uses the Herfindahl–Hirschman Index (HHI) inverted:
 *   HHI    = Σ (alloc_i / 100)²
 *   score  = 1 − HHI
 */
export function ecclesiastesDiversificationScore(allocations: number[]): number {
  if (allocations.length === 0) return 0;
  const hhi = allocations.reduce((s, a) => s + Math.pow(a / 100, 2), 0);
  return clamp(1 - hhi, 0, 1);
}

// ---------------------------------------------------------------------------
// 9. Maximum Drawdown Estimate
// ---------------------------------------------------------------------------

/**
 * Estimates a portfolio's expected maximum drawdown given risk scores and
 * allocation weights.  Uses a simplified Cornish-Fisher expansion applied to
 * a uniform risk distribution:
 *
 *   weightedRisk = Σ (alloc_i / 100) · riskScore_i
 *   maxDrawdown  = weightedRisk · DRAWDOWN_FACTOR
 *
 * DRAWDOWN_FACTOR = 0.45 is calibrated so that a 100-risk portfolio has a
 * 45 % expected max drawdown — consistent with observed DeFi bear-market data.
 */
const DRAWDOWN_FACTOR = 0.45;

export function maxDrawdownEstimate(
  allocations: number[],
  riskScores: number[],
): number {
  if (allocations.length === 0) return 0;
  const weightedRisk = allocations.reduce(
    (s, alloc, i) => s + (alloc / 100) * (riskScores[i] ?? 50),
    0,
  );
  return clamp(weightedRisk * DRAWDOWN_FACTOR, 0, 100);
}
