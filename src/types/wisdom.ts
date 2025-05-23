
export interface BiblicalPrinciple {
  id: string;
  verse: string;
  reference: string;
  principle: string;
  application: string;
  defiRelevance?: string;
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
