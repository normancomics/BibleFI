// Admin-only church directory diagnostics.
//
// Answers "why is the church count/list broken?" in one call by reporting:
//  - which access path works (api.public_church_directory view vs the
//    api.get_public_church_directory() SECURITY DEFINER function vs the base
//    table) and how many rows each returns
//  - effective grants (schema USAGE, view SELECT, function EXECUTE, base
//    table SELECT) for anon/authenticated, RLS state and policies
//  - a LIVE probe through PostgREST with the anon key — the exact error an
//    anonymous browser client would see (code/message/details/hint)
//  - the most recent client-reported failures from
//    public.church_directory_request_logs
//
// Auth: requires a valid user JWT with the admin role (has_role).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface ProbeResult {
  ok: boolean;
  row_count: number | null;
  duration_ms: number;
  error: { code?: string; message: string; details?: string; hint?: string } | null;
}

async function probe(run: () => PromiseLike<{ error: unknown; count?: number | null; data?: unknown }>): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const { error, count, data } = await run();
    if (error) {
      const e = error as { code?: string; message?: string; details?: string; hint?: string };
      return {
        ok: false, row_count: null, duration_ms: Date.now() - t0,
        error: { code: e.code, message: e.message ?? String(error), details: e.details, hint: e.hint },
      };
    }
    const rows = count ?? (Array.isArray(data) ? data.length : null);
    return { ok: true, row_count: rows, duration_ms: Date.now() - t0, error: null };
  } catch (e) {
    return {
      ok: false, row_count: null, duration_ms: Date.now() - t0,
      error: { message: (e as Error).message },
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // ── Admin auth ────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'auth required' }, 401);
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return json({ error: 'invalid token' }, 401);
  const { data: isAdmin } = await sb.rpc('has_role', { _user_id: user.id, _role: 'admin' });
  if (!isAdmin) return json({ error: 'admin only' }, 403);

  // ── Diagnostics ───────────────────────────────────────────────────────────
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const anonApi = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: 'api' } });

  const [dbDiag, liveView, liveRpc, recentFailures] = await Promise.all([
    admin.rpc('diagnose_church_directory'),
    // Exactly what the browser does: anon key, api schema, head count on the view.
    probe(() => anonApi.from('public_church_directory').select('id', { count: 'exact', head: true })),
    probe(() => anonApi.rpc('get_public_church_directory')),
    admin.from('church_directory_request_logs')
      .select('created_at, operation, path, error_code, error_message, error_details, error_hint, row_count, duration_ms, request_id')
      .eq('success', false)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const diag = dbDiag.data as Record<string, unknown> | null;
  const counts = (diag?.counts ?? {}) as Record<string, { rows?: number; error?: string }>;

  // Human-readable verdict on which path is serving traffic.
  let resolution: string;
  if (liveView.ok && (liveView.row_count ?? 0) > 0) {
    resolution = `healthy: anon view path returns ${liveView.row_count} rows`;
  } else if (liveView.ok) {
    resolution = 'view path reachable but returned 0 rows — check base table contents and the definer function output';
  } else if (liveRpc.ok) {
    resolution = `view path FAILING (${liveView.error?.code ?? 'unknown'}: ${liveView.error?.message}); RPC fallback works with ${liveRpc.row_count} rows — likely missing GRANT/USAGE on the view or api schema`;
  } else {
    resolution = `both anon paths FAILING — view: ${liveView.error?.message}; rpc: ${liveRpc.error?.message}. Check grants/RLS in the db_diagnostics section`;
  }

  return json({
    checked_by: user.id,
    resolution,
    live_anon_probes: {
      'api.public_church_directory (view, head count)': liveView,
      'api.get_public_church_directory (rpc)': liveRpc,
    },
    db_diagnostics: dbDiag.error
      ? { error: dbDiag.error.message }
      : diag,
    base_table_rows: counts.base_table?.rows ?? null,
    recent_client_failures: recentFailures.error
      ? { error: recentFailures.error.message }
      : recentFailures.data,
  });
});
