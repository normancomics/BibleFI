
import { supabase } from "@/integrations/supabase/client";

export interface BiblicalPrinciple {
  id: string;
  title: string;
  description: string;
  scripture_references: string[];
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface BiblicalAdvice {
  answer: string;
  relevantScriptures: Array<{
    reference: string;
    text: string;
  }>;
  defiSuggestions: Array<{
    protocol: string;
    action: string;
    rationale: string;
  }>;
}

export interface FinancialGuidanceRequest {
  query: string;
  context?: {
    walletBalance?: string;
    churchName?: string;
    previousTithes?: number;
  };
}

export interface FinancialGuidanceResponse {
  answer: string;
  relevantScriptures: {
    reference: string;
    text: string;
  }[];
  defiSuggestions?: {
    protocol: string;
    action: string;
    rationale: string;
  }[];
}

export async function getBiblicalFinancialPrinciples(): Promise<BiblicalPrinciple[]> {
  try {
    const { data, error } = await supabase
      .from('biblical_knowledge_base')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching biblical principles:", error);
      return [];
    }
    
    // Transform the data to match BiblicalPrinciple interface
    return data?.map(item => ({
      id: item.id,
      title: item.reference,
      description: item.principle || item.verse_text,
      scripture_references: [item.reference],
      category: item.category,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) || [];
  } catch (error) {
    console.error("Error in getBiblicalFinancialPrinciples:", error);
    return [];
  }
}

export async function searchBiblicalKnowledge(query: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('biblical_knowledge_base')
      .select('*')
      .or(`verse_text.ilike.%${query}%, principle.ilike.%${query}%, application.ilike.%${query}%`)
      .limit(5);
    
    if (error) {
      console.error("Error searching biblical knowledge:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in searchBiblicalKnowledge:", error);
    return [];
  }
}

export async function getBiblicalFinancialGuidance(request: FinancialGuidanceRequest): Promise<FinancialGuidanceResponse> {
  try {
    // Search for relevant biblical knowledge
    const knowledgeResults = await searchBiblicalKnowledge(request.query);
    
    // Generate advice based on the question and results
    const guidance: FinancialGuidanceResponse = {
      answer: generateBiblicalAnswer(request.query, knowledgeResults),
      relevantScriptures: knowledgeResults.slice(0, 3).map(result => ({
        reference: result.reference,
        text: result.verse_text
      })),
      defiSuggestions: generateDefiSuggestions(request.query, knowledgeResults)
    };
    
    return guidance;
  } catch (error) {
    console.error("Error getting biblical guidance:", error);
    return {
      answer: "I apologize, but I'm having trouble accessing the biblical knowledge base right now. Please try again later.",
      relevantScriptures: [],
      defiSuggestions: []
    };
  }
}

export async function getBiblicalAdvice(question: string): Promise<BiblicalAdvice> {
  try {
    // Search for relevant biblical knowledge
    const knowledgeResults = await searchBiblicalKnowledge(question);
    
    // Generate advice based on the question and results
    const advice: BiblicalAdvice = {
      answer: generateBiblicalAnswer(question, knowledgeResults),
      relevantScriptures: knowledgeResults.slice(0, 3).map(result => ({
        reference: result.reference,
        text: result.verse_text
      })),
      defiSuggestions: generateDefiSuggestions(question, knowledgeResults)
    };
    
    return advice;
  } catch (error) {
    console.error("Error getting biblical advice:", error);
    return {
      answer: "I apologize, but I'm having trouble accessing the biblical knowledge base right now. Please try again later.",
      relevantScriptures: [],
      defiSuggestions: []
    };
  }
}

function generateBiblicalAnswer(question: string, knowledgeResults: any[]): string {
  if (knowledgeResults.length === 0) {
    return "Based on biblical principles, I encourage you to seek wisdom through prayer and study of Scripture. Consider consulting with wise financial advisors and your church community for guidance on your financial decisions.";
  }
  
  const primaryResult = knowledgeResults[0];
  let answer = `Based on ${primaryResult.reference}: "${primaryResult.verse_text}" `;
  
  if (primaryResult.principle) {
    answer += `\n\nBiblical Principle: ${primaryResult.principle}`;
  }
  
  if (primaryResult.application) {
    answer += `\n\nPractical Application: ${primaryResult.application}`;
  }
  
  return answer;
}

function generateDefiSuggestions(question: string, knowledgeResults: any[]): Array<{protocol: string, action: string, rationale: string}> {
  const suggestions = [];
  
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('invest') || lowerQuestion.includes('yield')) {
    suggestions.push({
      protocol: "Stable Yield Pools",
      action: "Consider low-risk stablecoin yields",
      rationale: "Aligns with biblical principles of steady, prudent growth"
    });
  }
  
  if (lowerQuestion.includes('give') || lowerQuestion.includes('tithe')) {
    suggestions.push({
      protocol: "Bible.fi Tithing",
      action: "Set up automated digital tithing",
      rationale: "Fulfills the biblical command to give faithfully and consistently"
    });
  }
  
  if (lowerQuestion.includes('save') || lowerQuestion.includes('emergency')) {
    suggestions.push({
      protocol: "USDC Savings",
      action: "Build emergency fund in stablecoins",
      rationale: "Follows Proverbs 21:20 - 'The wise store up choice food and olive oil'"
    });
  }
  
  return suggestions;
}

export async function calculateWisdomScore(userActions: {
  diversification: number;
  generosity: number;
  risk: number;
  planning: number;
  contentment: number;
  stewardship: number;
}): Promise<{
  score: number;
  strengths: string[];
  improvements: string[];
  guidance: string;
}> {
  const { diversification, generosity, risk, planning, contentment, stewardship } = userActions;
  
  // Calculate weighted score (higher generosity and stewardship weight)
  const totalScore = Math.round(
    (diversification * 0.15) +
    (generosity * 0.25) +
    ((100 - risk) * 0.15) + // Lower risk is better
    (planning * 0.15) +
    (contentment * 0.15) +
    (stewardship * 0.15)
  );
  
  // Identify strengths and areas for improvement
  const factors = [
    { name: 'diversification', score: diversification },
    { name: 'generosity', score: generosity },
    { name: 'risk management', score: 100 - risk },
    { name: 'planning', score: planning },
    { name: 'contentment', score: contentment },
    { name: 'stewardship', score: stewardship }
  ];
  
  const sortedFactors = [...factors].sort((a, b) => b.score - a.score);
  const strengths = sortedFactors.slice(0, 2).map(f => f.name);
  const improvements = sortedFactors.slice(-2).map(f => f.name);
  
  // Generate guidance based on the lowest scoring areas
  let guidance = "Continue growing in biblical financial wisdom. ";
  if (improvements.includes('generosity')) {
    guidance += "Consider increasing your giving as God has blessed you. ";
  }
  if (improvements.includes('planning')) {
    guidance += "Develop a clearer financial plan based on biblical principles. ";
  }
  
  return {
    score: totalScore,
    strengths,
    improvements,
    guidance
  };
}
