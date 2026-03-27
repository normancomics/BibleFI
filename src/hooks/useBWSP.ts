// useBWSP – React hook wiring BWSP → BWTYA in a single call

import { useCallback, useState } from 'react';
import { bwtyaAlgorithm } from '@/services/bwtya/algorithm';
import type { BWTYAResult, YieldOpportunity } from '@/services/bwtya/types';
import { bwspEngine } from '@/services/bwsp/engine';
import type { BWSPQuery, BWSPResponse } from '@/services/bwsp/types';

export interface UseBWSPState {
  bwspResponse: BWSPResponse | null;
  bwtyaResult: BWTYAResult | null;
  isLoading: boolean;
  error: string | null;
  lastQuery: string | null;
}

export interface UseBWSPActions {
  runWisdomQuery: (
    query: BWSPQuery | string,
    availableOpportunities?: YieldOpportunity[],
  ) => Promise<void>;
  reset: () => void;
}

const initialState: UseBWSPState = {
  bwspResponse: null,
  bwtyaResult: null,
  isLoading: false,
  error: null,
  lastQuery: null,
};

export function useBWSP(): UseBWSPState & UseBWSPActions {
  const [state, setState] = useState<UseBWSPState>(initialState);

  const runWisdomQuery = useCallback(
    async (
      queryInput: BWSPQuery | string,
      availableOpportunities?: YieldOpportunity[],
    ) => {
      const queryText = typeof queryInput === 'string' ? queryInput : queryInput.text;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        lastQuery: queryText,
      }));

      try {
        // Step 1: Run BWSP sovereign agent
        const bwspResponse = await bwspEngine.query(queryInput);

        // Step 2: Optionally run BWTYA if opportunities are provided
        let bwtyaResult: BWTYAResult | null = null;

        if (availableOpportunities && availableOpportunities.length > 0) {
          bwtyaResult = bwtyaAlgorithm.run({
            opportunities: availableOpportunities,
            wisdomScore: typeof queryInput !== 'string' ? (queryInput.wisdomScore ?? 0) : 0,
            capitalUsd: typeof queryInput !== 'string' ? (queryInput.availableCapital ?? 0) : 0,
            riskTolerance:
              typeof queryInput !== 'string' ? queryInput.riskTolerance : undefined,
          });
        }

        setState({
          bwspResponse,
          bwtyaResult,
          isLoading: false,
          error: null,
          lastQuery: queryText,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'An unexpected error occurred.',
        }));
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    runWisdomQuery,
    reset,
  };
}
