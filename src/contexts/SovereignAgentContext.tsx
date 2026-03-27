// Sovereign Agent Context
// Makes BWSP/BWTYA framework available app-wide via React context

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { bwspEngine } from '@/services/bwsp/engine';
import { bwtyaAlgorithm } from '@/services/bwtya/algorithm';
import { bwtyaYieldOptimizer } from '@/services/bwtya/yieldOptimizer';
import { marketWisdomCorrelator } from '@/services/bwsp/marketWisdomCorrelator';

const AGENT_VERSION = 'BWSP-v1.0/BWTYA-v1.0';

interface SovereignAgentContextValue {
  bwspEngine: typeof bwspEngine;
  bwtyaAlgorithm: typeof bwtyaAlgorithm;
  bwtyaYieldOptimizer: typeof bwtyaYieldOptimizer;
  marketWisdomCorrelator: typeof marketWisdomCorrelator;
  isAgentReady: boolean;
  agentVersion: string;
  lastSync: Date | null;
  syncAgent: () => Promise<void>;
}

const SovereignAgentContext = createContext<SovereignAgentContextValue | undefined>(undefined);

interface SovereignAgentProviderProps {
  children: React.ReactNode;
}

export const SovereignAgentProvider: React.FC<SovereignAgentProviderProps> = ({ children }) => {
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const syncInProgress = useRef(false);

  const syncAgent = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    try {
      await bwspEngine.query({ text: 'system:health_check', intent: 'general_wisdom' });
      setIsAgentReady(true);
      setLastSync(new Date());
    } catch (err) {
      console.error('[SovereignAgentContext] syncAgent error', err);
      // Still mark as ready with offline fallback
      setIsAgentReady(true);
      setLastSync(new Date());
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  const value: SovereignAgentContextValue = {
    bwspEngine,
    bwtyaAlgorithm,
    bwtyaYieldOptimizer,
    marketWisdomCorrelator,
    isAgentReady,
    agentVersion: AGENT_VERSION,
    lastSync,
    syncAgent,
  };

  return (
    <SovereignAgentContext.Provider value={value}>
      {children}
    </SovereignAgentContext.Provider>
  );
};

export function useSovereignAgent(): SovereignAgentContextValue {
  const ctx = useContext(SovereignAgentContext);
  if (!ctx) {
    throw new Error('useSovereignAgent must be used inside <SovereignAgentProvider>');
  }
  return ctx;
}
