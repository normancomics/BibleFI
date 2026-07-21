// Hourly Superfluid stream verifier.
// Mirrors scripts/verify-superfluid-streams.sh checks against Base mainnet and
// writes a summary row (with deltas vs the previous run) to
// public.superfluid_monitor_runs. Failures are also appended to
// agent_ops.audit_log via the public.log_agent_operation security-definer fn.
//
// Triggers:
//   - pg_cron hourly with header `x-cron-secret: <rotating secret>` — validated
//     against public.cron_job_secrets (auto-rotated weekly by
//     rotate_cron_job_secret; previous secret honored during a grace window).
//     The legacy shared CRON_SECRET env value is still accepted as a fallback.
//   - Manual admin POST with a valid user JWT (admin role required)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

// Defaults — Base mainnet. Override via secrets when tokens are deployed.
const BASE_RPC = Deno.env.get('SUPERFLUID_BASE_RPC') ?? 'https://mainnet.base.org';
const CFAv1 = Deno.env.get('SUPERFLUID_CFAV1') ?? '0x19ba78B9cDB05A877718841c574325fdB53601bB';
const SUBGRAPH = Deno.env.get('SUPERFLUID_SUBGRAPH_URL')
  ?? 'https://base-mainnet.subgraph.x.superfluid.dev/';
const TREASURY = (Deno.env.get('SUPERFLUID_TREASURY') ?? '0x7bEda57074AA917FF0993fb329E16C2c188baF08').toLowerCase();
const BIBLEFI = (Deno.env.get('SUPERFLUID_BIBLEFI') ?? '').toLowerCase();
const WISDOM = (Deno.env.get('SUPERFLUID_WISDOM') ?? '').toLowerCase();
const RECEIVERS = (Deno.env.get('SUPERFLUID_RECEIVERS') ?? '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

const ZERO = '0x0000000000000000000000000000000000000000';

// ── Minimal eth_call helpers (no ethers needed) ────────────────────────────
async function rpcCall(to: string, data: string): Promise<string> {
  const r = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [{ to, data }, 'latest'] }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`RPC ${j.error.message}`);
  return j.result as string;
}

function pad32(hex: string): string {
  return hex.replace(/^0x/, '').toLowerCase().padStart(64, '0');
}
function encAddr(a: string): string { return pad32(a); }

// keccak4 selectors precomputed:
//   getNetFlow(address,address)            -> 0x5a4dd1e8
//   getFlow(address,address,address)       -> 0x671b3793
//   balanceOf(address)                     -> 0x70a08231
const SEL_NET_FLOW = '0x5a4dd1e8';
const SEL_GET_FLOW = '0x671b3793';

function parseInt256(hex: string): bigint {
  const clean = hex.replace(/^0x/, '').padStart(64, '0');
  const n = BigInt('0x' + clean);
  // two's complement
  return n >= (1n << 255n) ? n - (1n << 256n) : n;
}

async function getNetFlow(token: string, account: string): Promise<bigint> {
  const data = SEL_NET_FLOW + encAddr(token) + encAddr(account);
  const res = await rpcCall(CFAv1, data);
  return parseInt256(res);
}

async function getFlow(token: string, sender: string, receiver: string):
    Promise<{ ts: bigint; flowRate: bigint; deposit: bigint; owedDeposit: bigint }> {
  const data = SEL_GET_FLOW + encAddr(token) + encAddr(sender) + encAddr(receiver);
  const res = (await rpcCall(CFAv1, data)).replace(/^0x/, '');
  const w = (i: number) => '0x' + res.slice(i * 64, i * 64 + 64);
  return {
    ts:          BigInt(w(0)),
    flowRate:    parseInt256(w(1)),
    deposit:     BigInt(w(2)),
    owedDeposit: BigInt(w(3)),
  };
}

async function subgraphCount(token: string): Promise<number | null> {
  try {
    const r = await fetch(SUBGRAPH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($t:String!,$s:String!){accountTokenSnapshots(where:{account:$s,token:$t}){totalNumberOfActiveStreams totalOutflowRate}}`,
        variables: { t: token, s: TREASURY },
      }),
    });
    const j = await r.json();
    const n = j?.data?.accountTokenSnapshots?.[0]?.totalNumberOfActiveStreams;
    return n == null ? null : Number(n);
  } catch { return null; }
}

// ── Run ─────────────────────────────────────────────────────────────────────
type TokenSummary = {
  symbol: string; address: string;
  netFlow: string; activeStreams: number | null;
  receivers: { receiver: string; flowRate: string; ok: boolean; error?: string }[];
};

async function checkToken(symbol: string, address: string): Promise<TokenSummary> {
  const summary: TokenSummary = {
    symbol, address, netFlow: '0', activeStreams: null, receivers: [],
  };
  if (!address || address === ZERO) {
    summary.receivers = RECEIVERS.map(r => ({ receiver: r, flowRate: '0', ok: false, error: 'token not deployed' }));
    return summary;
  }
  try { summary.netFlow = (await getNetFlow(address, TREASURY)).toString(); }
  catch (e) { summary.netFlow = `err: ${(e as Error).message}`; }

  summary.activeStreams = await subgraphCount(address);

  for (const r of RECEIVERS) {
    try {
      const f = await getFlow(address, TREASURY, r);
      summary.receivers.push({
        receiver: r, flowRate: f.flowRate.toString(),
        ok: f.flowRate > 0n,
        error: f.flowRate > 0n ? undefined : 'flowRate=0',
      });
    } catch (e) {
      summary.receivers.push({ receiver: r, flowRate: '0', ok: false, error: (e as Error).message });
    }
  }
  return summary;
}

async function run(triggeredBy: string) {
  const t0 = Date.now();
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Fetch previous successful run for delta computation
  const { data: prevRows } = await admin
    .from('superfluid_monitor_runs')
    .select('tokens, created_at')
    .order('created_at', { ascending: false })
    .limit(1);
  const prev = prevRows?.[0]?.tokens as TokenSummary[] | undefined;

  const errors: string[] = [];
  let tokens: TokenSummary[] = [];
  try {
    tokens = await Promise.all([
      checkToken('BIBLEFI', BIBLEFI),
      checkToken('WISDOM',  WISDOM),
    ]);
  } catch (e) { errors.push((e as Error).message); }

  const allReceivers = tokens.flatMap(t => t.receivers.map(r => ({ token: t.symbol, ...r })));
  const receivers_ok = allReceivers.filter(r => r.ok).length;
  const receivers_failed = allReceivers.length - receivers_ok;

  // Deltas: net-flow change per token vs previous run
  const deltas: Record<string, { netFlowDelta: string; activeStreamsDelta: number | null }> = {};
  for (const t of tokens) {
    const p = prev?.find(x => x.symbol === t.symbol);
    let netDelta = '0';
    try {
      const cur = BigInt(t.netFlow.startsWith('err') ? '0' : t.netFlow);
      const old = BigInt(p?.netFlow && !p.netFlow.startsWith('err') ? p.netFlow : '0');
      netDelta = (cur - old).toString();
    } catch { /* ignore */ }
    const streamDelta = (t.activeStreams != null && p?.activeStreams != null)
      ? t.activeStreams - p.activeStreams : null;
    deltas[t.symbol] = { netFlowDelta: netDelta, activeStreamsDelta: streamDelta };
  }

  let status: 'success' | 'partial' | 'failed' | 'skipped' = 'success';
  if (!BIBLEFI && !WISDOM) status = 'skipped';
  else if (receivers_failed > 0 || errors.length) {
    status = receivers_ok > 0 ? 'partial' : 'failed';
  }

  const row = {
    status,
    env_name: 'prod',
    treasury: TREASURY,
    receivers_checked: allReceivers.length,
    receivers_ok,
    receivers_failed,
    tokens: tokens as unknown as Record<string, unknown>[],
    receivers: allReceivers as unknown as Record<string, unknown>[],
    deltas,
    errors,
    duration_ms: Date.now() - t0,
    triggered_by: triggeredBy,
  };

  const { data: inserted, error: insErr } = await admin
    .from('superfluid_monitor_runs').insert(row).select('id').single();
  if (insErr) throw new Error(`insert failed: ${insErr.message}`);

  // Audit-log failures into agent_ops
  if (status === 'failed' || status === 'partial') {
    try {
      await admin.rpc('log_agent_operation', {
        p_agent_name: 'superfluid-stream-monitor',
        p_operation: 'verify',
        p_target_table: 'superfluid_monitor_runs',
        p_target_schema: 'public',
        p_record_ids: [inserted.id],
        p_records_affected: 1,
        p_input_summary: { tokens: tokens.map(t => t.symbol), receivers: RECEIVERS.length },
        p_output_summary: { status, receivers_ok, receivers_failed },
        p_error_message: errors.join('; ') || `${receivers_failed} receivers without active flow`,
        p_execution_time_ms: Date.now() - t0,
      });
    } catch (e) { console.error('audit log failed', e); }
  }

  return { id: inserted.id, ...row };
}

// Validate the x-cron-secret header: rotating per-job secret first (checked
// against hashed values in public.cron_job_secrets, with grace window for the
// previous secret), then the legacy shared CRON_SECRET env value.
async function isAuthorizedCron(cronHeader: string | null): Promise<boolean> {
  if (!cronHeader) return false;
  if (CRON_SECRET && cronHeader === CRON_SECRET) return true;
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data, error } = await admin.rpc('validate_cron_job_secret', {
      p_job_name: 'superfluid-stream-monitor',
      p_secret: cronHeader,
    });
    if (error) {
      console.error('cron secret validation failed:', error.message);
      return false;
    }
    return data === true;
  } catch (e) {
    console.error('cron secret validation error:', e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Cron path: secret header bypasses JWT
  const isCron = await isAuthorizedCron(req.headers.get('x-cron-secret'));

  let triggeredBy = 'cron';
  if (!isCron) {
    // Require admin role for manual runs
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'auth required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin } = await sb.rpc('has_role',
      { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'admin only' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    triggeredBy = `manual:${user.id}`;
  }

  try {
    const result = await run(triggeredBy);
    return new Response(JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('monitor failed', e);
    return new Response(JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
