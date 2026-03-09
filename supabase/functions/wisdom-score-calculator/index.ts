import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIP, validateInput, errorResponse, rateLimitResponse } from '../_shared/auth.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema for factors
const factorsSchema = {
  hasDiversifiedPortfolio: 'boolean',
  hasEmergencyFund: 'boolean',
  regularMonitoring: 'boolean',
  hasAutomatedTithing: 'boolean',
  charitableGiving: 'boolean',
  educationEfforts: 'boolean',
  longTermPlanning: 'boolean',
  riskAssessment: 'boolean',
  avoidingHighRisk: 'boolean',
  debtMinimization: 'boolean',
  communityInvolvement: 'boolean',
  mentorshipParticipation: 'boolean',
  consistentInvesting: 'boolean',
  diligentResearch: 'boolean',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Require authentication and use verified user ID from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Authentication required', 401, corsHeaders);
    }

    const token = authHeader.replace('Bearer ', '');
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return errorResponse('Invalid authentication token', 401, corsHeaders);
    }

    // Use verified user ID from JWT - NEVER trust body-supplied userId
    const verifiedUserId = user.id;

    // Rate limiting based on verified user
    const rateLimitKey = `wisdom-score:user:${verifiedUserId}`;
    const isAllowed = checkRateLimit(rateLimitKey, 30, 60000);

    if (!isAllowed.allowed) {
      console.warn(`Rate limit exceeded for user: ${verifiedUserId}`);
      return rateLimitResponse(isAllowed.resetAt, corsHeaders);
    }

    // Validate request method
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405, corsHeaders);
    }

    const body = await req.json();
    const { factors } = body;
    // Note: body.userId is IGNORED for security - we use verifiedUserId instead

    // Validate factors object
    if (!factors || typeof factors !== 'object') {
      return errorResponse('Invalid factors object', 400, corsHeaders);
    }

    // Sanitize factors - only accept boolean values for known keys
    const sanitizedFactors: Record<string, boolean> = {};
    for (const [key, expectedType] of Object.entries(factorsSchema)) {
      if (key in factors) {
        const value = factors[key];
        if (typeof value === 'boolean') {
          sanitizedFactors[key] = value;
        } else if (expectedType === 'boolean') {
          // Convert truthy/falsy to boolean
          sanitizedFactors[key] = Boolean(value);
        }
      } else {
        sanitizedFactors[key] = false;
      }
    }

    // Calculate wisdom score based on biblical principles
    let score = 0;
    const maxScore = 100;

    // Stewardship (20 points)
    if (sanitizedFactors.hasDiversifiedPortfolio) score += 8;
    if (sanitizedFactors.hasEmergencyFund) score += 7;
    if (sanitizedFactors.regularMonitoring) score += 5;

    // Generosity (25 points) - Highest weighted as it's central to biblical teaching
    if (sanitizedFactors.hasAutomatedTithing) score += 15;
    if (sanitizedFactors.charitableGiving) score += 10;

    // Wisdom & Planning (20 points)
    if (sanitizedFactors.educationEfforts) score += 8;
    if (sanitizedFactors.longTermPlanning) score += 7;
    if (sanitizedFactors.riskAssessment) score += 5;

    // Contentment & Self-Control (15 points)
    if (sanitizedFactors.avoidingHighRisk) score += 8;
    if (sanitizedFactors.debtMinimization) score += 7;

    // Community & Accountability (10 points)
    if (sanitizedFactors.communityInvolvement) score += 5;
    if (sanitizedFactors.mentorshipParticipation) score += 5;

    // Work Ethic (10 points)
    if (sanitizedFactors.consistentInvesting) score += 5;
    if (sanitizedFactors.diligentResearch) score += 5;

    // Find most relevant biblical verse based on score
    let recommendedCategory: string;
    if (score < 30) recommendedCategory = 'planning';
    else if (score < 50) recommendedCategory = 'stewardship';
    else if (score < 70) recommendedCategory = 'investing';
    else if (score < 90) recommendedCategory = 'generosity';
    else recommendedCategory = 'contentment';

    const { data: relevantVerse } = await supabase
      .from('biblical_knowledge_base')
      .select('id, verse_text, reference, category, principle, application')
      .eq('category', recommendedCategory)
      .limit(1)
      .single();

    // Store wisdom score using VERIFIED user ID from JWT
    const { data: wisdomScore, error: insertError } = await supabase
      .from('wisdom_scores')
      .insert({
        user_id: verifiedUserId, // SECURE: Uses JWT-verified user ID
        score: Math.min(score, maxScore),
        factors: sanitizedFactors,
        biblical_verse_id: relevantVerse?.id || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing wisdom score:', insertError);
      // Continue even if storage fails
    }

    // Generate personalized advice based on score
    let advice: string;
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
        stewardship: Math.min((sanitizedFactors.hasDiversifiedPortfolio ? 8 : 0) + (sanitizedFactors.hasEmergencyFund ? 7 : 0) + (sanitizedFactors.regularMonitoring ? 5 : 0), 20),
        generosity: Math.min((sanitizedFactors.hasAutomatedTithing ? 15 : 0) + (sanitizedFactors.charitableGiving ? 10 : 0), 25),
        wisdom: Math.min((sanitizedFactors.educationEfforts ? 8 : 0) + (sanitizedFactors.longTermPlanning ? 7 : 0) + (sanitizedFactors.riskAssessment ? 5 : 0), 20),
        contentment: Math.min((sanitizedFactors.avoidingHighRisk ? 8 : 0) + (sanitizedFactors.debtMinimization ? 7 : 0), 15),
        community: Math.min((sanitizedFactors.communityInvolvement ? 5 : 0) + (sanitizedFactors.mentorshipParticipation ? 5 : 0), 10),
        work_ethic: Math.min((sanitizedFactors.consistentInvesting ? 5 : 0) + (sanitizedFactors.diligentResearch ? 5 : 0), 10)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error calculating wisdom score:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
