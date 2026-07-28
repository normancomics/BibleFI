// Church Directory Health endpoint.
//
// Auth is detected automatically from the Authorization header — no query
// flag needed (the legacy ?auth=1 flag is still honored: it *forces*
// authenticated mode, turning would-be public responses into 401s).
//
// Mode resolution:
//   - No bearer token, or the anon/publishable key as bearer (valid JWT with
//     no user `sub` claim)                      → PUBLIC mode
//   - Bearer user JWT, valid, admin role        → AUTHENTICATED (masked) mode
//   - Bearer user JWT, valid, no admin role     → 403
//   - Bearer token that fails verification      → 401
//   - ?auth=1 and no user JWT                   → 401
//
// Response contract (also documented in docs/CHURCH_DIRECTORY_HEALTH.md):
//
//   200 PUBLIC:
//     {
//       "status": "ok", "healthy": true, "mode": "public",
//       "count": 846,
//       "pagination": { "page": 1, "pageSize": 25, "totalPages": 34,
//                       "from": 0, "to": 24, "returned": 25, "hasMore": true },
//       "sample": [ { "id": "…", "name": "Grace Community Church",
//                     "city": "New York", "country": "United States",
//                     "denomination": "Baptist", "verified": false,
//                     "accepts_crypto": true } ],
//       "checked_at": "…", "latency_ms": 123
//     }
//
//   200 AUTHENTICATED (admin): same shape, but "mode": "authenticated" and
//     each sample row is masked — `name`/`city` are replaced by:
//       { "id": "…", "name_masked": "Gra*******************",
//         "city_masked": "Ne******", "country": "…", "denomination": "…",
//         "verified": false, "accepts_crypto": true }
//     (name keeps its first 3 chars, city its first 2; the rest become "*",
//     minimum 3 asterisks; null/empty values stay null)
//
//   401: { "status": "error", "healthy": false, "error": "Missing bearer token"
//          | "Invalid or expired token", "checked_at": "…" }
//   403: { "status": "error", "healthy": false,
//          "error": "Forbidden: admin role required", "checked_at": "…" }
//   503: { "status": "error", "healthy": false, "error": "<db error>", … }
//
// Query params: page (default 1), pageSize (default 25, max 100), auth
// (optional legacy flag: 1|true|yes forces authenticated mode).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const started = Date.now();
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "25", 10) || 25));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const forceAuth = ["1", "true", "yes"].includes((url.searchParams.get("auth") ?? "").toLowerCase());

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // ── Detect caller identity from the Authorization header ────────────────
    // A user session JWT carries a `sub` claim; the anon/publishable key is a
    // valid JWT without one, so it (or no header at all) selects public mode.
    const authHeader = req.headers.get("Authorization") ?? "";
    const hasBearer = authHeader.toLowerCase().startsWith("bearer ");
    let isAdmin = false;
    let authMode = false;

    if (hasBearer) {
      const token = authHeader.slice(7).trim();
      const authClient = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
      if (claimsError) {
        // The anon/publishable key is not a session token, so getClaims
        // rejects it — but it grants nothing beyond anonymous access anyway,
        // so it falls through to public mode (same as sending no header).
        if (token !== ANON_KEY && !isAnonApiKey(token)) {
          return json({ status: "error", healthy: false, error: "Invalid or expired token", checked_at: new Date().toISOString() }, 401);
        }
      }
      const userId = claimsData?.claims?.sub;
      if (userId) {
        // Signed-in caller: admin gets masked mode, everyone else is rejected.
        authMode = true;
        const { data: roleResult, error: roleError } = await authClient.rpc("has_role", { _user_id: userId, _role: "admin" });
        if (roleError) {
          return json({ status: "error", healthy: false, error: "Role lookup failed", checked_at: new Date().toISOString() }, 500);
        }
        isAdmin = roleResult === true;
        if (!isAdmin) {
          return json({ status: "error", healthy: false, error: "Forbidden: admin role required", checked_at: new Date().toISOString() }, 403);
        }
      }
    }

    // Legacy ?auth=1 flag: force authenticated mode — anonymous callers 401.
    if (forceAuth && !authMode) {
      const error = hasBearer ? "Invalid or expired token" : "Missing bearer token";
      return json({ status: "error", healthy: false, error, checked_at: new Date().toISOString() }, 401);
    }

    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: "api" },
    });

    const { count, error: countError } = await supabase
      .from("public_church_directory")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    const { data: sample, error: sampleError } = await supabase
      .from("public_church_directory")
      .select("id,name,city,country,denomination,verified,accepts_crypto")
      .range(from, to);

    if (sampleError) throw sampleError;

    const total = count ?? 0;
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

    const rows = sample ?? [];
    const shapedSample = authMode ? rows.map(maskRow) : rows;

    const body = {
      status: "ok",
      healthy: total > 0,
      mode: authMode ? "authenticated" : "public",
      count: total,
      pagination: {
        page,
        pageSize,
        totalPages,
        from,
        to: Math.min(to, Math.max(total - 1, 0)),
        returned: rows.length,
        hasMore: page < totalPages,
      },
      sample: shapedSample,
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - started,
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ status: "error", healthy: false, error: message, checked_at: new Date().toISOString(), latency_ms: Date.now() - started }, 503);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// True for API-key-style JWTs (role "anon"/"publishable", no user sub).
// Unverified decode is fine here: matching only downgrades the caller to
// public mode, identical to sending no Authorization header at all.
function isAnonApiKey(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !payload.sub && (payload.role === "anon" || payload.role === "publishable");
  } catch {
    return false;
  }
}

function maskText(v: unknown, keep = 2): string | null {
  if (typeof v !== "string" || v.length === 0) return null;
  const head = v.slice(0, Math.min(keep, v.length));
  return `${head}${"*".repeat(Math.max(3, v.length - keep))}`;
}

function maskRow(r: Record<string, unknown>): Record<string, unknown> {
  return {
    id: r.id,
    name_masked: maskText(r.name, 3),
    city_masked: maskText(r.city, 2),
    country: r.country,
    denomination: r.denomination,
    verified: r.verified,
    accepts_crypto: r.accepts_crypto,
  };
}
