// Scheduled security probe. Runs every 6h via pg_cron.
// Records HIGH severity findings only (per admin config).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");

type Severity = "low" | "medium" | "high" | "critical";
interface ProbeResult {
  probe: string;
  endpoint: string;
  status: "pass" | "fail" | "error";
  severity: Severity;
  title: string;
  evidence: Record<string, unknown>;
}

const PII_KEYS = ["phone", "email", "pastor_name", "assistance_contact", "crypto_address"];

async function probeChurchSearchPII(): Promise<ProbeResult> {
  const url = `${SUPABASE_URL}/functions/v1/church-search`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ location: "New York" }),
    });
    const body = await res.json().catch(() => ({}));
    const churches = Array.isArray(body?.churches) ? body.churches : [];
    const leaked = churches.flatMap((c: Record<string, unknown>) =>
      PII_KEYS.filter((k) => c[k] != null && c[k] !== "")
    );
    if (leaked.length > 0) {
      return {
        probe: "church_search_phone_pii",
        endpoint: "POST /functions/v1/church-search",
        status: "fail",
        severity: "high",
        title: "church-search response leaks PII fields",
        evidence: { leaked_fields: [...new Set(leaked)], sample_count: churches.length },
      };
    }
    return { probe: "church_search_phone_pii", endpoint: "POST /functions/v1/church-search", status: "pass", severity: "low", title: "OK", evidence: { sample_count: churches.length } };
  } catch (e) {
    return { probe: "church_search_phone_pii", endpoint: "POST /functions/v1/church-search", status: "error", severity: "low", title: "Probe error", evidence: { error: (e as Error).message } };
  }
}

async function probeInjection(fnName: string, badBody: unknown): Promise<ProbeResult> {
  const url = `${SUPABASE_URL}/functions/v1/${fnName}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify(badBody),
    });
    // Expect a 4xx rejection for malformed wallet input.
    if (res.status >= 400 && res.status < 500) {
      return { probe: "url_param_injection_apis", endpoint: `POST /functions/v1/${fnName}`, status: "pass", severity: "low", title: "OK", evidence: { http_status: res.status } };
    }
    return {
      probe: "url_param_injection_apis",
      endpoint: `POST /functions/v1/${fnName}`,
      status: "fail",
      severity: "high",
      title: `${fnName} accepted malformed wallet_address (missing validation)`,
      evidence: { http_status: res.status, sent: badBody },
    };
  } catch (e) {
    return { probe: "url_param_injection_apis", endpoint: `POST /functions/v1/${fnName}`, status: "error", severity: "low", title: "Probe error", evidence: { error: (e as Error).message } };
  }
}

async function probeGlobalChurchesRLS(): Promise<ProbeResult> {
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await anon
    .from("global_churches")
    .select("id,email,phone,pastor_name,crypto_address")
    .limit(1);
  if (error) {
    return { probe: "global_churches_public_pii_exposure", endpoint: "GET global_churches", status: "pass", severity: "low", title: "OK (anon SELECT blocked)", evidence: { error: error.message } };
  }
  const row = data?.[0] ?? {};
  const leaked = PII_KEYS.filter((k) => (row as Record<string, unknown>)[k] != null);
  if (leaked.length > 0) {
    return {
      probe: "global_churches_public_pii_exposure",
      endpoint: "GET global_churches",
      status: "fail",
      severity: "high",
      title: "Anon can read PII columns on global_churches",
      evidence: { leaked_fields: leaked },
    };
  }
  return { probe: "global_churches_public_pii_exposure", endpoint: "GET global_churches", status: "pass", severity: "low", title: "OK", evidence: {} };
}

async function probeAnonWrite(table: string, row: Record<string, unknown>, probeId: string): Promise<ProbeResult> {
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { error } = await anon.from(table).insert(row);
  if (error) {
    return { probe: probeId, endpoint: `INSERT ${table}`, status: "pass", severity: "low", title: "OK (anon INSERT blocked)", evidence: { error: error.message } };
  }
  return {
    probe: probeId,
    endpoint: `INSERT ${table}`,
    status: "fail",
    severity: "critical",
    title: `Anonymous INSERT succeeded on ${table}`,
    evidence: { row },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth: allow cron (CRON_SECRET) or an authenticated admin.
  const authHeader = req.headers.get("authorization") || "";
  const providedCron = req.headers.get("x-cron-secret");
  let authorized = CRON_SECRET != null && providedCron === CRON_SECRET;
  if (!authorized && authHeader.startsWith("Bearer ")) {
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (user) {
      const { data: isAdmin } = await authClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
      authorized = !!isAdmin;
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: run, error: runErr } = await admin
    .from("security_monitor_runs")
    .insert({ status: "running" })
    .select()
    .single();
  if (runErr || !run) {
    return new Response(JSON.stringify({ error: runErr?.message ?? "run_insert_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const probes: ProbeResult[] = await Promise.all([
    probeChurchSearchPII(),
    probeInjection("talent-score", { wallet_address: "0xNOT_HEX'; DROP--" }),
    probeInjection("basescan-history", { address: "not-an-address" }),
    probeGlobalChurchesRLS(),
    probeAnonWrite("superfluid_streams", {
      user_id: "00000000-0000-0000-0000-000000000000",
      sender: "0x0000000000000000000000000000000000000000",
      receiver: "0x0000000000000000000000000000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      flow_rate: "1",
    }, "superfluid_streams_public_write"),
    probeAnonWrite("church_reviews", {
      user_id: "00000000-0000-0000-0000-000000000000",
      church_id: "00000000-0000-0000-0000-000000000000",
      rating: 5,
      review_text: "probe",
    }, "church_reviews_public_insert"),
  ]);

  const highFindings = probes.filter((p) => p.status === "fail" && (p.severity === "high" || p.severity === "critical"));

  if (highFindings.length > 0) {
    await admin.from("security_monitor_findings").insert(
      highFindings.map((p) => ({
        run_id: run.id,
        probe: p.probe,
        endpoint: p.endpoint,
        severity: p.severity,
        status: p.status,
        title: p.title,
        evidence: p.evidence,
      }))
    );
  }

  const passed = probes.filter((p) => p.status === "pass").length;
  const failed = probes.filter((p) => p.status === "fail").length;
  await admin
    .from("security_monitor_runs")
    .update({
      ended_at: new Date().toISOString(),
      status: "completed",
      probes_run: probes.length,
      probes_passed: passed,
      probes_failed: failed,
      high_severity_count: highFindings.length,
    })
    .eq("id", run.id);

  return new Response(
    JSON.stringify({ run_id: run.id, probes: probes.length, passed, failed, high_severity_count: highFindings.length, findings: highFindings }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});