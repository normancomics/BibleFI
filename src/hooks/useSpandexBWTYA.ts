/**
 * useSpandexBWTYA – Combined Spandex + BWTYA + BWSP React hook
 *
 * Runs the full sandboxed advisory pipeline when `runAdvisory` is called:
 *   Spandex multi-provider quotes
 *     → BWTYA biblical scoring & strategy selection
 *     → BWSP scripture wisdom synthesis
 *
 * Returns the full SpandexSwapAdvisoryResult plus React-friendly state.
 */
import { useState, useCallback } from 'react';
import { spandexSwapAgent } from '@/services/spandex/agent';
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
        return result;
      } catch (err: any) {
        const msg = err?.message ?? 'Advisory pipeline failed';
        console.error('[useSpandexBWTYA]', msg);
        setError(msg);
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
