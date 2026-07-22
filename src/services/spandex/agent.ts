// SpandexSwapAgent – Orchestrator
//
// Runs the full Spandex → BWTYA → BWSP advisory pipeline inside the
// client-side sandbox, producing a unified SpandexSwapAdvisoryResult.
//
// Pipeline:
//   1. [SPANDEX]  Fetch multi-provider quotes (Fabric · Odos · KyberSwap · LI.FI)
//   2. [BRIDGE]   Convert each quote to a YieldOpportunity
//   3. [BWTYA]    Score + rank all opportunities; select best strategy
//   4. [BWSP]     Synthesise biblical wisdom for the specific swap
//   5. [SANDBOX]  Persist advisory + audit trail to Supabase
//
// "For by wise guidance you can wage your war, and in abundance of
//  counsellors there is victory." – Proverbs 24:6

import { getQuote, getQuotes } from '@spandex/core';
import { spandexConfig } from '@/config/spandex';
import { spandexQuotesToOpportunities } from './bridge';
import { withClientAgentSandbox } from './sandbox';
import { bwtyaScorer } from '@/services/bwtya/scorer';
import { bwtyaRanker } from '@/services/bwtya/ranker';
import { bwtyaStrategyMapper } from '@/services/bwtya/strategyMapper';
import { bwspEngine } from '@/services/bwsp/engine';
import { evaluateBiblicalRoutePolicy } from './policy';
import type {
  SpandexCompetitiveBenchmark,
  SpandexRawQuote,
  SpandexScoredQuote,
  SpandexSwapAdvisoryInput,
  SpandexSwapAdvisoryResult,
} from './types';
import type { Address } from 'viem';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
interface SpandexProviderQuote {
  provider: string;
  simulation?: { outputAmount?: bigint };
  outputAmount?: bigint;
}

function formatOutputAmount(raw: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 6);
  return `${whole}.${fracStr}`;
}

function computeCompetitiveBenchmark(
  bwtyaRecommended: SpandexScoredQuote | null,
  bestPrice: SpandexScoredQuote | null,
): SpandexCompetitiveBenchmark | null {
  if (!bwtyaRecommended || !bestPrice) return null;

  const bestRaw = Number(bestPrice.raw.outputAmountRaw);
  const chosenRaw = Number(bwtyaRecommended.raw.outputAmountRaw);
  const outputDeltaBps =
    bestRaw > 0 ? Math.round(((chosenRaw - bestRaw) / bestRaw) * 10_000) : 0;

  const stewardshipPremiumBps = outputDeltaBps < 0 ? Math.abs(outputDeltaBps) : 0;
  const priceCompetitiveness = Math.max(0, Math.min(100, 100 - Math.abs(outputDeltaBps) / 10));
  const competitivenessScore = Math.round(
    bwtyaRecommended.scored.bwtyaScore * 0.65 + priceCompetitiveness * 0.35,
  );

  const biblicalPolicyPass = bwtyaRecommended.biblicalPolicyPass;
  const verdict = !biblicalPolicyPass
    ? 'blocked'
    : competitivenessScore >= 80
      ? 'outperforming'
      : competitivenessScore >= 65
        ? 'competitive'
        : 'caution';

  const summary = biblicalPolicyPass
    ? outputDeltaBps >= 0
      ? `BWTYA route beats best-price by ${outputDeltaBps} bps while passing biblical policy checks.`
      : `BWTYA route trades ${Math.abs(outputDeltaBps)} bps of output for stronger stewardship and policy alignment.`
    : 'Top BWTYA route failed biblical policy checks; choose a compliant alternative.';

  return {
    benchmarkedAgainst: 'bankr.bot',
    bwtyaProvider: bwtyaRecommended.raw.provider,
    bestPriceProvider: bestPrice.raw.provider,
    outputDeltaBps,
    stewardshipPremiumBps,
    competitivenessScore,
    biblicalPolicyPass,
    verdict,
    summary,
  };
}

async function fetchSpandexQuotes(
  input: SpandexSwapAdvisoryInput,
  outputDecimals: number,
): Promise<SpandexRawQuote[]> {
  const effectiveSlippageBps = input.autonomousSabbath
    ? Math.min(input.slippageBps ?? 50, 30)
    : (input.slippageBps ?? 50);

  const swapParams = {
    chainId: input.chainId ?? 8453,
    inputToken: input.fromTokenAddress as Address,
    outputToken: input.toTokenAddress as Address,
    mode: 'exactIn' as const,
    inputAmount: input.inputAmountRaw,
    slippageBps: effectiveSlippageBps,
    swapperAccount: input.swapperAccount as Address,
  };

  // Try all providers in parallel first
  try {
    const allQuotes = await getQuotes({ config: spandexConfig, swap: swapParams });
    if (allQuotes && allQuotes.length > 0) {
      return (allQuotes as SpandexProviderQuote[]).map((q) => {
        const outRaw: bigint = q.simulation?.outputAmount ?? q.outputAmount ?? 0n;
        return {
          provider: q.provider,
          outputAmountRaw: outRaw,
          outputAmount: formatOutputAmount(outRaw, outputDecimals),
        } satisfies SpandexRawQuote;
      });
    }
  } catch {
    // Fall through to single-quote fallback
  }

  // Fallback: single best-price quote
  const single = await getQuote({
    config: spandexConfig,
    swap: swapParams,
    strategy: 'bestPrice',
  });

  if (!single) return [];
  const singleQuote = single as SpandexProviderQuote;
  const outRaw: bigint = singleQuote.simulation?.outputAmount ?? singleQuote.outputAmount ?? 0n;
  return [{
    provider: singleQuote.provider,
    outputAmountRaw: outRaw,
    outputAmount: formatOutputAmount(outRaw, outputDecimals),
  }];
}

// ---------------------------------------------------------------------------
// SpandexSwapAgent
// ---------------------------------------------------------------------------

export class SpandexSwapAgent {
  private readonly outputDecimals: number;

  constructor(outputDecimals = 6) {
    this.outputDecimals = outputDecimals;
  }

  async run(input: SpandexSwapAdvisoryInput): Promise<SpandexSwapAdvisoryResult> {
    // Capture rawQuotes at the outer scope so the sandbox wrapper can read it
    let capturedRawQuotes: SpandexRawQuote[] = [];

    const wrapped = await withClientAgentSandbox(
      { agentName: 'spandex-swap-agent', minIntervalMs: 3_000 },
      async (ctx) => {
        const startTimestamp = new Date().toISOString();

        // ----------------------------------------------------------------
        // Step 1 – Fetch Spandex provider quotes
        // ----------------------------------------------------------------
        let rawQuotes: SpandexRawQuote[] = [];
        try {
          rawQuotes = await fetchSpandexQuotes(input, this.outputDecimals);
          capturedRawQuotes = rawQuotes;
          ctx.stats.processed += rawQuotes.length;
        } catch (err) {
          console.warn('[SpandexSwapAgent] Quote fetch failed:', err);
        }

        // ----------------------------------------------------------------
        // Step 2 – Bridge: convert to YieldOpportunity objects
        // ----------------------------------------------------------------
        const opportunities = spandexQuotesToOpportunities(
          rawQuotes,
          input.fromToken,
          input.toToken,
        );

        // ----------------------------------------------------------------
        // Step 3 – BWTYA scoring pipeline
        // ----------------------------------------------------------------
        const scored = bwtyaScorer.scoreAll(opportunities);
        const ranked = bwtyaRanker.rank(scored);
        const wisdomScore = input.wisdomScore ?? 50;
        const strategies = bwtyaStrategyMapper.map(ranked, wisdomScore);
        const recommendedStrategy = bwtyaStrategyMapper.recommendBest(strategies, wisdomScore);

        const bestPriceRaw = rawQuotes.reduce<SpandexRawQuote | null>((best, q) => {
          if (!best) return q;
          return q.outputAmountRaw > best.outputAmountRaw ? q : best;
        }, null);

        const bwtyaTopProvider = ranked[0]?.opportunity.protocol ?? null;

        // Build a map from protocol name → ScoredOpportunity for reliable lookup
        const rankedByProtocol = new Map(
          ranked.map((r) => [r.opportunity.protocol, r]),
        );

        const scoredQuotes: SpandexScoredQuote[] = rawQuotes.map((raw, i) => {
          const opp = opportunities[i];
          const scoredOpp = (opp && rankedByProtocol.get(opp.protocol)) ?? ranked[0];
          const initialQuote: SpandexScoredQuote = {
            raw,
            opportunity: opp,
            scored: scoredOpp,
            isBWTYARecommended: scoredOpp?.opportunity.protocol === bwtyaTopProvider,
            isBestPrice: raw.provider === bestPriceRaw?.provider,
            biblicalPolicyPass: true,
            policyReasons: [],
          };
          const policyEval = evaluateBiblicalRoutePolicy(initialQuote);

          return {
            ...initialQuote,
            biblicalPolicyPass: policyEval.pass,
            policyReasons: policyEval.reasons,
          };
        });

        scoredQuotes.sort(
          (a, b) => (b.scored?.bwtyaScore ?? 0) - (a.scored?.bwtyaScore ?? 0),
        );

        const policyPassedQuotes = scoredQuotes.filter((q) => q.biblicalPolicyPass);
        const bwtyaRecommended =
          policyPassedQuotes.find((q) => q.isBWTYARecommended) ??
          policyPassedQuotes[0] ??
          scoredQuotes.find((q) => q.isBWTYARecommended) ??
          scoredQuotes[0] ??
          null;
        const bestPrice =
          scoredQuotes.find((q) => q.isBestPrice) ?? scoredQuotes[0] ?? null;
        const alignedWithBestPrice =
          !!bwtyaRecommended &&
          !!bestPrice &&
          bwtyaRecommended.raw.provider === bestPrice.raw.provider;
        const competitiveBenchmark = computeCompetitiveBenchmark(
          bwtyaRecommended,
          bestPrice,
        );

        ctx.stats.processed += scored.length;

        // ----------------------------------------------------------------
        // Step 4 – BWSP wisdom synthesis
        // ----------------------------------------------------------------
        let bwspWisdom = null;
        try {
          const swapQuery = [
            input.autonomousSabbath
              ? 'sabbath autonomous stewardship guidance'
              : null,
            `swap ${input.inputAmountHuman} ${input.fromToken} for ${input.toToken}`,
            `via ${bwtyaRecommended?.raw.provider ?? 'DEX aggregator'}`,
            'biblical stewardship yield defi action',
          ].filter(Boolean).join(' ');

          bwspWisdom = await bwspEngine.query({
            text: swapQuery,
            intent: 'defi_action',
            wisdomScore,
            availableCapital: input.capitalUsd,
            riskTolerance: input.autonomousSabbath
              ? 'conservative'
              : wisdomScore >= 70
                ? 'aggressive'
                : wisdomScore >= 30
                  ? 'moderate'
                  : 'conservative',
          });

          ctx.stats.created += 1;
        } catch (err) {
          console.warn('[SpandexSwapAgent] BWSP synthesis failed:', err);
        }

        return {
          scoredQuotes,
          bwtyaRecommended,
          bestPrice,
          alignedWithBestPrice,
          recommendedStrategy,
          competitiveBenchmark,
          bwspWisdom,
          autonomousExecution: input.autonomousSabbath
            ? {
              enabled: true,
              triggeredAt: startTimestamp,
              cadenceMinutes: 60,
            }
            : null,
          timestamp: startTimestamp,
        };
      },
    );

    const { _sandbox, ...rest } = wrapped;
    return {
      ...rest,
      sandbox: {
        agentName: _sandbox.agentName,
        runId: _sandbox.runId,
        durationMs: _sandbox.durationMs,
        providersEvaluated: capturedRawQuotes.length,
      },
    } as SpandexSwapAdvisoryResult;
  }
}

/** Singleton — import and call `.run(input)` anywhere in the app */
export const spandexSwapAgent = new SpandexSwapAgent();
