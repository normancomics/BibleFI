
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const farcasterApiKey = Deno.env.get('FARCASTER_API_KEY');
    
    if (!farcasterApiKey) {
      throw new Error('Farcaster API key not configured');
    }

    const { endpoint, method = 'GET', data } = await req.json();
    
    const farcasterResponse = await fetch(`https://api.neynar.com/v2${endpoint}`, {
      method,
      headers: {
        'api_key': farcasterApiKey,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await farcasterResponse.json();

    return new Response(JSON.stringify(responseData), {
      status: farcasterResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in farcaster-api function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
