
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context } = await req.json();

    // Generate embedding for the user's query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for relevant biblical verses
    const { data: relevantVerses } = await supabase.rpc('search_biblical_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 5
    });

    // Prepare context for GPT
    const biblicalContext = relevantVerses.map(verse => 
      `${verse.reference}: "${verse.verse_text}" - Principle: ${verse.principle} - Application: ${verse.application}`
    ).join('\n\n');

    // Generate AI response with biblical context
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a Biblical Financial Advisor for Bible.fi, a DeFi platform built on biblical principles. You provide financial guidance based on scriptural wisdom while being knowledgeable about modern DeFi practices on Base chain.

CORE PRINCIPLES:
- Every financial decision should align with biblical stewardship principles
- Promote generosity, wisdom, and ethical investing
- Warn against greed, get-rich-quick schemes, and usury
- Encourage tithing and charitable giving
- Emphasize long-term wealth building over speculation

When giving advice:
1. Start with relevant biblical principles
2. Apply them to the user's specific situation
3. Provide practical DeFi recommendations if appropriate
4. Always consider risk management and security
5. Encourage community and accountability

Biblical Context Available:
${biblicalContext}

User Context: ${JSON.stringify(context || {})}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const completionData = await completion.json();
    const advice = completionData.choices[0].message.content;

    // Store the AI session for context
    const sessionData = {
      user_id: context?.userId || null,
      session_type: 'financial_advice',
      context_data: {
        query,
        advice,
        relevant_verses: relevantVerses.map(v => v.id),
        user_context: context
      }
    };

    if (context?.userId) {
      await supabase.from('ai_context_sessions').insert(sessionData);
    }

    return new Response(JSON.stringify({
      advice,
      relevant_verses: relevantVerses,
      biblical_principles: relevantVerses.map(v => v.principle).filter(Boolean)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in biblical advisor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
