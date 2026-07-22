// Church Directory Health endpoint
// GET → { status, count, pagination, checked_at }
// Authenticated mode: ?auth=1 requires a valid JWT with the `admin` role,
// returns masked sample fields only, and 401/403 otherwise.
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
    const authMode = ["1", "true", "yes"].includes((url.searchParams.get("auth") ?? "").toLowerCase());

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Authenticated mode: verify JWT + admin role BEFORE any data access.
    if (authMode) {
      const authHeader = req.headers.get("Authorization") ?? "";
      if (!authHeader.toLowerCase().startsWith("bearer ")) {
        return json({ status: "error", healthy: false, error: "Missing bearer token", checked_at: new Date().toISOString() }, 401);
      }
      const token = authHeader.slice(7).trim();
      const authClient = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
      const userId = claimsData?.claims?.sub;
      if (claimsError || !userId) {
        return json({ status: "error", healthy: false, error: "Invalid or expired token", checked_at: new Date().toISOString() }, 401);
      }
      // Role check via SECURITY DEFINER has_role — runs as the signed-in user.
      const { data: isAdmin, error: roleError } = await authClient.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (roleError) {
        return json({ status: "error", healthy: false, error: "Role lookup failed", checked_at: new Date().toISOString() }, 500);
      }
      if (!isAdmin) {
        return json({ status: "error", healthy: false, error: "Forbidden: admin role required", checked_at: new Date().toISOString() }, 403);
      }
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