// Church Directory Health endpoint
// GET → { status, count, pagination, checked_at }
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false }, db: { schema: "api" } },
    );

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

    const body = {
      status: "ok",
      healthy: total > 0,
      count: total,
      pagination: {
        page,
        pageSize,
        totalPages,
        from,
        to: Math.min(to, Math.max(total - 1, 0)),
        returned: sample?.length ?? 0,
        hasMore: page < totalPages,
      },
      sample: sample ?? [],
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - started,
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        status: "error",
        healthy: false,
        error: message,
        checked_at: new Date().toISOString(),
        latency_ms: Date.now() - started,
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});