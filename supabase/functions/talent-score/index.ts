 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
// Talent Protocol API v3 - Base URL
const TALENT_API_BASE = 'https://api.talentprotocol.com';
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
interface TalentScore {
   score: number;
  score_type: string;
  last_calculated_at: string;
}

interface TalentCredential {
  id: string;
  name: string;
  type: string;
  value: string;
  verified: boolean;
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Authenticate user
     const authHeader = req.headers.get('Authorization');
     if (!authHeader?.startsWith('Bearer ')) {
       return new Response(
         JSON.stringify({ error: 'Authentication required' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }

     const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
     const authClient = createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_ANON_KEY')!,
       { global: { headers: { Authorization: authHeader } } }
     );
     const { data: { user }, error: authError } = await authClient.auth.getUser();
     if (authError || !user) {
       return new Response(
         JSON.stringify({ error: 'Invalid authentication' }),
         { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }

     const TALENT_API_KEY = Deno.env.get('TALENT_API_KEY');
     
     if (!TALENT_API_KEY) {
       return new Response(
         JSON.stringify({ error: 'Talent API key not configured' }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const { wallet_address } = await req.json();
 
     if (!wallet_address) {
       return new Response(
        JSON.stringify({ error: 'wallet_address is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
    // Fetch builder score from Talent Protocol v3 API
    const scoreResponse = await fetch(
      `${TALENT_API_BASE}/score?id=${wallet_address}`,
       {
         headers: {
           'X-API-KEY': TALENT_API_KEY,
           'Content-Type': 'application/json',
         },
       }
     );
 
    if (!scoreResponse.ok) {
      if (scoreResponse.status === 404) {
         return new Response(
           JSON.stringify({ 
             found: false,
            message: 'No Talent profile found for this wallet',
             builder_tier: 'Novice',
             multiplier: 1.0,
           }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
      throw new Error(`Talent API error: ${scoreResponse.status}`);
     }
 
    const scoreData = await scoreResponse.json();
    // Score is returned as an object with points property
    const scorePoints = scoreData.score?.points || 0;
 
     // Calculate BibleFi builder tier
     let tier = 'Novice';
     let multiplier = 1.0;
     let description = 'New to the ecosystem';
 
    if (scorePoints >= 90) {
       tier = 'Grandmaster';
       multiplier = 2.0;
       description = 'Elite builder - 2x APY bonus on all pools';
    } else if (scorePoints >= 70) {
       tier = 'Master';
       multiplier = 1.75;
       description = 'Proven builder - 1.75x APY bonus';
    } else if (scorePoints >= 50) {
       tier = 'Journeyman';
       multiplier = 1.5;
       description = 'Verified builder - 1.5x APY bonus';
    } else if (scorePoints >= 25) {
       tier = 'Apprentice';
       multiplier = 1.25;
       description = 'Emerging builder - 1.25x APY bonus';
     }
 
     // Fetch credentials count
    let credentials: TalentCredential[] = [];
     try {
       const credResponse = await fetch(
        `${TALENT_API_BASE}/credentials?id=${wallet_address}`,
         {
           headers: {
             'X-API-KEY': TALENT_API_KEY,
             'Content-Type': 'application/json',
           },
         }
       );
       if (credResponse.ok) {
         const credData = await credResponse.json();
        credentials = credData.credentials || [];
       }
     } catch (e) {
       console.error('Error fetching credentials:', e);
     }
 
     return new Response(
       JSON.stringify({
         found: true,
        talent_score: scorePoints,
        rank_position: scoreData.score?.rank_position,
         builder_tier: tier,
         multiplier,
         description,
        last_calculated_at: scoreData.score?.last_calculated_at,
         credentials_count: credentials.length,
        credentials: credentials.slice(0, 5),
       }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   } catch (error) {
     console.error('Error in talent-score function:', error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });