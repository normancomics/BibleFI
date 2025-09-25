import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { query, context } = body;

    // Input validation and sanitization
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Invalid query provided');
    }

    if (query.length > 1000) {
      throw new Error('Query too long. Maximum 1000 characters allowed');
    }

    // Check for malicious content
    const dangerousPatterns = /<script|javascript:|data:|vbscript:|onload|onerror/i;
    if (dangerousPatterns.test(query)) {
      console.warn('Malicious content detected in query:', query);
      throw new Error('Invalid content detected');
    }

    const sanitizedQuery = query.trim().slice(0, 1000);
    console.log('Enhanced Biblical Advisor Request:', { 
      queryLength: sanitizedQuery.length, 
      hasContext: !!context,
      userAgent: req.headers.get('user-agent')?.slice(0, 100)
    });

    // Search for relevant biblical knowledge with parameterized query
    const searchTerms = sanitizedQuery
      .split(' ')
      .filter(term => term.length > 2 && !/[<>\"'&]/.test(term))
      .slice(0, 10) // Limit search terms
      .join(' | ');

    const { data: biblicalKnowledge, error: searchError } = await supabase
      .from('biblical_knowledge_base')
      .select('*')
      .textSearch('verse_text', searchTerms || 'wisdom')
      .limit(5);

    if (searchError) {
      console.error('Error searching biblical knowledge:', searchError);
    }

    let response;
    
    if (anthropicApiKey) {
      // Use Anthropic Claude for enhanced responses
      const systemPrompt = `You are a Biblical Financial Advisor for Bible.fi, a DeFi application that combines biblical wisdom with cryptocurrency and decentralized finance.

Your role is to:
1. Provide financial guidance based on biblical principles
2. Reference relevant Bible verses about money, stewardship, and wealth
3. Give practical advice for DeFi activities (staking, lending, tithing) through a biblical lens
4. Encourage generosity, wisdom, and good stewardship
5. Warn against greed, debt, and poor financial decisions
6. Keep responses under 200 words and be encouraging

Context about the user: ${context ? JSON.stringify(context) : 'No specific context provided'}

Available biblical knowledge: ${biblicalKnowledge ? JSON.stringify(biblicalKnowledge.slice(0, 3)) : 'No specific verses found'}

Format your response as JSON with these fields:
- answer: Your main biblical financial advice (max 200 words)
- scripture: Relevant Bible verse reference  
- verseText: The actual verse text
- practicalSteps: Array of 2-3 practical steps they can take
- wisdomScore: A number 1-100 based on how wise their query shows they are
- defiRelevance: How this applies to DeFi/crypto (if applicable)`;

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anthropicApiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nUser Question: ${sanitizedQuery}`
            }
          ]
        })
      });

      if (!anthropicResponse.ok) {
        throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
      }

      const anthropicData = await anthropicResponse.json();
      const content = anthropicData.content[0].text;
      
      try {
        response = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing Claude response, using fallback:', parseError);
        response = {
          answer: content,
          scripture: "Proverbs 21:5",
          verseText: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
          practicalSteps: [
            "Pray for wisdom before making financial decisions",
            "Seek counsel from mature believers",
            "Practice good stewardship with what you have"
          ],
          wisdomScore: 75,
          defiRelevance: "Apply biblical principles of patience and planning to your DeFi investments"
        };
      }
    } else {
      // Fallback without API key
      const relevantVerse = biblicalKnowledge && biblicalKnowledge.length > 0 
        ? biblicalKnowledge[0] 
        : {
            reference: "Proverbs 21:5",
            verse_text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
            principle: "Plan wisely and work diligently",
            application: "Apply patience and planning to your financial decisions"
          };

      response = {
        answer: `Based on biblical wisdom, your question about "${query}" reminds us that God calls us to be wise stewards. The Bible teaches us to plan carefully, work diligently, and trust in God's provision. In the context of DeFi and cryptocurrency, this means making informed decisions, not investing more than you can afford to lose, and always maintaining a generous heart for tithing and helping others.`,
        scripture: relevantVerse.reference,
        verseText: relevantVerse.verse_text,
        practicalSteps: [
          "Pray for wisdom before making financial decisions",
          "Start with small amounts and learn gradually",
          "Set aside funds for tithing and giving"
        ],
        wisdomScore: 70,
        defiRelevance: "Apply biblical patience and planning principles to your DeFi journey"
      };
    }

    // Store the session for tracking
    await supabase
      .from('ai_context_sessions')
      .insert({
        session_type: 'enhanced_biblical_advisor',
        context_data: { query, response, userContext: context },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    console.log('Enhanced Biblical Advisor Response generated successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-biblical-advisor function:', error);
    
    // Fallback response
    const fallbackResponse = {
      answer: "I apologize, but I'm having trouble accessing the biblical knowledge base right now. However, I can share this timeless wisdom: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' (Proverbs 3:5-6). Remember to seek God's wisdom in all your financial decisions.",
      scripture: "Proverbs 3:5-6",
      verseText: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
      practicalSteps: [
        "Pray for guidance before financial decisions",
        "Seek wise counsel from trusted advisors",
        "Practice contentment and gratitude"
      ],
      wisdomScore: 80,
      defiRelevance: "Trust God's timing and wisdom in your financial journey"
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});