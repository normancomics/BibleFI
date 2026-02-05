 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const TALENT_API_BASE = 'https://api.talentprotocol.com';
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 interface TalentPassport {
   passport_id: number;
   score: number;
   passport_profile: {
     name: string;
     bio: string;
     image_url: string;
   };
   verified_wallets: string[];
   credentials_count: number;
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
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
 
     // Fetch passport from Talent Protocol
     const passportResponse = await fetch(
       `${TALENT_API_BASE}/api/v2/passports/${wallet_address}`,
       {
         headers: {
           'X-API-KEY': TALENT_API_KEY,
           'Content-Type': 'application/json',
         },
       }
     );
 
     if (!passportResponse.ok) {
       if (passportResponse.status === 404) {
         return new Response(
           JSON.stringify({ 
             found: false,
             message: 'No Talent passport found for this wallet',
             builder_tier: 'Novice',
             multiplier: 1.0,
           }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
       throw new Error(`Talent API error: ${passportResponse.status}`);
     }
 
     const passportData = await passportResponse.json();
     const passport: TalentPassport = passportData.passport;
 
     // Calculate BibleFi builder tier
     const score = passport.score || 0;
     let tier = 'Novice';
     let multiplier = 1.0;
     let description = 'New to the ecosystem';
 
     if (score >= 90) {
       tier = 'Grandmaster';
       multiplier = 2.0;
       description = 'Elite builder - 2x APY bonus on all pools';
     } else if (score >= 70) {
       tier = 'Master';
       multiplier = 1.75;
       description = 'Proven builder - 1.75x APY bonus';
     } else if (score >= 50) {
       tier = 'Journeyman';
       multiplier = 1.5;
       description = 'Verified builder - 1.5x APY bonus';
     } else if (score >= 25) {
       tier = 'Apprentice';
       multiplier = 1.25;
       description = 'Emerging builder - 1.25x APY bonus';
     }
 
     // Fetch credentials count
     let credentials: any[] = [];
     try {
       const credResponse = await fetch(
         `${TALENT_API_BASE}/api/v2/passport_credentials?passport_id=${passport.passport_id}`,
         {
           headers: {
             'X-API-KEY': TALENT_API_KEY,
             'Content-Type': 'application/json',
           },
         }
       );
       if (credResponse.ok) {
         const credData = await credResponse.json();
         credentials = credData.passport_credentials || [];
       }
     } catch (e) {
       console.error('Error fetching credentials:', e);
     }
 
     return new Response(
       JSON.stringify({
         found: true,
         passport_id: passport.passport_id,
         talent_score: score,
         builder_tier: tier,
         multiplier,
         description,
         profile: passport.passport_profile,
         verified_wallets: passport.verified_wallets,
         credentials_count: credentials.length,
         credentials: credentials.slice(0, 5), // Top 5 credentials
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