/**
 * Shared abuse-protection helpers for BibleFi MCP tools.
 *
 * Rate limiting: DB-backed fixed window via public.check_mcp_rate_limit
 * (service-role only, SECURITY DEFINER). Budget: 30 requests / minute per
 * caller. Fails open — a rate-limit outage must never take the MCP server down.
 *
 * Audit logging: every tool call (inputs sanitized, rate-limit decision,
 * timestamp) is recorded in public.mcp_audit_log via the service-role client.
 * Logging failures are swallowed — they must never block a tool call.
 */
import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export const MCP_RATE_LIMIT = 30;
export const MCP_RATE_WINDOW_SECONDS = 60;

/** Public (masked-data) client used by every read-only tool. */
export function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false }, db: { schema: "api" } },
  );
}

/** Service-role client for rate-limit + audit-log writes. */
function adminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(process.env.SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Stable per-caller bucket. Authenticated callers are bucketed by user id,
 * then OAuth client id; anonymous callers share a single conservative bucket.
 */
function callerKey(ctx?: ToolContext): string {
  const userId = ctx?.getUserId?.();
  if (userId) return `user:${userId}`;
  const clientId = ctx?.getClientId?.();
  if (clientId) return `client:${clientId}`;
  return "anon";
}

export interface GuardResult {
  /** Present when the call must be refused; return it straight from the handler. */
  error?: {
    content: Array<{ type: "text"; text: string }>;
    isError: true;
  };
}

// ---------------------------------------------------------------------------
// Audit logging
// ---------------------------------------------------------------------------

interface AuditLogRow {
  tool_name: string;
  caller_key: string;
  sanitized_input: Record<string, unknown> | null;
  rate_limited: boolean;
  rate_remaining: number | null;
  retry_after: number | null;
  outcome: "success" | "rate_limited" | "error";
  error_message?: string;
}

/** Best-effort audit log write. Never throws. */
async function logAudit(row: AuditLogRow): Promise<void> {
  try {
    const admin = adminClient();
    if (!admin) return;
    await admin.from("mcp_audit_log").insert(row);
  } catch {
    // swallow — audit failures must not block the tool call
  }
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitize free-text input before it reaches a PostgREST filter string.
 * Strips the delimiters (`,` `(` `)` `.` `*` `%` `\` `"`) an attacker would use
 * to break out of an `or(...)`/`ilike` expression, then clamps the length.
 */
export function sanitizeFilterText(input: string, maxLength = 100): string {
  return input
    .replace(/[,()*%\\"'.:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Build a safe, sanitized representation of tool inputs for the audit log. */
export function sanitizeInputsForAudit(
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(inputs)) {
    if (typeof v === "string") {
      safe[k] = sanitizeFilterText(v, 200);
    } else if (typeof v === "number" || typeof v === "boolean") {
      safe[k] = v;
    } else {
      safe[k] = "[redacted]";
    }
  }
  return safe;
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/** Enforce the per-caller MCP budget. Returns `{ error }` when over budget. */
export async function enforceMcpRateLimit(
  tool: string,
  ctx?: ToolContext,
  sanitizedInputs?: Record<string, unknown>,
): Promise<GuardResult> {
  const caller = callerKey(ctx);
  try {
    const admin = adminClient();
    if (!admin) {
      // No service key — log skipped but allow
      await logAudit({
        tool_name: tool,
        caller_key: caller,
        sanitized_input: sanitizedInputs ?? null,
        rate_limited: false,
        rate_remaining: null,
        retry_after: null,
        outcome: "success",
      });
      return {};
    }

    const { data, error } = await admin.rpc("check_mcp_rate_limit", {
      p_key: `mcp:${tool}:${caller}`,
      p_max: MCP_RATE_LIMIT,
      p_window_seconds: MCP_RATE_WINDOW_SECONDS,
    });

    if (error) {
      console.warn(`[mcp:rate-limit] check failed for ${tool}: ${error.message}`);
      // Fail open — log and allow
      await logAudit({
        tool_name: tool,
        caller_key: caller,
        sanitized_input: sanitizedInputs ?? null,
        rate_limited: false,
        rate_remaining: null,
        retry_after: null,
        outcome: "success",
        error_message: `rate-limit check error: ${error.message}`,
      });
      return {};
    }

    const result = data as {
      allowed?: boolean;
      count?: number;
      limit?: number;
      retry_after?: number;
    } | null;

    const remaining = result?.limit != null && result?.count != null
      ? Math.max(0, result.limit - result.count)
      : null;

    if (result?.allowed === false) {
      const retry = Number(result.retry_after) || MCP_RATE_WINDOW_SECONDS;
      await logAudit({
        tool_name: tool,
        caller_key: caller,
        sanitized_input: sanitizedInputs ?? null,
        rate_limited: true,
        rate_remaining: 0,
        retry_after: retry,
        outcome: "rate_limited",
      });
      return {
        error: {
          content: [
            {
              type: "text",
              text:
                `Rate limit exceeded (${MCP_RATE_LIMIT} requests/minute). ` +
                `Retry in ${retry}s. ` +
                `"Let all things be done decently and in order." — 1 Corinthians 14:40`,
            },
          ],
          isError: true,
        },
      };
    }

    // Allowed — log success
    await logAudit({
      tool_name: tool,
      caller_key: caller,
      sanitized_input: sanitizedInputs ?? null,
      rate_limited: false,
      rate_remaining: remaining,
      retry_after: null,
      outcome: "success",
    });
    return {};
  } catch (e) {
    console.warn(`[mcp:rate-limit] unexpected error for ${tool}:`, e);
    return {};
  }
}

