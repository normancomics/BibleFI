
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
    const { verses } = await req.json();

    for (const verse of verses) {
      // Generate embedding for the verse text + context
      const textToEmbed = `${verse.text} ${verse.principle || ''} ${verse.application || ''} ${verse.defi_relevance || ''}`;
      
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: textToEmbed,
        }),
      });

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Insert into biblical_knowledge_base
      await supabase
        .from('biblical_knowledge_base')
        .insert({
          verse_text: verse.text,
          reference: verse.reference,
          category: verse.category,
          principle: verse.principle,
          application: verse.application,
          defi_relevance: verse.defi_relevance,
          financial_keywords: verse.financial_keywords || [],
          embedding: embedding,
        });
    }

    return new Response(JSON.stringify({ success: true, processed: verses.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const err = error as any;
    console.error('Error generating embeddings:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
