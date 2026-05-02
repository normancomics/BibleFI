/**
 * agentSwarmOrchestrator.ts
 *
 * Client-side orchestrator for the full BWSP + BWTYA agent swarm.
 *
 * This service coordinates:
 *  - BWSPSovereignAgent  (RAG + MCP wisdom synthesis)
 *  - BWTYAAgent swarm    (market scanner, whale tracker, arbitrage, DCA)
 *  - Server-side swarm   (bwtya-swarm-orchestrator edge function)
 *
 * Results are merged into a single SwarmResult and surfaced to the UI layer
 * via subscription callbacks.
 *
 * "Two are better than one, because they have a good return for their labour."
 * — Ecclesiastes 4:9
 */

import { bwspEngine } from '@/services/bwsp/engine';
import type { BWSPQuery, BWSPResponse } from '@/services/bwsp/types';
import { supabase } from '@/integrations/supabase/client';
import { bwtyaAgent } from './BWTYAAgent';
import type { BWTYAAgentResult } from './BWTYAAgent';

// ---------------------------------------------------------------------------
// Swarm result type
// ---------------------------------------------------------------------------

export interface SwarmResult {
  bwspResponse: BWSPResponse | null;
  bwtyaAgentResult: BWTYAAgentResult | null;
  serverSwarmResult: Record<string, unknown> | null;
  errors: string[];
  processingTimeMs: number;
  timestamp: string;
}

export type SwarmListener = (result: SwarmResult) => void;

// ---------------------------------------------------------------------------
// Orchestrator state
// ---------------------------------------------------------------------------

let _latestSwarmResult: SwarmResult | null = null;
const _swarmListeners: SwarmListener[] = [];
let _swarmLoopInterval: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// Subscription helpers
// ---------------------------------------------------------------------------

/**
 * Subscribe to swarm results. Returns an unsubscribe function.
 */
export function onSwarmResult(listener: SwarmListener): () => void {
  _swarmListeners.push(listener);
  if (_latestSwarmResult) listener(_latestSwarmResult);
  return () => {
    const idx = _swarmListeners.indexOf(listener);
    if (idx !== -1) _swarmListeners.splice(idx, 1);
  };
}

export function getLatestSwarmResult(): SwarmResult | null {
  return _latestSwarmResult;
}

// ---------------------------------------------------------------------------
// Server-side swarm trigger (bwtya-swarm-orchestrator edge function)
// ---------------------------------------------------------------------------

async function triggerServerSwarm(): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase.functions.invoke('bwtya-swarm-orchestrator', {
      body: { mode: 'full_scan' },
    });
    if (error) throw error;
    return data as Record<string, unknown>;
  } catch (err) {
    console.warn('[SwarmOrchestrator] Server swarm unavailable:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main orchestration entry point
// ---------------------------------------------------------------------------

/**
 * runSwarm() fires all agent layers in the most efficient order:
 *  - BWTYA agent swarm and server-side swarm run in parallel
 *  - BWSP runs with contextual wisdom query
 *
 * All failures are isolated — a failing agent never blocks others.
 */
export async function runSwarm(
  query?: BWSPQuery | string,
  wisdomScore = 0,
  capitalUsd = 0,
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive',
): Promise<SwarmResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  // ------------------------------------------------------------------
  // Phase 1: BWTYA agent swarm + server swarm in parallel
  // ------------------------------------------------------------------
  const [bwtyaAgentResult, serverSwarmResult] = await Promise.all([
    bwtyaAgent.run(wisdomScore, capitalUsd, riskTolerance).catch((err) => {
      errors.push(`BWTYAAgent: ${String(err)}`);
      return null;
    }),
    triggerServerSwarm().catch((err) => {
      errors.push(`ServerSwarm: ${String(err)}`);
      return null;
    }),
  ]);

  // ------------------------------------------------------------------
  // Phase 2: BWSP sovereign agent (can use BWTYA context)
  // ------------------------------------------------------------------
  let bwspResponse: BWSPResponse | null = null;
  if (query) {
    bwspResponse = await bwspEngine.query(query).catch((err) => {
      errors.push(`BWSPEngine: ${String(err)}`);
      return null;
    });
  }

  const result: SwarmResult = {
    bwspResponse,
    bwtyaAgentResult,
    serverSwarmResult,
    errors,
    processingTimeMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };

  _latestSwarmResult = result;
  _swarmListeners.forEach((fn) => fn(result));

  console.log(
    `[SwarmOrchestrator] Cycle complete in ${result.processingTimeMs}ms | ` +
      `Errors: ${errors.length} | ` +
      `Strategy: ${bwtyaAgentResult?.bwtyaResult.recommendedStrategy.name ?? 'N/A'}`,
  );

  return result;
}

// ---------------------------------------------------------------------------
// Continuous swarm loop
// ---------------------------------------------------------------------------

/**
 * Start a recurring swarm cycle.
 * @param intervalMs Polling interval (default: 10 minutes)
 */
export function startSwarmLoop(
  intervalMs = 10 * 60 * 1000,
  wisdomScore = 0,
  capitalUsd = 0,
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive',
): void {
  if (_swarmLoopInterval) {
    console.warn('[SwarmOrchestrator] Loop already running.');
    return;
  }

  // Run immediately
  runSwarm(undefined, wisdomScore, capitalUsd, riskTolerance).catch((err) =>
    console.error('[SwarmOrchestrator] Initial run error:', err),
  );

  _swarmLoopInterval = setInterval(() => {
    runSwarm(undefined, wisdomScore, capitalUsd, riskTolerance).catch((err) =>
      console.error('[SwarmOrchestrator] Loop error:', err),
    );
  }, intervalMs);

  console.log(`[SwarmOrchestrator] Swarm loop started — cycling every ${intervalMs / 1000}s`);
}

/**
 * Stop the swarm loop.
 */
export function stopSwarmLoop(): void {
  if (_swarmLoopInterval) {
    clearInterval(_swarmLoopInterval);
    _swarmLoopInterval = null;
    console.log('[SwarmOrchestrator] Swarm loop stopped.');
  }
}
