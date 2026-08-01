/**
 * Shared abuse-protection helpers for BibleFi MCP tools.
 *
 * Rate limiting: DB-backed fixed window via public.check_mcp_rate_limit
 * (service-role only, SECURITY DEFINER). Budget: 30 requests / minute per
 * caller. Fails open — a rate-limit outage must never take the MCP server down.
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

/** Enforce the per-caller MCP budget. Returns `{ error }` when over budget. */
export async function enforceMcpRateLimit(tool: string, ctx?: ToolContext): Promise<GuardResult> {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return {};
    const admin = createClient(process.env.SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await admin.rpc("check_mcp_rate_limit", {
      p_key: `mcp:${tool}:${callerKey(ctx)}`,
      p_max: MCP_RATE_LIMIT,
      p_window_seconds: MCP_RATE_WINDOW_SECONDS,
    });
    if (error) {
      console.warn(`[mcp:rate-limit] check failed for ${tool}: ${error.message}`);
      return {};
    }
    const result = data as { allowed?: boolean; retry_after?: number } | null;
    if (result?.allowed === false) {
      const retry = Number(result.retry_after) || MCP_RATE_WINDOW_SECONDS;
      return {
        error: {
          content: [
            {
              type: "text",
              text:
                `Rate limit exceeded (${MCP_RATE_LIMIT} requests/minute). Retry in ${retry}s. ` +
                `"Let all things be done decently and in order." — 1 Corinthians 14:40`,
            },
          ],
          isError: true,
        },
      };
    }
    return {};
  } catch (e) {
    console.warn(`[mcp:rate-limit] unexpected error for ${tool}:`, e);
    return {};
  }
}

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
