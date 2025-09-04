import { supabase } from "@/integrations/supabase/client";

export interface BiblicalVerse {
  id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  testament: 'Old' | 'New';
  financial_relevance: number;
  wisdom_category: string[];
  defi_keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface BiblicalWisdomQuery {
  search_term?: string;
  wisdom_categories?: string[];
  min_financial_relevance?: number;
  limit_count?: number;
}

export interface BiblicalWisdomResult {
  id: string;
  reference: string;
  text: string;
  financial_relevance: number;
  wisdom_category: string[];
  defi_keywords: string[];
}

class ComprehensiveBiblicalService {
  
  /**
   * Search biblical wisdom using the comprehensive database
   */
  async searchBiblicalWisdom(query: BiblicalWisdomQuery): Promise<BiblicalWisdomResult[]> {
    try {
      const { data, error } = await supabase.rpc('search_biblical_wisdom', {
        search_term: query.search_term || null,
        wisdom_categories: query.wisdom_categories || null,
        min_financial_relevance: query.min_financial_relevance || 0,
        limit_count: query.limit_count || 10
      });

      if (error) {
        console.error('Error searching biblical wisdom:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchBiblicalWisdom:', error);
      return [];
    }
  }

  /**
   * Get wisdom for specific DeFi actions
   */
  async getWisdomForDefiAction(action: string): Promise<BiblicalWisdomResult[]> {
    const defiKeywords = this.getDefiKeywords(action);
    return this.searchBiblicalWisdom({
      wisdom_categories: defiKeywords,
      min_financial_relevance: 7,
      limit_count: 3
    });
  }

  /**
   * Get daily scripture with financial relevance
   */
  async getDailyScripture(): Promise<BiblicalWisdomResult | null> {
    const results = await this.searchBiblicalWisdom({
      min_financial_relevance: 8,
      limit_count: 1
    });
    return results[0] || null;
  }

  /**
   * Get wisdom by category
   */
  async getWisdomByCategory(category: string): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      wisdom_categories: [category],
      min_financial_relevance: 5,
      limit_count: 5
    });
  }

  /**
   * Get high-relevance financial verses
   */
  async getTopFinancialWisdom(limit: number = 10): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      min_financial_relevance: 9,
      limit_count: limit
    });
  }

  /**
   * Search by text content
   */
  async searchByText(searchTerm: string): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      search_term: searchTerm,
      min_financial_relevance: 1,
      limit_count: 20
    });
  }

  /**
   * Get wisdom for tithing/giving
   */
  async getTithingWisdom(): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      wisdom_categories: ['tithing', 'generosity'],
      min_financial_relevance: 6,
      limit_count: 5
    });
  }

  /**
   * Get wisdom for staking/investing
   */
  async getStakingWisdom(): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      wisdom_categories: ['patience', 'planning', 'diligence'],
      min_financial_relevance: 7,
      limit_count: 5
    });
  }

  /**
   * Get wisdom for risk management
   */
  async getRiskManagementWisdom(): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      wisdom_categories: ['diversification', 'risk management'],
      min_financial_relevance: 8,
      limit_count: 5
    });
  }

  /**
   * Get contextual wisdom for user actions
   */
  async getContextualWisdom(context: {
    action: string;
    amount?: number;
    tokenType?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  }): Promise<BiblicalWisdomResult[]> {
    let wisdomCategories: string[] = [];
    let minRelevance = 5;

    switch (context.action) {
      case 'tithe':
        wisdomCategories = ['tithing', 'generosity'];
        minRelevance = 8;
        break;
      case 'stake':
        wisdomCategories = ['patience', 'planning'];
        minRelevance = 7;
        break;
      case 'swap':
        wisdomCategories = ['planning', 'patience'];
        minRelevance = 6;
        break;
      case 'lend':
        wisdomCategories = ['stewardship', 'faithfulness'];
        minRelevance = 7;
        break;
      case 'borrow':
        wisdomCategories = ['debt management', 'caution'];
        minRelevance = 8;
        break;
      case 'farm':
        wisdomCategories = ['gradual growth', 'patience'];
        minRelevance = 7;
        break;
      default:
        wisdomCategories = ['wisdom', 'planning'];
        minRelevance = 5;
    }

    // Adjust for risk level
    if (context.riskLevel === 'high') {
      wisdomCategories.push('risk management');
      minRelevance = Math.max(minRelevance, 8);
    }

    return this.searchBiblicalWisdom({
      wisdom_categories: wisdomCategories,
      min_financial_relevance: minRelevance,
      limit_count: 3
    });
  }

  /**
   * Add new biblical verse to the database
   */
  async addBiblicalVerse(verse: Omit<BiblicalVerse, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bible_verses')
        .insert([verse]);

      if (error) {
        console.error('Error adding biblical verse:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addBiblicalVerse:', error);
      return false;
    }
  }

  /**
   * Get DeFi keywords for different actions
   */
  private getDefiKeywords(action: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'staking': ['staking', 'long-term', 'patience'],
      'yield_farming': ['yield farming', 'farming', 'gradual growth'],
      'swapping': ['planning', 'exchange', 'wisdom'],
      'lending': ['lending', 'stewardship', 'faithfulness'],
      'borrowing': ['borrowing', 'debt management', 'caution'],
      'tithing': ['tithing', 'generosity', 'giving'],
      'saving': ['planning', 'diligence', 'stewardship'],
      'investing': ['long-term', 'patience', 'planning'],
      'diversification': ['diversification', 'risk management', 'wisdom']
    };

    return keywordMap[action] || ['wisdom', 'planning'];
  }

  /**
   * Format reference for display
   */
  formatReference(verse: BiblicalWisdomResult): string {
    return verse.reference;
  }

  /**
   * Get wisdom score for a particular decision
   */
  calculateWisdomScore(context: {
    isGenerousGiving: boolean;
    isDiversified: boolean;
    hasPatience: boolean;
    seeksBiblicalGuidance: boolean;
    avoidsGreed: boolean;
  }): number {
    let score = 0;
    
    if (context.isGenerousGiving) score += 25;
    if (context.isDiversified) score += 20;
    if (context.hasPatience) score += 20;
    if (context.seeksBiblicalGuidance) score += 25;
    if (context.avoidsGreed) score += 10;

    return Math.min(score, 100);
  }
}

export const comprehensiveBiblicalService = new ComprehensiveBiblicalService();