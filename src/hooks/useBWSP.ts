// useBWSP – React hook wiring BWSP → BWTYA in a single call
// Also persists each query to the bwsp_query_log table for analytics.

import { useCallback, useState } from 'react';
import { bwtyaAlgorithm } from '@/services/bwtya/algorithm';
import type { BWTYAResult, YieldOpportunity } from '@/services/bwtya/types';
import { bwspEngine } from '@/services/bwsp/engine';
import type { BWSPQuery, BWSPResponse } from '@/services/bwsp/types';
import { supabase } from '@/integrations/supabase/client';

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

/** Persist a completed BWSP query to the analytics log table (best-effort). */
async function logBwspQuery(
  query: BWSPQuery | string,
  response: BWSPResponse,
  bwtyaResult: BWTYAResult | null,
): Promise<void> {
  try {
    const q: BWSPQuery = typeof query === 'string' ? { text: query } : query;
    await supabase.from('bwsp_query_log').insert({
      wallet_address: q.walletAddress ?? null,
      query: q.text,
      intent: response.query.intent ?? 'general_wisdom',
      synthesis_method: response.synthesis.synthesisMethod,
      confidence_score: response.confidenceScore,
      processing_time_ms: response.processingTimeMs,
      primary_scripture_ref: response.primaryScripture.reference,
      bwtya_strategy_id: bwtyaResult?.recommendedStrategy.id ?? null,
      bwtya_projected_apy: bwtyaResult?.projectedApy ?? null,
      tithe_amount: bwtyaResult?.titheAmount ?? null,
    }).then(
      () => { /* logged */ },
      (err) => console.warn('[useBWSP] Query log failed silently:', err),
    );
  } catch {
    // Never let logging failure surface to the user
  }
}

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

        // Step 3: Persist to analytics log (fire-and-forget)
        logBwspQuery(queryInput, bwspResponse, bwtyaResult);
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
