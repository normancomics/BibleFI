import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ZEROX_API_KEY = Deno.env.get('ZEROX_API_KEY')!;
const ZEROX_BASE_URL = 'https://api.0x.org';
const BASE_CHAIN_ID = 8453;

// Rate limit: in-memory per-IP / per-user counter (resets on cold start)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit per authenticated user
    if (!checkRateLimit(`zerox:user:${user.id}`, 20, 60_000)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before making more requests.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { endpoint, sellToken, buyToken, sellAmount, takerAddress } = body;

    // Validate endpoint (whitelist only safe 0x endpoints)
    const allowedEndpoints = ['price', 'quote', 'tokens'];
    if (!allowedEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint requested' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build proxied URL with server-side API key
    let url: string;
    if (endpoint === 'tokens') {
      url = `${ZEROX_BASE_URL}/swap/v1/tokens?chainId=${BASE_CHAIN_ID}`;
    } else {
      const params = new URLSearchParams({
        chainId: BASE_CHAIN_ID.toString(),
        ...(sellToken && { sellToken }),
        ...(buyToken && { buyToken }),
        ...(sellAmount && { sellAmount }),
        ...(takerAddress && { takerAddress }),
      });
      url = `${ZEROX_BASE_URL}/swap/v1/${endpoint}?${params}`;
    }

    const response = await fetch(url, {
      headers: { '0x-api-key': ZEROX_API_KEY },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[zerox-proxy] Upstream error:', response.status, data);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch quote. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[zerox-proxy] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
