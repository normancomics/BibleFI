
import { supabase } from '@/integrations/supabase/client';
import { financialVerses } from '@/data/bibleVerses';

export interface BiblicalVerse {
  text: string;
  reference: string;
  category: string;
  principle?: string;
  application?: string;
  defi_relevance?: string;
  financial_keywords?: string[];
}

export const populateBiblicalKnowledge = async () => {
  try {
    // Transform our existing verses to match the database schema
    const versesToPopulate: BiblicalVerse[] = financialVerses.map(verse => ({
      text: verse.text,
      reference: verse.reference,
      category: verse.category,
      principle: verse.principle || generatePrinciple(verse),
      application: verse.application || generateApplication(verse),
      defi_relevance: generateDefiRelevance(verse),
      financial_keywords: extractFinancialKeywords(verse.text)
    }));

    // Send to edge function for embedding generation
    const response = await fetch('/api/generate-embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verses: versesToPopulate
      }),
    });

    const result = await response.json();
    console.log('Biblical knowledge populated:', result);
    return result;
  } catch (error) {
    console.error('Error populating biblical knowledge:', error);
    throw error;
  }
};

export const searchBiblicalWisdom = async (query: string, matchThreshold: number = 0.7) => {
  try {
    // Generate embedding for query
    const embeddingResponse = await fetch('/api/generate-embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verses: [{ text: query, reference: '', category: 'query' }]
      }),
    });

    // This would need to be implemented to search using the embedding
    // For now, return a basic text search as fallback
    const { data, error } = await supabase
      .from('biblical_knowledge_base')
      .select('*')
      .textSearch('verse_text', query)
      .limit(5);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching biblical wisdom:', error);
    return [];
  }
};

// Helper functions
const generatePrinciple = (verse: any): string => {
  const principleMap: { [key: string]: string } = {
    wealth: "Sustainable wealth building requires patience and wisdom",
    giving: "Generous giving leads to spiritual and material blessing",
    stewardship: "Faithful management of resources honors God",
    debt: "Debt creates bondage that limits financial freedom",
    work: "Diligent work and honest labor create lasting prosperity",
    planning: "Careful planning and preparation prevent financial disaster",
    investing: "Diversified investments protect against uncertainty",
    contentment: "True wealth comes from contentment, not accumulation",
    taxes: "Civic obligations should be honored while prioritizing God",
    generosity: "Sharing resources creates community and divine favor"
  };
  
  return principleMap[verse.category] || "Biblical wisdom guides all financial decisions";
};

const generateApplication = (verse: any): string => {
  const applicationMap: { [key: string]: string } = {
    wealth: "Build wealth gradually through consistent DeFi strategies and compound growth",
    giving: "Set up automated tithing and charitable giving from your DeFi yields",
    stewardship: "Monitor your investments regularly and make informed decisions",
    debt: "Avoid excessive leverage in DeFi and prioritize debt elimination",
    work: "Research projects thoroughly and contribute value to earn returns",
    planning: "Calculate risks, fees, and potential outcomes before investing",
    investing: "Spread investments across multiple protocols and asset types",
    contentment: "Set reasonable return expectations and avoid FOMO-driven decisions",
    taxes: "Keep detailed records of all crypto transactions for tax compliance",
    generosity: "Use DeFi gains to increase your capacity for charitable impact"
  };
  
  return applicationMap[verse.category] || "Apply this wisdom to your DeFi and financial decisions";
};

const generateDefiRelevance = (verse: any): string => {
  const relevanceMap: { [key: string]: string } = {
    wealth: "Relates to long-term yield farming and liquidity provision strategies",
    giving: "Applicable to charitable DAOs and impact investing protocols",
    stewardship: "Guides responsible DeFi portfolio management and risk assessment",
    debt: "Warns against over-leveraging in lending protocols and margin trading",
    work: "Encourages thorough due diligence and active portfolio management",
    planning: "Essential for calculating impermanent loss and gas fee optimization",
    investing: "Supports multi-protocol diversification and risk management",
    contentment: "Helps avoid speculative trading and maintain steady strategies",
    taxes: "Important for DeFi transaction reporting and compliance",
    generosity: "Encourages profit-sharing and community support through DeFi"
  };
  
  return relevanceMap[verse.category] || "Provides ethical framework for DeFi participation";
};

const extractFinancialKeywords = (text: string): string[] => {
  const keywords = [
    'wealth', 'money', 'riches', 'poor', 'poverty', 'treasure', 'gold', 'silver',
    'invest', 'gain', 'profit', 'loss', 'debt', 'lend', 'borrow', 'interest',
    'tithe', 'give', 'generous', 'charity', 'offering', 'firstfruits',
    'work', 'labor', 'earn', 'wages', 'reward', 'harvest', 'store', 'save',
    'wisdom', 'foolish', 'prudent', 'diligent', 'lazy', 'plan', 'prepare'
  ];
  
  return keywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  );
};
