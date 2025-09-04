
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

    // Enhanced fallback response without OpenAI
    if (!openAIApiKey) {
      console.log('No OpenAI API key configured, returning enhanced fallback response');
      
      // Comprehensive offline biblical wisdom
      const comprehensiveVerses = [
        {
          id: 'tithe-1',
          reference: 'Malachi 3:10',
          verse_text: 'Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the Lord Almighty, and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.',
          principle: 'Tithing demonstrates trust in God\'s provision and unlocks His blessings',
          application: 'Set up automated 10% giving from your DeFi earnings to your local church'
        },
        {
          id: 'stewardship-1',
          reference: 'Proverbs 21:5',
          verse_text: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
          principle: 'Diligent planning leads to financial success',
          application: 'Create detailed financial plans and avoid hasty investment decisions, especially in volatile DeFi markets'
        },
        {
          id: 'debt-1',
          reference: 'Proverbs 22:7',
          verse_text: 'The rich rule over the poor, and the borrower is slave to the lender.',
          principle: 'Debt creates financial bondage that limits freedom',
          application: 'Avoid excessive leverage in DeFi protocols that could lead to liquidation'
        },
        {
          id: 'wisdom-1',
          reference: 'Proverbs 13:11',
          verse_text: 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow.',
          principle: 'Sustainable wealth comes from consistent, honest accumulation',
          application: 'Build DeFi positions gradually through regular contributions to stable yield protocols'
        }
      ];

      // Smart verse selection based on query
      let relevantVerses = [];
      let advice = "";
      
      if (query.toLowerCase().includes('tithe') || query.toLowerCase().includes('give')) {
        relevantVerses = [comprehensiveVerses[0], comprehensiveVerses[1]];
        advice = `Based on ${comprehensiveVerses[0].reference}: "${comprehensiveVerses[0].verse_text}"\n\nBiblical guidance on tithing: God invites us to test Him in the area of tithing. This isn't about earning His love, but about demonstrating our trust in His provision. In the DeFi space, you can set up automated tithing streams using protocols like Superfluid, ensuring your giving has priority over reinvestment. Remember, tithing should come from your gross income, including DeFi yields.`;
      } else if (query.toLowerCase().includes('debt') || query.toLowerCase().includes('borrow')) {
        relevantVerses = [comprehensiveVerses[2], comprehensiveVerses[1]];
        advice = `According to ${comprehensiveVerses[2].reference}: "${comprehensiveVerses[2].verse_text}"\n\nBiblical wisdom on debt: The Bible consistently warns against the dangers of debt. In DeFi, this translates to being extremely cautious with leverage and borrowed positions. While some protocols offer attractive borrowing rates, remember that liquidation risks can quickly turn profitable positions into significant losses.`;
      } else if (query.toLowerCase().includes('invest') || query.toLowerCase().includes('defi')) {
        relevantVerses = [comprehensiveVerses[3], comprehensiveVerses[1]];
        advice = `Based on ${comprehensiveVerses[3].reference}: "${comprehensiveVerses[3].verse_text}"\n\nBiblical approach to DeFi investing: God's word emphasizes gradual, steady wealth building over get-rich-quick schemes. Apply this to DeFi by using dollar-cost averaging, diversifying across multiple protocols, and focusing on sustainable yields rather than unsustainable APYs that often indicate higher risk.`;
      } else {
        relevantVerses = [comprehensiveVerses[1], comprehensiveVerses[3]];
        advice = `Based on ${comprehensiveVerses[1].reference}: "${comprehensiveVerses[1].verse_text}"\n\nGeneral biblical financial wisdom: God calls us to be wise stewards of our resources. This means careful planning, patient accumulation, and avoiding hasty decisions driven by greed or fear. In your financial journey, prioritize giving, maintain emergency funds, and invest wisely for the long term.`;
      }

      return new Response(JSON.stringify({
        advice,
        relevant_verses: relevantVerses,
        biblical_principles: ['Faithful Stewardship', 'Wise Planning', 'Generous Giving', 'Avoiding Debt Bondage']
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
