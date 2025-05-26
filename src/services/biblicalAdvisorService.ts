
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

export async function getFinancialPrinciples(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('biblical_financial_principles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching financial principles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFinancialPrinciples:', error);
    return [];
  }
}
