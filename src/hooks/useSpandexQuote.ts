/**
 * React hook wrapping @spandex/core for the BibleFi swap UI.
 * Uses the official spanDEX API pattern:
 *
 *   getQuote({ config, swap: { chainId, inputToken, outputToken, mode, inputAmount, slippageBps, swapperAccount }, strategy })
 *
 * Returns quote.provider and quote.simulation.outputAmount.
 */
import { useState, useCallback } from 'react';
import { spandexConfig, getQuote, getQuotes } from '@/config/spandex';
import type { Address } from 'viem';
import type { SuccessfulSimulatedQuote, SimulatedQuote } from '@spandex/core';

export interface SpandexQuoteResult {
  provider: string;
  outputAmount: string;
  outputAmountRaw: bigint;
  gasEstimate?: string;
  latencyMs?: number;
  priceImpact?: string;
}

export interface UseSpandexQuoteReturn {
  bestQuote: SpandexQuoteResult | null;
  allQuotes: SpandexQuoteResult[];
  isLoading: boolean;
  error: string | null;
  fetchQuote: (params: {
    inputToken: Address;
    outputToken: Address;
    inputAmount: bigint;
    slippageBps?: number;
    swapperAccount: Address;
    chainId?: number;
    /** Output token decimals — required for accurate display formatting. */
    outputDecimals?: number;
  }) => Promise<SpandexQuoteResult | null>;
}

function formatOutputAmount(raw: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 6);
  return `${whole}.${fracStr}`;
}

export function useSpandexQuote(defaultOutputDecimals: number = 18): UseSpandexQuoteReturn {
  const [bestQuote, setBestQuote] = useState<SpandexQuoteResult | null>(null);
  const [allQuotes, setAllQuotes] = useState<SpandexQuoteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async (params: {
    inputToken: Address;
    outputToken: Address;
    inputAmount: bigint;
    slippageBps?: number;
    swapperAccount: Address;
    chainId?: number;
    outputDecimals?: number;
  }): Promise<SpandexQuoteResult | null> => {
    setIsLoading(true);
    setError(null);
    setBestQuote(null);
    setAllQuotes([]);

    const decimals = params.outputDecimals ?? defaultOutputDecimals;

    const swapParams = {
      chainId: params.chainId ?? 8453, // Base
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      mode: 'exactIn' as const,
      inputAmount: params.inputAmount,
      slippageBps: params.slippageBps ?? 50,
      swapperAccount: params.swapperAccount,
    };

    try {
      // 1. Try getQuotes (all providers in parallel)
      const quotes: SimulatedQuote[] = await getQuotes({ config: spandexConfig, swap: swapParams });

      // Only successful simulations expose `simulation.outputAmount`.
      const successful = quotes.filter(
        (q): q is SuccessfulSimulatedQuote => q.simulation.success === true,
      );

      if (successful.length > 0) {
        const mapped: SpandexQuoteResult[] = successful.map((q) => {
          const outRaw = q.simulation.outputAmount;
          return {
            provider: String(q.provider),
            outputAmount: formatOutputAmount(outRaw, decimals),
            outputAmountRaw: outRaw,
            gasEstimate: q.simulation.gasUsed?.toString(),
            latencyMs: q.performance?.latency,
          };
        });

        mapped.sort((a, b) =>
          a.outputAmountRaw > b.outputAmountRaw ? -1 : a.outputAmountRaw < b.outputAmountRaw ? 1 : 0
        );

        setBestQuote(mapped[0]);
        setAllQuotes(mapped);
        return mapped[0];
      }

      // 2. Fallback: single best-price quote
      const single = await getQuote({
        config: spandexConfig,
        swap: swapParams,
        strategy: 'bestPrice',
      });

      if (!single) {
        setError('No providers returned a quote');
        return null;
      }

      // getQuote returns SuccessfulSimulatedQuote | null — simulation is guaranteed successful.
      const outputRaw = single.simulation.outputAmount;
      const result: SpandexQuoteResult = {
        provider: String(single.provider),
        outputAmount: formatOutputAmount(outputRaw, decimals),
        outputAmountRaw: outputRaw,
        gasEstimate: single.simulation.gasUsed?.toString(),
        latencyMs: single.performance?.latency,
      };

      setBestQuote(result);
      setAllQuotes([result]);
      return result;
    } catch (err: any) {
      console.error('[spanDEX] Quote error:', err);
      setError(err?.message ?? 'Failed to fetch quotes');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultOutputDecimals]);

  return { bestQuote, allQuotes, isLoading, error, fetchQuote };
}
