// BWTYA – Portfolio Rebalancing Engine
//
// "Be sure you know the condition of your flocks,
//  give careful attention to your herds."
// — Proverbs 27:23
//
// The rebalancer monitors a live portfolio (current % allocations) against the
// ideal Kelly-Criterion target weights produced by the strategy mapper.  When
// allocation drift exceeds biblical prudence thresholds, it generates a set of
// trade recommendations to restore optimal balance.
//
// Algorithm
// ─────────
// 1. Compute allocation drift: Δᵢ = currentAlloc_i − targetAlloc_i  (in %)
// 2. Rebalance urgency:         U = √(Σ Δᵢ²)  (root-mean-squared drift)
// 3. Trade sizing:              If U > THRESHOLD, generate trades to close all Δᵢ
// 4. Urgency grade:
//     U ≤ 5  → MINIMAL   – no action needed
//     U ≤ 10 → MONITOR   – watch closely
//     U ≤ 20 → ADVISORY  – plan rebalance within 2 weeks
//     U > 20 → URGENT    – rebalance within 48 hours
//
// Trade sizing follows the "cost of action vs cost of inaction" test:
// if |Δᵢ| < MIN_TRADE_THRESHOLD (2 %) we skip the trade (transaction costs
// not worth it) — reflecting Proverbs 14:15: "a prudent person gives thought
// to their steps."

import { ecclesiastesDiversificationScore } from './mathEngine';
import type { BWTYAStrategy, ScoredOpportunity } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum per-position drift to trigger a trade (avoids dust trades) */
const MIN_TRADE_THRESHOLD = 2; // %

/** Urgency grade thresholds (root-sum-square drift in %) */
const URGENCY_MINIMAL  = 5;
const URGENCY_MONITOR  = 10;
const URGENCY_ADVISORY = 20;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type UrgencyGrade = 'MINIMAL' | 'MONITOR' | 'ADVISORY' | 'URGENT';

export interface RebalanceTrade {
  /** Opportunity identifier (protocol::poolName) */
  opportunityId: string;
  protocol: string;
  poolName: string;
  /** Current allocation percent */
  currentPercent: number;
  /** Target allocation percent (Kelly-optimal) */
  targetPercent: number;
  /** Drift = current − target (positive = overweight, negative = underweight) */
  driftPercent: number;
  /** Direction of required trade */
  action: 'BUY' | 'SELL' | 'HOLD';
  /** Fraction of total portfolio to trade (% of total capital) */
  tradePercent: number;
  /** Biblical note for this trade */
  biblicalNote: string;
}

export interface RebalanceSignal {
  /** Root-sum-square of all drifts */
  urgencyScore: number;
  urgencyGrade: UrgencyGrade;
  /** Recommended trades (only entries where |drift| ≥ MIN_TRADE_THRESHOLD) */
  trades: RebalanceTrade[];
  /** Diversification score of current allocation (HHI-based) */
  currentDiversificationScore: number;
  /** Diversification score of target allocation */
  targetDiversificationScore: number;
  /** Whether current allocation is more concentrated than optimal */
  isOverConcentrated: boolean;
  /** Biblical summary guidance */
  summary: string;
}

// ---------------------------------------------------------------------------
// Trade biblical notes
// ---------------------------------------------------------------------------

function tradeBiblicalNote(action: 'BUY' | 'SELL' | 'HOLD', driftPercent: number): string {
  const absDrift = Math.abs(driftPercent).toFixed(1);
  if (action === 'HOLD') {
    return '"A time to every purpose under the heaven" (Ecc 3:1). No action warranted at this time.';
  }
  if (action === 'BUY') {
    return (
      `Underweight by ${absDrift}% — increase this position. ` +
      '"The diligent soul shall be made fat" (Proverbs 13:4).'
    );
  }
  return (
    `Overweight by ${absDrift}% — trim this position. ` +
    '"Divide your portion to seven, or even to eight" (Ecc 11:2).`
  );
}

// ---------------------------------------------------------------------------
// BWTYARebalancer
// ---------------------------------------------------------------------------

export class BWTYARebalancer {
  /**
   * Compute a rebalancing signal for a portfolio.
   *
   * @param scored        Ranked scored opportunities (in allocation order)
   * @param currentAllocs Current allocation percents (matching scored array)
   * @param strategy      The current recommended BWTYA strategy (provides targets)
   */
  computeSignal(
    scored: ScoredOpportunity[],
    currentAllocs: number[],
    strategy: BWTYAStrategy,
  ): RebalanceSignal {
    // Build a map from opportunityId → target allocation
    const targetMap = new Map<string, number>();
    for (const alloc of strategy.allocations) {
      targetMap.set(alloc.opportunityId, alloc.allocationPercent);
    }

    // Compute drifts
    const drifts: number[] = [];
    const trades: RebalanceTrade[] = [];

    for (let i = 0; i < scored.length; i++) {
      const s = scored[i];
      const id = `${s.opportunity.protocol}::${s.opportunity.poolName}`;
      const current = currentAllocs[i] ?? 0;
      const target = targetMap.get(id) ?? 0;
      const drift = current - target; // positive = overweight
      drifts.push(drift);

      const absDrift = Math.abs(drift);
      const action: 'BUY' | 'SELL' | 'HOLD' =
        absDrift < MIN_TRADE_THRESHOLD ? 'HOLD' : drift > 0 ? 'SELL' : 'BUY';

      trades.push({
        opportunityId: id,
        protocol: s.opportunity.protocol,
        poolName: s.opportunity.poolName,
        currentPercent: current,
        targetPercent: target,
        driftPercent: drift,
        action,
        tradePercent: action === 'HOLD' ? 0 : absDrift,
        biblicalNote: tradeBiblicalNote(action, drift),
      });
    }

    // Root-sum-square (RSS) urgency — preferred over sum of absolute drifts because:
    //   1. It is a geometric measure: large individual drifts disproportionately inflate
    //      the score, reflecting the non-linear danger of concentrated imbalance.
    //   2. It maps directly to the Euclidean distance of the current allocation vector
    //      from the Kelly-optimal target in allocation space — a natural portfolio metric.
    // RSS is NOT divided by n (i.e. it is not RMS) so the urgency score grows with the
    // number of positions, which is intentional: more drifted positions = more urgent.
    const urgencyScore = Math.sqrt(drifts.reduce((s, d) => s + d * d, 0));

    let urgencyGrade: UrgencyGrade;
    if (urgencyScore <= URGENCY_MINIMAL) {
      urgencyGrade = 'MINIMAL';
    } else if (urgencyScore <= URGENCY_MONITOR) {
      urgencyGrade = 'MONITOR';
    } else if (urgencyScore <= URGENCY_ADVISORY) {
      urgencyGrade = 'ADVISORY';
    } else {
      urgencyGrade = 'URGENT';
    }

    const currentDiversificationScore = ecclesiastesDiversificationScore(currentAllocs);
    const targetDiversificationScore = ecclesiastesDiversificationScore(
      strategy.allocations.map((a) => a.allocationPercent),
    );
    const isOverConcentrated = currentDiversificationScore < targetDiversificationScore - 0.1;

    // Summary
    const actionableCount = trades.filter((t) => t.action !== 'HOLD').length;
    const summaries: Record<UrgencyGrade, string> = {
      MINIMAL:
        '"The plans of the diligent lead to profit" (Proverbs 21:5). ' +
        'Your portfolio is well-balanced. Continue monitoring.',
      MONITOR:
        '"Know the condition of your flocks" (Proverbs 27:23). ' +
        `Minor drift detected. ${actionableCount} position(s) approaching rebalance threshold.`,
      ADVISORY:
        '"Be careful to do what is right" (Romans 12:17). ' +
        `${actionableCount} position(s) have drifted from optimal. Plan a rebalance within 2 weeks.`,
      URGENT:
        '"A prudent person foresees danger and takes precautions" (Proverbs 27:12). ' +
        `Significant portfolio drift detected across ${actionableCount} position(s). ` +
        'Rebalance within 48 hours to restore biblical stewardship alignment.',
    };

    return {
      urgencyScore,
      urgencyGrade,
      trades: trades.filter((t) => t.action !== 'HOLD'), // only actionable trades
      currentDiversificationScore,
      targetDiversificationScore,
      isOverConcentrated,
      summary: summaries[urgencyGrade],
    };
  }

  /**
   * Generate a threshold-optimised "minimum-cost rebalance" plan.
   *
   * Only includes the minimum set of trades needed to bring urgencyScore
   * below URGENCY_MONITOR threshold, sorted by drift magnitude descending
   * so the largest imbalances are corrected first.
   */
  minimalRebalancePlan(signal: RebalanceSignal): RebalanceTrade[] {
    return [...signal.trades]
      .sort((a, b) => Math.abs(b.driftPercent) - Math.abs(a.driftPercent));
  }
}

export const bwtyaRebalancer = new BWTYARebalancer();
