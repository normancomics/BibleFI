/**
 * React hook wrapping @spandex/core for the BibleFi swap UI.
 * Fetches meta-aggregated quotes from multiple DEX providers in parallel.
 */
import { useState, useCallback } from 'react';
import { spandexConfig } from '@/config/spandex';
import { getQuote, getQuotes } from '@spandex/core';
import type { Address } from 'viem';

export interface SpandexQuoteResult {
  provider: string;
  outputAmount: string;
  outputAmountRaw: bigint;
  gasEstimate?: string;
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
    slippageBps: number;
    swapperAccount: Address;
    chainId?: number;
  }) => Promise<SpandexQuoteResult | null>;
}

function formatOutputAmount(raw: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 6);
  return `${whole}.${fracStr}`;
}

export function useSpandexQuote(outputDecimals: number = 18): UseSpandexQuoteReturn {
  const [bestQuote, setBestQuote] = useState<SpandexQuoteResult | null>(null);
  const [allQuotes, setAllQuotes] = useState<SpandexQuoteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async (params: {
    inputToken: Address;
    outputToken: Address;
    inputAmount: bigint;
    slippageBps: number;
    swapperAccount: Address;
    chainId?: number;
  }): Promise<SpandexQuoteResult | null> => {
    setIsLoading(true);
    setError(null);
    setBestQuote(null);
    setAllQuotes([]);

    try {
      // Fetch all quotes in parallel from every provider
      const quotes = await getQuotes({
        config: spandexConfig,
        swap: {
          chainId: params.chainId ?? 8453, // Base
          inputToken: params.inputToken,
          outputToken: params.outputToken,
          mode: 'exactIn',
          inputAmount: params.inputAmount,
          slippageBps: params.slippageBps,
          swapperAccount: params.swapperAccount,
        },
      });

      if (!quotes || quotes.length === 0) {
        // Fallback: try single best quote
        const single = await getQuote({
          config: spandexConfig,
          swap: {
            chainId: params.chainId ?? 8453,
            inputToken: params.inputToken,
            outputToken: params.outputToken,
            mode: 'exactIn',
            inputAmount: params.inputAmount,
            slippageBps: params.slippageBps,
            swapperAccount: params.swapperAccount,
          },
          strategy: 'bestPrice',
        });

        if (!single) {
          setError('No providers returned a quote');
          return null;
        }

        const outputRaw = (single as any).simulation?.outputAmount ?? (single as any).outputAmount ?? 0n;
        const result: SpandexQuoteResult = {
          provider: single.provider,
          outputAmount: formatOutputAmount(outputRaw, outputDecimals),
          outputAmountRaw: outputRaw,
        };

        setBestQuote(result);
        setAllQuotes([result]);
        return result;
      }

      const mapped: SpandexQuoteResult[] = quotes.map((q: any) => {
        const outRaw = q.simulation?.outputAmount ?? q.outputAmount ?? 0n;
        return {
          provider: q.provider,
          outputAmount: formatOutputAmount(outRaw, outputDecimals),
          outputAmountRaw: outRaw,
        };
      });

      // Sort by best output (highest first)
      mapped.sort((a, b) =>
        a.outputAmountRaw > b.outputAmountRaw ? -1 : a.outputAmountRaw < b.outputAmountRaw ? 1 : 0
      );

      const best = mapped[0];
      setBestQuote(best);
      setAllQuotes(mapped);
      return best;
    } catch (err: any) {
      console.error('[spanDEX] Quote error:', err);
      setError(err?.message ?? 'Failed to fetch quotes');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [outputDecimals]);

  return { bestQuote, allQuotes, isLoading, error, fetchQuote };
}
