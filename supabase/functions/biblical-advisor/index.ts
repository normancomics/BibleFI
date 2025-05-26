
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

    console.log('Biblical advisor request:', { query, context });

    // If no OpenAI API key, return fallback response
    if (!openAIApiKey) {
      console.log('No OpenAI API key configured, returning fallback response');
      
      const fallbackVerses = [
        {
          id: 'fallback-1',
          reference: 'Proverbs 21:5',
          verse_text: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
          principle: 'Diligent planning leads to financial success',
          application: 'Create detailed financial plans and avoid hasty investment decisions'
        },
        {
          id: 'fallback-2', 
          reference: 'Luke 14:28',
          verse_text: 'Suppose one of you wants to build a tower. Won\'t you first sit down and estimate the cost to see if you have enough money to complete it?',
          principle: 'Count the cost before making financial commitments',
          application: 'Always budget and plan before making large purchases or investments'
        }
      ];

      return new Response(JSON.stringify({
        advice: `Based on your question about "${query}", here's biblical wisdom: Remember that God calls us to be wise stewards of our resources. Proverbs 21:5 reminds us that "the plans of the diligent lead to profit as surely as haste leads to poverty." Consider seeking wise counsel, making thoughtful decisions, and always prioritizing giving and saving in your financial planning.`,
        relevant_verses: fallbackVerses,
        biblical_principles: ['Diligent planning', 'Wise stewardship', 'Avoiding hasty decisions']
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Mock relevant verses for now
    const mockVerses = [
      {
        id: 'verse-1',
        reference: 'Proverbs 21:5',
        verse_text: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
        principle: 'Diligent planning leads to financial success',
        application: 'Create detailed financial plans and avoid hasty investment decisions'
      },
      {
        id: 'verse-2',
        reference: 'Matthew 25:21',
        verse_text: 'His master replied, "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things."',
        principle: 'Faithful stewardship leads to greater responsibility',
        application: 'Start with small investments and prove your faithfulness before scaling up'
      }
    ];

    console.log('Biblical advisor response generated successfully');

    return new Response(JSON.stringify({
      advice,
      relevant_verses: mockVerses,
      biblical_principles: ['Diligent planning', 'Faithful stewardship', 'Wise counsel']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in biblical advisor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      advice: "I'm currently experiencing technical difficulties. Please remember Proverbs 3:5-6: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' Seek wise counsel and make decisions based on biblical principles.",
      relevant_verses: [],
      biblical_principles: ['Trust in the LORD', 'Seek wise counsel']
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
