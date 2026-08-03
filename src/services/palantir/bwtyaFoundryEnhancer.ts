// BWTYA Foundry Enhancer
//
// Augments the deterministic BWTYA scoring pipeline with Palantir AIP
// ML-based scoring.
//
// Enhancement layers
// ──────────────────
// 1. ML SCORE FUSION
//    The Foundry BWTYAScoreBatch action runs a gradient-boosted model
//    trained on historical Base chain yield data.  Its output is fused
//    with the deterministic BWTYA score:
//
//      fusedScore = α·mlScore + (1-α)·bwtyaScore
//
//    where α = ML_WEIGHT (default 0.30, tuned to preserve the biblical
//    math anchors while letting ML detect real-world regime signals).
//
// 2. MARKET REGIME LABELS
//    The AIP action returns a market regime label per opportunity
//    ('bull' | 'bear' | 'sideways').  Regime adjustments:
//      bull    → +5% to fruitBearingScore (normalised)
//      bear    → Joseph's Reserve flag; reduce kellyWeight by 30%
//      sideways → no adjustment
//
// 3. ANOMALY FLAGS
//    AIP-detected anomalies (sudden TVL drop, APY spike, rug-pull
//    pattern) are appended to the warningFlags array.
//
// 4. PORTFOLIO NARRATIVE
//    The AIP action returns a human-readable portfolio insight string
//    that is attached to the BWTYAResult for UI display.
//
// 5. ECCLESIASTES REGIME REBALANCE
//    In a bear market, BWTYA automatically invokes Joseph's Reserve
//    logic — capping total deployment to 80 % and routing 20 % to
//    stable yield (stablecoin LP / lending).

import type { BWTYAInput, BWTYAResult, ScoredOpportunity } from '../bwtya/types';
import { clamp } from '../bwtya/mathEngine';
import { FoundryError, getFoundryClient } from './foundryClient';

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

/** Foundry AIP ML score weight in the fused score (0 = ignore ML, 1 = full ML) */
const ML_WEIGHT = 0.30;

/** Minimum AIP confidence before ML score is applied */
const MIN_ML_CONFIDENCE = 0.60;

/** Kelly fraction reduction in bear-market regime */
const BEAR_KELLY_REDUCTION = 0.30;

/** APY boost for bull-market opportunities (added to fruit-bearing score fraction) */
const BULL_FRUIT_BOOST = 0.05;

type MarketRegime = 'bull' | 'bear' | 'sideways';

// ────────────────────────────────────────────────────────────────────────────
// BWTYAFoundryEnhancer
// ────────────────────────────────────────────────────────────────────────────

export class BWTYAFoundryEnhancer {
  /**
   * Enhance a BWTYAResult with Foundry AIP ML scoring and market regime signals.
   *
   * Returns an enriched BWTYAResult with:
   * - Fused BWTYA + ML scores on each ScoredOpportunity
   * - Market regime labels and anomaly flags
   * - AIP-generated portfolio narrative attached to recommendedStrategy
   * - Joseph's Reserve activation in bear regimes
   *
   * Falls back silently to the original result on any Foundry error.
   */
  async enhance(result: BWTYAResult, input: BWTYAInput): Promise<BWTYAResult & { portfolioNarrative?: string }> {
    if (result.scoredOpportunities.length === 0) return result;

    try {
      const client = getFoundryClient();

      // ── Step 1: Call BWTYAScoreBatch AIP action ───────────────────────────
      const aipResult = await client.bwtyaScoreBatch({
        opportunities: input.opportunities.map((o) => ({
          protocol:   o.protocol,
          poolName:   o.poolName,
          chain:      o.chain,
          apy:        o.apy,
          tvlUsd:     o.tvlUsd,
          riskScore:  o.riskScore,
          audited:    !!o.audited,
          isVerified: !!o.isVerified,
        })),
        wisdomScore: input.wisdomScore,
        capitalUsd:  input.capitalUsd,
      });

      // ── Step 2: Build ML score lookup ─────────────────────────────────────
      type MlEntry = {
        mlEnhancedScore: number;
        mlConfidence: number;
        anomalyFlags: string[];
        marketRegimeLabel: string;
      };
      const mlByKey = new Map<string, MlEntry>();
      for (const ml of aipResult.mlScores) {
        mlByKey.set(`${ml.protocol}:${ml.poolName}`, ml);
      }

      // ── Step 3: Detect dominant market regime across all opportunities ─────
      const regimeCounts: Record<MarketRegime, number> = { bull: 0, bear: 0, sideways: 0 };
      for (const ml of aipResult.mlScores) {
        const r = (ml.marketRegimeLabel as MarketRegime) || 'sideways';
        regimeCounts[r] = (regimeCounts[r] ?? 0) + 1;
      }
      const dominantRegime = (Object.entries(regimeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'sideways') as MarketRegime;

      // ── Step 4: Apply ML fusion to each scored opportunity ────────────────
      const enhanced = result.scoredOpportunities.map((scored): ScoredOpportunity => {
        const key = `${scored.opportunity.protocol}:${scored.opportunity.poolName}`;
        const ml  = mlByKey.get(key);

        if (!ml || ml.mlConfidence < MIN_ML_CONFIDENCE) {
          // ML confidence too low — keep deterministic score, append regime flag if present
          return this._applyRegimeAdjustment(scored, dominantRegime, []);
        }

        // Fuse scores
        const fusedBwtya = clamp(
          ML_WEIGHT * ml.mlEnhancedScore + (1 - ML_WEIGHT) * scored.bwtyaScore,
          0, 100,
        );

        // Fused conviction (geometric mean with ML as extra dimension)
        const fusedConviction = clamp(
          Math.pow(scored.convictionScore / 100 * ml.mlEnhancedScore / 100, 0.5) * 100,
          0, 100,
        );

        const adjustedScored: ScoredOpportunity = {
          ...scored,
          bwtyaScore:     fusedBwtya,
          convictionScore: fusedConviction,
          warningFlags:   [...scored.warningFlags, ...ml.anomalyFlags],
        };

        return this._applyRegimeAdjustment(adjustedScored, ml.marketRegimeLabel as MarketRegime, ml.anomalyFlags);
      });

      // ── Step 5: Re-sort by fused score ────────────────────────────────────
      enhanced.sort((a, b) => b.bwtyaScore - a.bwtyaScore);

      // ── Step 6: Apply Joseph's Reserve in bear market ─────────────────────
      let enhancedResult: BWTYAResult & { portfolioNarrative?: string } = {
        ...result,
        scoredOpportunities: enhanced,
        portfolioNarrative:  aipResult.portfolioInsight,
      };

      if (dominantRegime === 'bear') {
        enhancedResult = this._applyJosephsReserve(enhancedResult);
      }

      return enhancedResult;
    } catch (err) {
      if (err instanceof FoundryError) {
        console.warn('[BWTYA Foundry] Enhancement unavailable, using deterministic result:', err.message);
        return result;
      }
      throw err;
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _applyRegimeAdjustment(
    scored: ScoredOpportunity,
    regime: MarketRegime,
    anomalyFlags: string[],
  ): ScoredOpportunity {
    const flags = [...scored.warningFlags];

    if (regime === 'bear') {
      // Reduce Kelly allocation — "in the seven years of famine, store up" (Gen 41)
      const reducedKelly = clamp(scored.kellyWeight * (1 - BEAR_KELLY_REDUCTION), 0, 0.35);
      if (!flags.some((f) => f.includes('Bear'))) {
        flags.push('🐻 Bear market regime — Kelly allocation reduced (Genesis 41: Joseph\'s Reserve)');
      }
      return { ...scored, kellyWeight: reducedKelly, warningFlags: flags };
    }

    if (regime === 'bull') {
      // Modest fruit-bearing boost for well-scored opportunities in bull market
      const boostedFruit = clamp(scored.fruitBearingScore * (1 + BULL_FRUIT_BOOST), 0, 30);
      return { ...scored, fruitBearingScore: boostedFruit, warningFlags: flags };
    }

    return { ...scored, warningFlags: flags };
  }

  /**
   * Joseph's Reserve (Genesis 41): in bear markets, cap total deployable
   * capital to 80 % and route the remaining 20 % to stable yield.
   *
   * This mirrors the BWTYAYieldVault.sol on-chain mechanism so that
   * the off-chain algorithm and on-chain contract stay in sync.
   */
  private _applyJosephsReserve(
    result: BWTYAResult & { portfolioNarrative?: string },
  ): BWTYAResult & { portfolioNarrative?: string } {
    const RESERVE_PCT = 20;  // 20 % held in Joseph's Reserve
    const DEPLOY_PCT  = 80;

    const strategy = result.recommendedStrategy;
    if (!strategy) return result;

    // Scale all allocations by the deployable fraction
    const scaledAllocations = strategy.allocations.map((a) => ({
      ...a,
      allocationPercent: a.allocationPercent * (DEPLOY_PCT / 100),
    }));

    const josephReserveAlloc = {
      opportunityId: 'joseph-reserve-stable',
      protocol: 'Joseph\'s Reserve',
      poolName: 'Stablecoin Safety Reserve',
      allocationPercent: RESERVE_PCT,
      projectedApy: 4.5,  // conservative stable yield estimate
      projectedYieldAfterTithe: 4.5 * 0.9,
      stewardshipGrade: 'A' as const,
    };

    return {
      ...result,
      recommendedStrategy: {
        ...strategy,
        allocations: [...scaledAllocations, josephReserveAlloc],
        description: `${strategy.description} [Joseph's Reserve active: 20% held in stable yield — Genesis 41]`,
      },
      portfolioNarrative: [
        result.portfolioNarrative,
        '🏛️ Joseph\'s Reserve activated: 20% of capital held in stable yield position. "Store up in the seven good years for the seven lean years." — Genesis 41:35-36',
      ].filter(Boolean).join('\n\n'),
    };
  }
}

export const bwtyaFoundryEnhancer = new BWTYAFoundryEnhancer();
