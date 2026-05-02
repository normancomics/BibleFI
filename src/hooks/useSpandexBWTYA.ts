/**
 * useSpandexBWTYA – Combined Spandex + BWTYA + BWSP React hook
 *
 * Runs the full sandboxed advisory pipeline when `runAdvisory` is called:
 *   Spandex multi-provider quotes
 *     → BWTYA biblical scoring & strategy selection
 *     → BWSP scripture wisdom synthesis
 *     → server-side persistence via the spandex-swap-agent edge function
 *
 * Returns the full SpandexSwapAdvisoryResult plus React-friendly state.
 */
import { useState, useCallback } from 'react';
import { spandexSwapAgent } from '@/services/spandex/agent';
import { supabase } from '@/integrations/supabase/client';
import type {
  SpandexSwapAdvisoryInput,
  SpandexSwapAdvisoryResult,
} from '@/services/spandex/types';

export interface UseSpandexBWTYAReturn {
  advisory: SpandexSwapAdvisoryResult | null;
  isLoading: boolean;
  error: string | null;
  runAdvisory: (input: SpandexSwapAdvisoryInput) => Promise<SpandexSwapAdvisoryResult | null>;
  reset: () => void;
}

/**
 * Fire-and-forget: forward the advisory results to the server-side
 * spandex-swap-agent edge function so they are persisted in Supabase.
 * Failures are swallowed — the client-side advisory already ran successfully.
 */
async function persistAdvisoryToServer(
  advisory: SpandexSwapAdvisoryResult,
  input: SpandexSwapAdvisoryInput,
): Promise<void> {
  try {
    const providerQuotes = advisory.scoredQuotes.map((sq) => ({
      provider: sq.raw.provider,
      outputAmount: sq.raw.outputAmount,
      outputAmountRaw: sq.raw.outputAmountRaw.toString(), // bigint → decimal string
    }));

    await supabase.functions.invoke('spandex-swap-agent', {
      body: {
        fromToken: input.fromToken,
        toToken: input.toToken,
        providerQuotes,
        wisdomScore: input.wisdomScore ?? 50,
        capitalUsd: input.capitalUsd ?? 0,
        swapperAccount: input.swapperAccount,
      },
    });
  } catch {
    // Server persistence is best-effort — never crash the UI
  }
}

export function useSpandexBWTYA(): UseSpandexBWTYAReturn {
  const [advisory, setAdvisory] = useState<SpandexSwapAdvisoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAdvisory = useCallback(
    async (input: SpandexSwapAdvisoryInput): Promise<SpandexSwapAdvisoryResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await spandexSwapAgent.run(input);
        setAdvisory(result);

        // Async server-side persistence (non-blocking)
        persistAdvisoryToServer(result, input);

        return result;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Advisory pipeline failed';
        const step = errMsg.includes('rate-limited') ? 'rate-limit' : 'pipeline';
        const userMsg = `[${step}] ${errMsg}`;
        console.error('[useSpandexBWTYA]', userMsg);
        setError(userMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setAdvisory(null);
    setError(null);
  }, []);

  return { advisory, isLoading, error, runAdvisory, reset };
}

