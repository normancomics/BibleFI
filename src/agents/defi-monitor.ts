/**
 * defi-monitor.ts
 *
 * DeFi Monitor Agent – continuously polls live Base chain data via the
 * BWTYAAgent swarm and surfaces faith-aligned signals to the app.
 *
 * This module acts as the client-side entry point for the BWTYA swarm.
 * Call `defiMonitor()` to run a full agent cycle; use `startDefiMonitorLoop()`
 * to run it on a recurring interval.
 *
 * "Be thou diligent to know the state of thy flocks, and look well to thy herds."
 * — Proverbs 27:23
 */

import { bwtyaAgent } from './BWTYAAgent';
import type { BWTYAAgentResult } from './BWTYAAgent';

export type { BWTYAAgentResult };

let _monitorInterval: ReturnType<typeof setInterval> | null = null;
let _latestResult: BWTYAAgentResult | null = null;
const _listeners: Array<(result: BWTYAAgentResult) => void> = [];

/**
 * Subscribe to new DeFi monitor results.
 * Returns an unsubscribe function.
 */
export function onDefiMonitorResult(
  listener: (result: BWTYAAgentResult) => void,
): () => void {
  _listeners.push(listener);
  // Immediately emit the latest result if one exists
  if (_latestResult) listener(_latestResult);
  return () => {
    const idx = _listeners.indexOf(listener);
    if (idx !== -1) _listeners.splice(idx, 1);
  };
}

/**
 * Get the most recent monitor result without subscribing.
 */
export function getLatestDefiMonitorResult(): BWTYAAgentResult | null {
  return _latestResult;
}

/**
 * Run a single DeFi monitor cycle.
 * Executes the full BWTYA agent swarm and returns structured results.
 */
export const defiMonitor = async (
  wisdomScore = 0,
  capitalUsd = 0,
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive',
): Promise<BWTYAAgentResult> => {
  console.log('[DefiMonitor] BWTYA agent swarm starting…');

  const result = await bwtyaAgent.run(wisdomScore, capitalUsd, riskTolerance);

  _latestResult = result;
  _listeners.forEach((fn) => fn(result));

  console.log(
    `[DefiMonitor] Swarm completed in ${result.processingTimeMs}ms | ` +
      `FGI=${result.fearGreedIndex} | ` +
      `Strategy: ${result.bwtyaResult.recommendedStrategy.name} | ` +
      `Opportunities: ${result.bwtyaResult.scoredOpportunities.length}`,
  );

  return result;
};

/**
 * Start a recurring DeFi monitor loop.
 * @param intervalMs Polling interval in milliseconds (default: 5 minutes)
 * @param wisdomScore User wisdom score (0–100)
 * @param capitalUsd Available capital in USD
 */
export function startDefiMonitorLoop(
  intervalMs = 5 * 60 * 1000,
  wisdomScore = 0,
  capitalUsd = 0,
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive',
): void {
  if (_monitorInterval) {
    console.warn('[DefiMonitor] Loop already running – skipping duplicate start.');
    return;
  }

  // Run immediately on start
  defiMonitor(wisdomScore, capitalUsd, riskTolerance).catch((err) =>
    console.error('[DefiMonitor] Initial run error:', err),
  );

  _monitorInterval = setInterval(() => {
    defiMonitor(wisdomScore, capitalUsd, riskTolerance).catch((err) =>
      console.error('[DefiMonitor] Loop error:', err),
    );
  }, intervalMs);

  console.log(`[DefiMonitor] Loop started – polling every ${intervalMs / 1000}s`);
}

/**
 * Stop the recurring DeFi monitor loop.
 */
export function stopDefiMonitorLoop(): void {
  if (_monitorInterval) {
    clearInterval(_monitorInterval);
    _monitorInterval = null;
    console.log('[DefiMonitor] Loop stopped.');
  }
}