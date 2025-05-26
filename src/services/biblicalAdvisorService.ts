
import { supabase } from "@/integrations/supabase/client";

export interface BiblicalAdviceRequest {
  query: string;
  context?: {
    userId?: string;
    financialSituation?: string;
    goals?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
  };
}

export interface BiblicalAdviceResponse {
  advice: string;
  relevant_verses: Array<{
    id: string;
    reference: string;
    verse_text: string;
    principle: string;
    application: string;
  }>;
  biblical_principles: string[];
}

// For compatibility with existing components
export interface FinancialGuidanceResponse {
  answer: string;
  relevantScriptures: Array<{
    text: string;
    reference: string;
  }>;
  defiSuggestions?: Array<{
    protocol: string;
    action: string;
    rationale: string;
  }>;
}

export async function getBiblicalAdvice(request: BiblicalAdviceRequest): Promise<BiblicalAdviceResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('biblical-advisor', {
      body: request
    });

    if (error) {
      console.error('Error calling biblical advisor:', error);
      throw new Error(`Biblical advisor error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getBiblicalAdvice:', error);
    
    // Fallback response if the service fails
    return {
      advice: "I'm currently unable to connect to the biblical wisdom database. However, remember Proverbs 21:5 - 'The plans of the diligent lead to profit as surely as haste leads to poverty.' Consider seeking wise counsel and making thoughtful financial decisions based on biblical principles.",
      relevant_verses: [
        {
          id: "fallback-1",
          reference: "Proverbs 21:5",
          verse_text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
          principle: "Diligent planning leads to financial success",
          application: "Create detailed financial plans and avoid hasty investment decisions"
        }
      ],
      biblical_principles: ["Diligent planning", "Avoiding hasty decisions"]
    };
  }
}

// Alias for compatibility
export const getBiblicalFinancialGuidance = async (request: { query: string }): Promise<FinancialGuidanceResponse> => {
  const response = await getBiblicalAdvice(request);
  
  return {
    answer: response.advice,
    relevantScriptures: response.relevant_verses.map(verse => ({
      text: verse.verse_text,
      reference: verse.reference
    })),
    defiSuggestions: []
  };
};

export async function getFinancialPrinciples(): Promise<any[]> {
  try {
    // Fallback to hardcoded principles since the table doesn't exist in types yet
    return [
      {
        id: "1",
        title: "Stewardship",
        description: "All wealth ultimately belongs to God, and we are merely stewards of what He has entrusted to us.",
        scripture_references: ["Psalm 24:1", "Matthew 25:14-30"],
        category: "stewardship"
      },
      {
        id: "2",
        title: "Avoiding Debt",
        description: "Borrowing can lead to financial bondage. Living debt-free provides financial freedom and security.",
        scripture_references: ["Proverbs 22:7", "Romans 13:8"],
        category: "debt"
      },
      {
        id: "3",
        title: "Generosity",
        description: "Giving generously brings spiritual rewards and reflects God's character.",
        scripture_references: ["Proverbs 19:17", "2 Corinthians 9:6-7"],
        category: "generosity"
      }
    ];
  } catch (error) {
    console.error('Error in getFinancialPrinciples:', error);
    return [];
  }
}

// Alias for compatibility
export const getBiblicalFinancialPrinciples = getFinancialPrinciples;
