// Spandex Client-Side Sandbox
//
// Mirrors the withAgentSandbox pattern from supabase/functions/_shared/agent-sandbox.ts
// but runs entirely in the browser.  Provides:
//   • Per-agent rate-limiting (prevents rapid-fire calls)
//   • Scoped execution context (agentName, runId, stats)
//   • Audit trail written to Supabase via the public client
//   • Graceful error capture mirroring the server-side sandbox lifecycle
//
// "The integrity of the upright guides them." – Proverbs 11:3

import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClientAgentContext {
  agentName: string;
  runId: string;
  startTime: number;
  stats: {
    processed: number;
    created: number;
    updated: number;
    failed: number;
  };
}

export interface ClientSandboxConfig {
  agentName: string;
  /** Minimum ms between runs (default 5 000 ms) */
  minIntervalMs?: number;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// In-memory rate-limit registry
// ---------------------------------------------------------------------------

const lastRunRegistry: Record<string, number> = {};

function checkRateLimit(agentName: string, minIntervalMs: number): void {
  const last = lastRunRegistry[agentName] ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < minIntervalMs) {
    throw new Error(
      `Agent ${agentName} rate-limited – please wait ${Math.ceil((minIntervalMs - elapsed) / 1000)}s`,
    );
  }
}

function recordRun(agentName: string): void {
  lastRunRegistry[agentName] = Date.now();
}

// ---------------------------------------------------------------------------
// Audit trail helpers (fire-and-forget; failures are swallowed)
// ---------------------------------------------------------------------------

async function writeAuditEntry(
  agentName: string,
  runId: string,
  status: 'started' | 'completed' | 'failed',
  stats: ClientAgentContext['stats'],
  error?: string,
): Promise<void> {
  try {
    await supabase.from('defi_knowledge_base').insert({
      topic: `agent_audit:${agentName}`,
      content: JSON.stringify({
        agentName,
        runId,
        status,
        stats,
        error: error ?? null,
        timestamp: new Date().toISOString(),
      }),
      source: 'spandex-client-agent',
      relevance_score: 0,
    });
  } catch {
    // Audit writes are best-effort and must never crash the agent
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Wrap a Spandex agent handler with the client-side sandbox lifecycle:
 *   init → rate-limit check → execute → audit → cleanup
 *
 * Usage:
 *   const result = await withClientAgentSandbox(
 *     { agentName: 'spandex-swap-agent' },
 *     async (ctx) => {
 *       // ... do work, mutate ctx.stats ...
 *       return { myResult: 42 };
 *     },
 *   );
 */
export async function withClientAgentSandbox<T extends Record<string, unknown>>(
  config: ClientSandboxConfig,
  handler: (ctx: ClientAgentContext) => Promise<T>,
): Promise<T & { _sandbox: ClientAgentContext['stats'] & { agentName: string; runId: string; durationMs: number } }> {
  const { agentName, minIntervalMs = 5_000, metadata = {} } = config;

  // Rate-limit guard
  checkRateLimit(agentName, minIntervalMs);
  recordRun(agentName);

  const runId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `${agentName}-${crypto.randomUUID()}`
      : `${agentName}-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  const ctx: ClientAgentContext = {
    agentName,
    runId,
    startTime: Date.now(),
    stats: { processed: 0, created: 0, updated: 0, failed: 0 },
  };

  console.log(`🔒 [ClientSandbox] ${agentName} started (run: ${runId})`, metadata);
  await writeAuditEntry(agentName, runId, 'started', ctx.stats);

  try {
    const result = await handler(ctx);
    const durationMs = Date.now() - ctx.startTime;

    await writeAuditEntry(agentName, runId, 'completed', ctx.stats);
    console.log(
      `✅ [ClientSandbox] ${agentName} completed in ${durationMs}ms | P:${ctx.stats.processed} C:${ctx.stats.created}`,
    );

    return {
      ...result,
      _sandbox: {
        agentName,
        runId,
        durationMs,
        ...ctx.stats,
      },
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    await writeAuditEntry(agentName, runId, 'failed', ctx.stats, errMsg);
    console.error(`🚫 [ClientSandbox] ${agentName} failed:`, errMsg);
    throw error;
  }
}
