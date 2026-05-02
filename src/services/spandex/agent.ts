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
import type {
  SpandexRawQuote,
  SpandexScoredQuote,
  SpandexSwapAdvisoryInput,
  SpandexSwapAdvisoryResult,
} from './types';
import type { Address } from 'viem';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function formatOutputAmount(raw: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 6);
  return `${whole}.${fracStr}`;
}

async function fetchSpandexQuotes(
  input: SpandexSwapAdvisoryInput,
  outputDecimals: number,
): Promise<SpandexRawQuote[]> {
  const swapParams = {
    chainId: input.chainId ?? 8453,
    inputToken: input.fromTokenAddress as Address,
    outputToken: input.toTokenAddress as Address,
    mode: 'exactIn' as const,
    inputAmount: input.inputAmountRaw,
    slippageBps: input.slippageBps ?? 50,
    swapperAccount: input.swapperAccount as Address,
  };

  // Try all providers in parallel first
  try {
    const allQuotes = await getQuotes({ config: spandexConfig, swap: swapParams });
    if (allQuotes && allQuotes.length > 0) {
      return (allQuotes as Array<{ provider: string; simulation?: { outputAmount?: bigint }; outputAmount?: bigint }>).map((q) => {
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
  const outRaw: bigint = (single as any).simulation?.outputAmount ?? 0n;
  return [{
    provider: single.provider,
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

          return {
            raw,
            opportunity: opp,
            scored: scoredOpp,
            isBWTYARecommended: scoredOpp?.opportunity.protocol === bwtyaTopProvider,
            isBestPrice: raw.provider === bestPriceRaw?.provider,
          };
        });

        scoredQuotes.sort(
          (a, b) => (b.scored?.bwtyaScore ?? 0) - (a.scored?.bwtyaScore ?? 0),
        );

        const bwtyaRecommended =
          scoredQuotes.find((q) => q.isBWTYARecommended) ?? scoredQuotes[0] ?? null;
        const bestPrice =
          scoredQuotes.find((q) => q.isBestPrice) ?? scoredQuotes[0] ?? null;
        const alignedWithBestPrice =
          !!bwtyaRecommended &&
          !!bestPrice &&
          bwtyaRecommended.raw.provider === bestPrice.raw.provider;

        ctx.stats.processed += scored.length;

        // ----------------------------------------------------------------
        // Step 4 – BWSP wisdom synthesis
        // ----------------------------------------------------------------
        let bwspWisdom = null;
        try {
          const swapQuery = [
            `swap ${input.inputAmountHuman} ${input.fromToken} for ${input.toToken}`,
            `via ${bwtyaRecommended?.raw.provider ?? 'DEX aggregator'}`,
            'biblical stewardship yield defi action',
          ].join(' ');

          bwspWisdom = await bwspEngine.query({
            text: swapQuery,
            intent: 'defi_action',
            wisdomScore,
            availableCapital: input.capitalUsd,
            riskTolerance:
              wisdomScore >= 70 ? 'aggressive' : wisdomScore >= 30 ? 'moderate' : 'conservative',
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
          bwspWisdom,
          timestamp: startTimestamp,
        };
      },
    );

    const { _sandbox, ...rest } = wrapped as any;
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
