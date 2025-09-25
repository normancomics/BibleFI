
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { userId, factors } = await req.json();

    // Calculate wisdom score based on biblical principles
    let score = 0;
    const maxScore = 100;

    // Stewardship (20 points)
    if (factors.hasDiversifiedPortfolio) score += 8;
    if (factors.hasEmergencyFund) score += 7;
    if (factors.regularMonitoring) score += 5;

    // Generosity (25 points) - Highest weighted as it's central to biblical teaching
    if (factors.hasAutomatedTithing) score += 15;
    if (factors.charitableGiving) score += 10;

    // Wisdom & Planning (20 points)
    if (factors.educationEfforts) score += 8;
    if (factors.longTermPlanning) score += 7;
    if (factors.riskAssessment) score += 5;

    // Contentment & Self-Control (15 points)
    if (factors.avoidingHighRisk) score += 8;
    if (factors.debtMinimization) score += 7;

    // Community & Accountability (10 points)
    if (factors.communityInvolvement) score += 5;
    if (factors.mentorshipParticipation) score += 5;

    // Work Ethic (10 points)
    if (factors.consistentInvesting) score += 5;
    if (factors.diligentResearch) score += 5;

    // Find most relevant biblical verse based on score
    let recommendedCategory;
    if (score < 30) recommendedCategory = 'planning';
    else if (score < 50) recommendedCategory = 'stewardship';
    else if (score < 70) recommendedCategory = 'investing';
    else if (score < 90) recommendedCategory = 'generosity';
    else recommendedCategory = 'contentment';

    const { data: relevantVerse } = await supabase
      .from('biblical_knowledge_base')
      .select('*')
      .eq('category', recommendedCategory)
      .limit(1)
      .single();

    // Store wisdom score
    const { data: wisdomScore } = await supabase
      .from('wisdom_scores')
      .insert({
        user_id: userId,
        score: Math.min(score, maxScore),
        factors,
        biblical_verse_id: relevantVerse?.id
      })
      .select()
      .single();

    // Generate personalized advice based on score
    let advice;
    if (score < 30) {
      advice = "Focus on establishing biblical financial foundations. Start with regular tithing and creating a basic emergency fund.";
    } else if (score < 50) {
      advice = "Good start! Now diversify your holdings and increase your biblical financial education.";
    } else if (score < 70) {
      advice = "You're practicing solid stewardship! Consider more strategic DeFi opportunities while maintaining your giving.";
    } else if (score < 90) {
      advice = "Excellent biblical financial wisdom! Explore ways to mentor others while optimizing your impact.";
    } else {
      advice = "Outstanding! You exemplify biblical financial principles. Consider leadership roles in the community.";
    }

    return new Response(JSON.stringify({
      score: Math.min(score, maxScore),
      advice,
      relevant_verse: relevantVerse,
      breakdown: {
        stewardship: Math.min((factors.hasDiversifiedPortfolio ? 8 : 0) + (factors.hasEmergencyFund ? 7 : 0) + (factors.regularMonitoring ? 5 : 0), 20),
        generosity: Math.min((factors.hasAutomatedTithing ? 15 : 0) + (factors.charitableGiving ? 10 : 0), 25),
        wisdom: Math.min((factors.educationEfforts ? 8 : 0) + (factors.longTermPlanning ? 7 : 0) + (factors.riskAssessment ? 5 : 0), 20),
        contentment: Math.min((factors.avoidingHighRisk ? 8 : 0) + (factors.debtMinimization ? 7 : 0), 15),
        community: Math.min((factors.communityInvolvement ? 5 : 0) + (factors.mentorshipParticipation ? 5 : 0), 10),
        work_ethic: Math.min((factors.consistentInvesting ? 5 : 0) + (factors.diligentResearch ? 5 : 0), 10)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const err = error as any;
    console.error('Error calculating wisdom score:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
