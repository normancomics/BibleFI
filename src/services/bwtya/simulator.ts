// BWTYA – Monte Carlo Yield Simulator
//
// "The heart of man plans his way, but the LORD establishes his steps."
// — Proverbs 16:9
//
// Rather than projecting a single-point APY estimate, the simulator draws N
// random scenarios from a log-normal return distribution calibrated to each
// opportunity's parameters.  The result is a full probability distribution of
// outcomes — honest about uncertainty in a way that single-number projections
// are not.
//
// Algorithm
// ─────────
// Log-normal model:  R ~ LogNormal(μ, σ²)
//   μ  = ln(apy/100 + 1) - σ²/2        (drift parameter)
//   σ  = impliedVolatility(riskScore)   (calibrated to on-chain risk)
//
// Each trial computes the 1-year portfolio value:  V = capital × exp(R)
// Statistics are taken over N_TRIALS samples using Box-Muller transform for
// Gaussian sampling (no external library required).
//
// Outputs (percentiles of terminal value, converted back to APY-equivalent)
// ─────────────────────────────────────────────────────────────────────────
//   P10  – 10th percentile APY  (bad scenario)
//   P25  – 25th percentile APY  (below-median scenario)
//   median – 50th percentile APY
//   P75  – 75th percentile APY  (above-median scenario)
//   P90  – 90th percentile APY  (good scenario)
//   expectedValue   – arithmetic mean APY across all trials
//   probabilityOfLoss  – fraction of trials where the position lost value
//   valueAtRisk95    – 5th-percentile loss (VaR at 95 % confidence)
//   conditionalVaR   – average loss in the worst 5 % of scenarios (CVaR/ES)
//
// All APY values are in percent (e.g. 12.5 = 12.5 %).

import { clamp } from './mathEngine';
import type { ScoredOpportunity } from './types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const N_TRIALS = 1_000; // number of Monte Carlo scenarios per opportunity

/**
 * Maps a 0–100 risk score to an annualised log-return volatility (σ).
 *
 * Calibration table (observed DeFi volatility approximations):
 *   risk 0   → σ ≈ 0.05   (stable-coin liquidity, essentially flat)
 *   risk 30  → σ ≈ 0.30   (established protocols like Aave/Compound)
 *   risk 60  → σ ≈ 0.65   (newer yield farms)
 *   risk 100 → σ ≈ 1.20   (high-risk experimental protocols)
 *
 * Linear interpolation:  σ(r) = 0.05 + r × 0.0115
 */
function impliedVolatility(riskScore: number): number {
  return 0.05 + clamp(riskScore, 0, 100) * 0.0115;
}

// ---------------------------------------------------------------------------
// Box-Muller transform – standard normal samples without external libs
// ---------------------------------------------------------------------------

/** Deterministic PRNG seeded per-call for reproducibility across calls with same seed */
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a pair of independent standard normal samples using Box-Muller.
 * Returns [z1, z2].
 */
function boxMuller(rand: () => number): [number, number] {
  const u1 = Math.max(1e-10, rand()); // avoid ln(0)
  const u2 = rand();
  const mag = Math.sqrt(-2 * Math.log(u1));
  const z1 = mag * Math.cos(2 * Math.PI * u2);
  const z2 = mag * Math.sin(2 * Math.PI * u2);
  return [z1, z2];
}

// ---------------------------------------------------------------------------
// Percentile helper
// ---------------------------------------------------------------------------

function percentile(sorted: number[], p: number): number {
  const idx = clamp(Math.floor(p * sorted.length), 0, sorted.length - 1);
  return sorted[idx];
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface MonteCarloResult {
  /** Input opportunity identifier */
  opportunityId: string;
  /** Number of trials run */
  trials: number;
  /** Implied annual volatility used (σ) */
  sigma: number;
  // Percentile APY outcomes (%)
  p10Apy: number;
  p25Apy: number;
  medianApy: number;
  p75Apy: number;
  p90Apy: number;
  /** Arithmetic mean APY across all trials */
  expectedValueApy: number;
  /** Fraction of trials where the position returned < 0 % (capital loss) */
  probabilityOfLoss: number;
  /** 5th-percentile APY loss (Value at Risk at 95 % confidence) */
  valueAtRisk95: number;
  /** Average APY in the worst 5 % of outcomes (Conditional VaR / Expected Shortfall) */
  conditionalVaR: number;
  /** Stewardship note derived from probabilityOfLoss */
  stewardshipNote: string;
}

// ---------------------------------------------------------------------------
// Core simulation
// ---------------------------------------------------------------------------

/**
 * Run a Monte Carlo simulation for a single scored opportunity.
 *
 * @param scored   The scored opportunity (uses apy, riskScore)
 * @param seed     Optional integer seed for reproducible results.
 *                 Defaults to a deterministic combination of apy×100 + riskScore×7 so that
 *                 the same opportunity always produces the same distribution when no seed is
 *                 provided — useful for SSR/hydration consistency and regression testing.
 *                 Pass an explicit seed (e.g. Date.now()) when you want a fresh sample each call.
 */
export function simulateOpportunity(
  scored: ScoredOpportunity,
  seed?: number,
): MonteCarloResult {
  const { opportunity } = scored;
  const apyFraction = opportunity.apy / 100; // e.g. 12 % → 0.12
  const sigma = impliedVolatility(opportunity.riskScore);

  // Log-normal drift: μ = ln(1 + apy) - σ²/2
  const mu = Math.log(1 + apyFraction) - 0.5 * sigma * sigma;

  const rng = mulberry32(seed ?? Math.round(opportunity.apy * 100 + opportunity.riskScore * 7));

  const returnsApy: number[] = [];
  let lossCount = 0;

  for (let i = 0; i < N_TRIALS; i += 2) {
    const [z1, z2] = boxMuller(rng);
    for (const z of [z1, z2]) {
      if (returnsApy.length >= N_TRIALS) break;
      // Log-normal return: V/V0 = exp(μ + σ·z)
      const terminalRatio = Math.exp(mu + sigma * z);
      const trialApy = (terminalRatio - 1) * 100;
      returnsApy.push(trialApy);
      if (trialApy < 0) lossCount++;
    }
  }

  returnsApy.sort((a, b) => a - b);

  const p10 = percentile(returnsApy, 0.10);
  const p25 = percentile(returnsApy, 0.25);
  const median = percentile(returnsApy, 0.50);
  const p75 = percentile(returnsApy, 0.75);
  const p90 = percentile(returnsApy, 0.90);
  const ev = returnsApy.reduce((s, r) => s + r, 0) / returnsApy.length;

  // VaR: 5th percentile loss
  const var95 = percentile(returnsApy, 0.05);

  // CVaR: average of all values below the VaR threshold
  const tail = returnsApy.filter((r) => r <= var95);
  const cvar = tail.length > 0 ? tail.reduce((s, r) => s + r, 0) / tail.length : var95;

  const pLoss = lossCount / returnsApy.length;

  // Stewardship note
  let stewardshipNote: string;
  if (pLoss < 0.05) {
    stewardshipNote =
      '"Store up choice food" (Proverbs 21:20). High confidence in capital preservation across scenarios.';
  } else if (pLoss < 0.20) {
    stewardshipNote =
      '"The prudent sees danger and hides" (Proverbs 27:12). Moderate risk — size position conservatively.';
  } else if (pLoss < 0.40) {
    stewardshipNote =
      '"Count the cost before building" (Luke 14:28). Significant loss probability — limit exposure.';
  } else {
    stewardshipNote =
      '"Do not be hasty to be rich" (Proverbs 28:20). High loss probability — not recommended for biblical stewardship.';
  }

  return {
    opportunityId: `${opportunity.protocol}::${opportunity.poolName}`,
    trials: returnsApy.length,
    sigma,
    p10Apy: p10,
    p25Apy: p25,
    medianApy: median,
    p75Apy: p75,
    p90Apy: p90,
    expectedValueApy: ev,
    probabilityOfLoss: pLoss,
    valueAtRisk95: var95,
    conditionalVaR: cvar,
    stewardshipNote,
  };
}

// ---------------------------------------------------------------------------
// Portfolio-level simulation
// ---------------------------------------------------------------------------

export interface PortfolioSimulationResult {
  /** Simulated results per opportunity (in ranked order) */
  perOpportunity: MonteCarloResult[];
  /** Weighted portfolio APY bands using the provided allocation percents */
  portfolioP10: number;
  portfolioP25: number;
  portfolioMedian: number;
  portfolioP75: number;
  portfolioP90: number;
  portfolioExpectedValue: number;
  portfolioProbabilityOfLoss: number;
  portfolioConditionalVaR: number;
}

/**
 * Simulate a full portfolio of scored opportunities.
 *
 * @param opportunities  Scored opportunities (in the order they'll be allocated)
 * @param allocations    Allocation percents matching opportunities array (sum should be 100)
 */
export function simulatePortfolio(
  opportunities: ScoredOpportunity[],
  allocations: number[],
): PortfolioSimulationResult {
  if (opportunities.length === 0) {
    return {
      perOpportunity: [],
      portfolioP10: 0, portfolioP25: 0, portfolioMedian: 0,
      portfolioP75: 0, portfolioP90: 0, portfolioExpectedValue: 0,
      portfolioProbabilityOfLoss: 0, portfolioConditionalVaR: 0,
    };
  }

  const perOpportunity = opportunities.map((o) => simulateOpportunity(o));

  // Compute weighted portfolio percentiles
  // We use a simple linear weighting of per-opportunity percentile bands
  // (not a full joint-distribution simulation — kept pure and fast).
  const totalAlloc = allocations.reduce((s, a) => s + a, 0) || 100;

  function weightedPercentile(field: keyof MonteCarloResult): number {
    return perOpportunity.reduce((s, r, i) => {
      const weight = (allocations[i] ?? 0) / totalAlloc;
      return s + (r[field] as number) * weight;
    }, 0);
  }

  const p10 = weightedPercentile('p10Apy');
  const p25 = weightedPercentile('p25Apy');
  const med = weightedPercentile('medianApy');
  const p75 = weightedPercentile('p75Apy');
  const p90 = weightedPercentile('p90Apy');
  const ev  = weightedPercentile('expectedValueApy');
  const cvar = weightedPercentile('conditionalVaR');

  // Portfolio probability of loss: weighted average (conservative approximation)
  const pLoss = weightedPercentile('probabilityOfLoss');

  return {
    perOpportunity,
    portfolioP10: p10,
    portfolioP25: p25,
    portfolioMedian: med,
    portfolioP75: p75,
    portfolioP90: p90,
    portfolioExpectedValue: ev,
    portfolioProbabilityOfLoss: pLoss,
    portfolioConditionalVaR: cvar,
  };
}

export const bwtyaSimulator = { simulateOpportunity, simulatePortfolio };
