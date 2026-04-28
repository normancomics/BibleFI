/**
 * useBWTYASwarm – React hook for the full BWTYA agent swarm
 *
 * Provides components with real-time swarm state from:
 *  - BWTYAAgent (client-side swarm)
 *  - bwtya_opportunity_scores table (server-scored results)
 *
 * Usage:
 *   const { result, dbScores, loading, run } = useBWTYASwarm();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { bwtyaAgent } from '@/agents/BWTYAAgent';
import type { BWTYAAgentResult } from '@/agents/BWTYAAgent';

export interface DbOpportunityScore {
  id: string;
  protocol_name: string;
  pool_name: string;
  chain: string;
  apy: number;
  tvl_usd: number;
  bwtya_score: number;
  stewardship_grade: string;
  biblical_rationale: string;
  scored_at: string;
}

export interface UseBWTYASwarmState {
  result: BWTYAAgentResult | null;
  dbScores: DbOpportunityScore[];
  loading: boolean;
  error: string | null;
  lastRun: Date | null;
}

export interface UseBWTYASwarmActions {
  run: (wisdomScore?: number, capitalUsd?: number, riskTolerance?: 'conservative' | 'moderate' | 'aggressive') => Promise<void>;
  reset: () => void;
}

const initialState: UseBWTYASwarmState = {
  result: null,
  dbScores: [],
  loading: false,
  error: null,
  lastRun: null,
};

export function useBWTYASwarm(autoRun = false) {
  const [state, setState] = useState<UseBWTYASwarmState>(initialState);
  const mountedRef = useRef(true);

  // ------------------------------------------------------------------
  // Fetch latest scored opportunities from DB
  // ------------------------------------------------------------------
  const fetchDbScores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bwtya_opportunity_scores')
        .select('*')
        .order('bwtya_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data && mountedRef.current) {
        setState((prev) => ({ ...prev, dbScores: data as DbOpportunityScore[] }));
      }
    } catch {
      // Silently ignore – DB might not have scores yet
    }
  }, []);

  // ------------------------------------------------------------------
  // Run full swarm cycle
  // ------------------------------------------------------------------
  const run = useCallback(
    async (
      wisdomScore = 0,
      capitalUsd = 0,
      riskTolerance?: 'conservative' | 'moderate' | 'aggressive',
    ) => {
      if (!mountedRef.current) return;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await bwtyaAgent.run(wisdomScore, capitalUsd, riskTolerance);

        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            result,
            loading: false,
            lastRun: new Date(),
          }));
        }

        // Refresh DB scores in the background after a run
        fetchDbScores();
      } catch (err) {
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Swarm run failed',
          }));
        }
      }
    },
    [fetchDbScores],
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------
  useEffect(() => {
    mountedRef.current = true;

    // Always load DB scores on mount
    fetchDbScores();

    // Auto-run swarm if requested
    if (autoRun) {
      run();
    }

    // Real-time subscription to bwtya_opportunity_scores
    const channel = supabase
      .channel('bwtya-scores-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bwtya_opportunity_scores' },
        () => fetchDbScores(),
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchDbScores, run, autoRun]);

  return { ...state, run, reset };
}
