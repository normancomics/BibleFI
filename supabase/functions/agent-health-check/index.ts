/**
 * Agent Health Check – Supabase Edge Function
 *
 * Pings every sovereign agent and sub-agent in the BibleFi MCP network,
 * collecting health status, response time, and last-run metadata.
 *
 * Auth: x-cron-secret header OR service-role Bearer token (via requireAgentAuth)
 *
 * GET / POST – returns a health report for every registered agent.
 *
 * "Every purpose is established by counsel: and with good advice make war."
 * – Proverbs 20:18
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { requireAgentAuth, unauthorizedResponse } from '../_shared/agent-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// ---------------------------------------------------------------------------
// Agent registry – every sovereign + sub-agent that should be reachable
// ---------------------------------------------------------------------------

interface AgentDescriptor {
  name: string;
  functionName: string;
  type: 'sovereign' | 'sub-agent' | 'swarm';
  parent?: string;
  description: string;
  schedule: string;
  /** Optional probe body to send when pinging the function */
  probeBody?: Record<string, unknown>;
}

const AGENT_REGISTRY: AgentDescriptor[] = [
  // ── Sovereign Agents ────────────────────────────────────────────────────
  {
    name: 'BWSP Sovereign Agent',
    functionName: 'bwsp-sovereign-agent',
    type: 'sovereign',
    description: 'Master orchestrator for Biblical Wisdom Synthesis Protocol',
    schedule: 'Always on',
    probeBody: {
      query: 'health check',
      intent: 'general_wisdom',
    },
  },
  {
    name: 'Church Seeder Sovereign',
    functionName: 'church-seeder-agent',
    type: 'sovereign',
    description: 'Global church database discovery and seeding',
    schedule: 'Hourly (6 staggered jobs)',
    probeBody: { mode: 'status' },
  },
  // ── Sub-Agents ──────────────────────────────────────────────────────────
  {
    name: 'Scripture Integrity Validator',
    functionName: 'scripture-integrity-validator',
    type: 'sub-agent',
    parent: 'BWSP Sovereign Agent',
    description: 'Validates KJV text accuracy with Hebrew/Greek/Aramaic originals',
    schedule: 'Daily',
    probeBody: { mode: 'status' },
  },
  {
    name: 'Knowledge Base Sync',
    functionName: 'sync-knowledge-base',
    type: 'sub-agent',
    parent: 'BWSP Sovereign Agent',
    description: 'Syncs biblical knowledge base and DeFi cross-references',
    schedule: 'Daily',
    probeBody: { mode: 'status' },
  },
  {
    name: 'Biblical Advisor (LLM)',
    functionName: 'biblical-advisor',
    type: 'sub-agent',
    parent: 'BWSP Sovereign Agent',
    description: 'RAG-powered guidance via LLM',
    schedule: 'On demand',
    probeBody: { query: 'health check', intent: 'general_wisdom' },
  },
  {
    name: 'Church Data Validator',
    functionName: 'church-data-validator',
    type: 'sub-agent',
    parent: 'Church Seeder Sovereign',
    description: 'Verifies seeded church data accuracy',
    schedule: 'Hourly',
    probeBody: { mode: 'status' },
  },
  {
    name: 'DeFi Opportunity Scanner',
    functionName: 'defi-opportunity-scanner',
    type: 'sub-agent',
    parent: 'BWTYA Sovereign Agent',
    description: 'Scans Base Chain DeFi protocols for yield opportunities',
    schedule: 'Every 30 min',
    probeBody: { mode: 'status' },
  },
  {
    name: 'Spandex Swap Agent',
    functionName: 'spandex-swap-agent',
    type: 'sub-agent',
    parent: 'BWTYA Sovereign Agent',
    description: 'BWTYA-scored DEX aggregator advisory pipeline',
    schedule: 'On demand',
  },
  // ── Additional Sub-Agents ───────────────────────────────────────────────
  {
    name: 'Market Wisdom Correlator',
    functionName: 'market-wisdom-correlator',
    type: 'sub-agent',
    parent: 'BWTYA Sovereign Agent',
    description: 'Cross-references market signals with Biblical wisdom',
    schedule: 'Every 15 min',
    probeBody: { mode: 'status' },
  },
  {
    name: 'DeFi Market Watchdog',
    functionName: 'defi-market-watchdog',
    type: 'sub-agent',
    parent: 'BWTYA Sovereign Agent',
    description: 'Continuous DeFi risk and opportunity monitoring',
    schedule: 'Every 5 min',
    probeBody: { mode: 'status' },
  },
  {
    name: 'Biblical Wisdom Aggregator',
    functionName: 'biblical-wisdom-aggregator',
    type: 'sub-agent',
    parent: 'BWSP Sovereign Agent',
    description: 'Aggregates and enriches biblical financial wisdom',
    schedule: 'Daily',
    probeBody: { mode: 'status' },
  },
  {
    name: 'Scripture Financial Scanner',
    functionName: 'scripture-financial-scanner',
    type: 'sub-agent',
    parent: 'BWSP Sovereign Agent',
    description: 'Scans scriptures for financial principles',
    schedule: 'Daily',
    probeBody: { mode: 'status' },
  },
];

// ---------------------------------------------------------------------------
// Probe a single agent function
// ---------------------------------------------------------------------------

interface AgentHealthResult {
  name: string;
  functionName: string;
  type: string;
  parent?: string;
  description: string;
  schedule: string;
  status: 'healthy' | 'degraded' | 'unreachable';
  responseTimeMs: number;
  httpStatus: number | null;
  error: string | null;
  checkedAt: string;
  lastRunInfo?: Record<string, unknown>;
}

async function probeAgent(
  agent: AgentDescriptor,
  supabaseUrl: string,
  serviceKey: string,
): Promise<AgentHealthResult> {
  const checkedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const url = `${supabaseUrl}/functions/v1/${agent.functionName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(agent.probeBody ?? { mode: 'status' }),
      signal: AbortSignal.timeout(15_000),
    });

    const responseTimeMs = Date.now() - start;
    const httpStatus = res.status;

    let lastRunInfo: Record<string, unknown> | undefined;
    try {
      const body = await res.json();
      if (body && typeof body === 'object') {
        lastRunInfo = body as Record<string, unknown>;
      }
    } catch {
      // ignore parse errors – the agent may return non-JSON
    }

    const status =
      httpStatus >= 200 && httpStatus < 300
        ? 'healthy'
        : httpStatus >= 400 && httpStatus < 500
        ? 'degraded'
        : 'unreachable';

    return {
      name: agent.name,
      functionName: agent.functionName,
      type: agent.type,
      parent: agent.parent,
      description: agent.description,
      schedule: agent.schedule,
      status,
      responseTimeMs,
      httpStatus,
      error: null,
      checkedAt,
      lastRunInfo,
    };
  } catch (err) {
    return {
      name: agent.name,
      functionName: agent.functionName,
      type: agent.type,
      parent: agent.parent,
      description: agent.description,
      schedule: agent.schedule,
      status: 'unreachable',
      responseTimeMs: Date.now() - start,
      httpStatus: null,
      error: err instanceof Error ? err.message : String(err),
      checkedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// Fetch last-run stats from Supabase for additional context
// ---------------------------------------------------------------------------

async function fetchAgentRunStats(
  supabaseUrl: string,
  serviceKey: string,
): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_agent_stats`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (res.ok) return await res.json();
  } catch {
    // ignore – stats are optional context
  }
  return {};
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth guard
  const auth = await requireAgentAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error ?? 'Unauthorized', corsHeaders);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Parse optional body for targeted checks
  let targetAgents: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.agents)) targetAgents = body.agents;
  } catch {
    // no body or invalid JSON – probe all agents
  }

  const registry =
    targetAgents.length > 0
      ? AGENT_REGISTRY.filter((a) => targetAgents.includes(a.functionName))
      : AGENT_REGISTRY;

  // Probe all agents in parallel (with individual 15s timeouts)
  const results = await Promise.all(
    registry.map((agent) => probeAgent(agent, supabaseUrl, serviceKey)),
  );

  // Fetch aggregate run stats
  const runStats = await fetchAgentRunStats(supabaseUrl, serviceKey);

  const healthy = results.filter((r) => r.status === 'healthy').length;
  const degraded = results.filter((r) => r.status === 'degraded').length;
  const unreachable = results.filter((r) => r.status === 'unreachable').length;

  const overallStatus =
    unreachable === results.length
      ? 'critical'
      : unreachable > 0 || degraded > 0
      ? 'degraded'
      : 'healthy';

  return new Response(
    JSON.stringify({
      success: true,
      checkedAt: new Date().toISOString(),
      overallStatus,
      summary: {
        total: results.length,
        healthy,
        degraded,
        unreachable,
      },
      agents: results,
      runStats,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});
