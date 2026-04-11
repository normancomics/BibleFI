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
    slippageBps?: number;
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
    slippageBps?: number;
    swapperAccount: Address;
    chainId?: number;
  }): Promise<SpandexQuoteResult | null> => {
    setIsLoading(true);
    setError(null);
    setBestQuote(null);
    setAllQuotes([]);

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
      const quotes = await getQuotes({ config: spandexConfig, swap: swapParams });

      if (quotes && quotes.length > 0) {
        const mapped: SpandexQuoteResult[] = quotes.map((q: any) => {
          const outRaw: bigint = q.simulation?.outputAmount ?? q.outputAmount ?? 0n;
          return {
            provider: q.provider,
            outputAmount: formatOutputAmount(outRaw, outputDecimals),
            outputAmountRaw: outRaw,
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

      // Official API: quote.provider + quote.simulation.outputAmount
      const outputRaw: bigint = (single as any).simulation?.outputAmount ?? 0n;
      const result: SpandexQuoteResult = {
        provider: single.provider,
        outputAmount: formatOutputAmount(outputRaw, outputDecimals),
        outputAmountRaw: outputRaw,
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
  }, [outputDecimals]);

  return { bestQuote, allQuotes, isLoading, error, fetchQuote };
}
