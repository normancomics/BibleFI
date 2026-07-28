/**
 * DB-backed fixed-window rate limiting for edge functions.
 *
 * Calls public.check_edge_rate_limit (service role only) which atomically
 * increments a per-key counter. Fails open: if the check itself errors, the
 * request is allowed and a warning is logged, so a rate-limit outage can never
 * take the function down.
 *
 * Usage:
 *   const limited = await enforceRateLimit({
 *     functionName: 'talent-score', key: user.id,
 *     maxRequests: 10, windowSeconds: 60, corsHeaders,
 *   });
 *   if (limited) return limited;
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RateLimitOptions {
  functionName: string;
  key: string;
  maxRequests: number;
  windowSeconds: number;
  corsHeaders?: Record<string, string>;
}

export async function enforceRateLimit(opts: RateLimitOptions): Promise<Response | null> {
  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data, error } = await admin.rpc('check_edge_rate_limit', {
      p_key: `${opts.functionName}:${opts.key}`,
      p_max: opts.maxRequests,
      p_window_seconds: opts.windowSeconds,
    });
    if (error) {
      console.warn(`[rate-limit] check failed for ${opts.functionName}: ${error.message}`);
      return null;
    }
    if (data?.allowed === false) {
      const retryAfter = Number(data.retry_after) || opts.windowSeconds;
      console.warn(`[rate-limit] ${opts.functionName} limited key=${opts.key} retry_after=${retryAfter}s`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', retry_after: retryAfter }),
        {
          status: 429,
          headers: {
            ...(opts.corsHeaders ?? {}),
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        },
      );
    }
    return null;
  } catch (e) {
    console.warn(`[rate-limit] unexpected error for ${opts.functionName}:`, e);
    return null;
  }
}
