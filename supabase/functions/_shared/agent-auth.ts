/**
 * Shared authentication guard for agent edge functions.
 * Agents are intended to be triggered by:
 * 1. Cron jobs with a secret header (x-cron-secret)
 * 2. Admin users with a valid JWT and admin role
 * 
 * All other callers should be rejected.
 */
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const CRON_SECRET = Deno.env.get('CRON_SECRET');

interface AgentAuthResult {
  authorized: boolean;
  method: 'cron' | 'admin' | null;
  userId?: string;
  error?: string;
}

/**
 * Validates that the request is authorized to trigger an agent.
 * Returns authorized=true if:
 * - The x-cron-secret header matches CRON_SECRET, OR
 * - The Authorization header contains a valid admin JWT
 * 
 * @param req The incoming request
 * @returns AgentAuthResult with authorization status
 */
export async function requireAgentAuth(req: Request): Promise<AgentAuthResult> {
  // Method 1: Cron secret
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret) {
    if (!CRON_SECRET) {
      console.warn('[agent-auth] CRON_SECRET not configured in environment');
      return { authorized: false, method: null, error: 'Cron secret not configured' };
    }
    if (cronSecret === CRON_SECRET) {
      return { authorized: true, method: 'cron' };
    }
    return { authorized: false, method: null, error: 'Invalid cron secret' };
  }

  // Method 2: Admin JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, method: null, error: 'Authentication required' };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { authorized: false, method: null, error: 'Invalid authentication token' };
  }

  // Check for admin role using the has_role function
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: isAdmin, error: roleError } = await serviceClient.rpc('has_role', {
    _user_id: user.id,
    _role: 'admin',
  });

  if (roleError) {
    console.error('[agent-auth] Error checking admin role:', roleError);
    return { authorized: false, method: null, error: 'Failed to verify admin role' };
  }

  if (!isAdmin) {
    return { authorized: false, method: null, error: 'Admin role required' };
  }

  return { authorized: true, method: 'admin', userId: user.id };
}

/**
 * Returns a 401/403 response for unauthorized agent requests.
 */
export function unauthorizedResponse(
  message: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
