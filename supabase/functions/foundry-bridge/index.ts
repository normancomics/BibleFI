// Foundry Bridge – Supabase Edge Function
// Connects BWSP/BWTYA to Palantir Foundry/AIP. Runs Ontology queries (including
// published AIP Logic functions) using an OAuth2 client-credentials app from the
// Foundry Developer Console. Inert until the FOUNDRY_* secrets are set.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth, checkRateLimit, rateLimitResponse, errorResponse } from "../_shared/auth.ts";

const FOUNDRY_URL = (Deno.env.get("FOUNDRY_URL") ?? "").replace(/\/+$/, "");
const CLIENT_ID = Deno.env.get("FOUNDRY_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("FOUNDRY_CLIENT_SECRET") ?? "";
const ONTOLOGY = Deno.env.get("FOUNDRY_ONTOLOGY") ?? "";
const SCOPE = Deno.env.get("FOUNDRY_SCOPE") ?? ""; // optional, space-separated
// Only these query API names may be called (comma-separated). Empty = none.
const ALLOWED = new Set(
  (Deno.env.get("FOUNDRY_ALLOWED_QUERIES") ?? "").split(",").map((q) => q.trim()).filter(Boolean),
);

const configured = Boolean(FOUNDRY_URL && CLIENT_ID && CLIENT_SECRET && ONTOLOGY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Cached service token (refreshed one minute before expiry)
let token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt - 60_000) return token.value;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  if (SCOPE) body.set("scope", SCOPE);
  const res = await fetch(`${FOUNDRY_URL}/multipass/api/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Foundry token request failed (${res.status})`);
  const data = await res.json() as { access_token: string; expires_in?: number };
  token = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return token.value;
}

async function executeQuery(queryApiName: string, parameters: Record<string, unknown>) {
  const url = `${FOUNDRY_URL}/api/v2/ontologies/${encodeURIComponent(ONTOLOGY)}` +
    `/queries/${encodeURIComponent(queryApiName)}/execute`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${await getToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ parameters }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Surface Foundry's error name only — never echo tokens or raw upstream bodies
    const name = (payload as { errorName?: string }).errorName ?? "UpstreamError";
    throw new Error(`Foundry query failed (${res.status} ${name})`);
  }
  return (payload as { value?: unknown }).value ?? payload;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let userId: string;
  try {
    const { user } = await requireAuth(req);
    userId = user.id;
  } catch {
    return errorResponse("Authentication required", 401, corsHeaders);
  }

  // GET → status only (no Foundry call)
  if (req.method === "GET") {
    return json({ configured, allowedQueries: [...ALLOWED] });
  }
  if (req.method !== "POST") return errorResponse("Method not allowed", 405, corsHeaders);

  const rl = checkRateLimit(`foundry:${userId}`, 10, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt, corsHeaders);

  if (!configured) {
    return json({ ok: false, configured: false, error: "Foundry is not configured yet" }, 503);
  }

  try {
    const { query, parameters = {} } = await req.json() as {
      query?: string;
      parameters?: Record<string, unknown>;
    };
    if (!query || !ALLOWED.has(query)) return errorResponse("Query not allowed", 403, corsHeaders);
    if (typeof parameters !== "object" || Array.isArray(parameters)) {
      return errorResponse("parameters must be an object", 400, corsHeaders);
    }
    const value = await executeQuery(query, parameters);
    return json({ ok: true, query, value });
  } catch (e) {
    console.error("foundry-bridge", e instanceof Error ? e.message : e);
    return errorResponse(e instanceof Error ? e.message : "Foundry bridge error", 502, corsHeaders);
  }
});
