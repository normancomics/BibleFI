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
      // Use basic table query since RPC function may not exist
      const queryBuilder = supabase
        .from('bible_verses')
        .select('*')
        .gte('financial_relevance', query.min_financial_relevance || 0)
        .limit(query.limit_count || 10);

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error searching biblical wisdom:', error);
        return [];
      }

      // Transform to BiblicalWisdomResult format
      return (data || []).map(verse => ({
        id: verse.id,
        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        text: verse.text,
        financial_relevance: verse.financial_relevance || 0,
        wisdom_category: verse.wisdom_category || [],
        defi_keywords: verse.defi_keywords || []
      }));
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
   * Search by text content with intelligent topic detection
   */
  async searchByText(searchTerm: string): Promise<BiblicalWisdomResult[]> {
    const normalizedQuery = searchTerm.toLowerCase();
    
    // Detect key topics and return comprehensive results
    if (this.isTithingQuery(normalizedQuery)) {
      return this.getComprehensiveTithingWisdom();
    }
    
    if (this.isDebtQuery(normalizedQuery)) {
      return this.getComprehensiveDebtWisdom();
    }
    
    if (this.isWealthQuery(normalizedQuery)) {
      return this.getComprehensiveWealthWisdom();
    }
    
    if (this.isGivingQuery(normalizedQuery)) {
      return this.getComprehensiveGivingWisdom();
    }
    
    // Default search
    return this.searchBiblicalWisdom({
      search_term: searchTerm,
      min_financial_relevance: 1,
      limit_count: 20
    });
  }

  /**
   * Get comprehensive tithing wisdom - all major tithing scriptures
   */
  async getComprehensiveTithingWisdom(): Promise<BiblicalWisdomResult[]> {
    const results = await this.searchBiblicalWisdom({
      wisdom_categories: ['tithing', 'firstfruits', 'giving', 'offering'],
      min_financial_relevance: 1,
      limit_count: 50
    });
    
    // If we don't have comprehensive results from DB, provide essential tithing verses
    if (results.length < 5) {
      return this.getEssentialTithingVerses();
    }
    
    return results;
  }

  /**
   * Get comprehensive debt wisdom
   */
  async getComprehensiveDebtWisdom(): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      wisdom_categories: ['debt', 'borrowing', 'lending', 'financial bondage'],
      min_financial_relevance: 1,
      limit_count: 30
    });
  }

  /**
   * Get comprehensive wealth wisdom
   */
  async getComprehensiveWealthWisdom(): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      wisdom_categories: ['wealth', 'riches', 'prosperity', 'contentment'],
      min_financial_relevance: 1,
      limit_count: 30
    });
  }

  /**
   * Get comprehensive giving wisdom
   */
  async getComprehensiveGivingWisdom(): Promise<BiblicalWisdomResult[]> {
    return this.searchBiblicalWisdom({
      wisdom_categories: ['giving', 'generosity', 'charity', 'helping others'],
      min_financial_relevance: 1,
      limit_count: 30
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
   * Query detection helpers
   */
  private isTithingQuery(query: string): boolean {
    const tithingKeywords = ['tithe', 'tithing', 'tenth', '10%', 'ten percent', 'firstfruits', 'storehouse'];
    return tithingKeywords.some(keyword => query.includes(keyword));
  }

  private isDebtQuery(query: string): boolean {
    const debtKeywords = ['debt', 'borrow', 'loan', 'owe', 'owing', 'financial bondage'];
    return debtKeywords.some(keyword => query.includes(keyword));
  }

  private isWealthQuery(query: string): boolean {
    const wealthKeywords = ['wealth', 'rich', 'riches', 'money', 'prosperity', 'financial blessing'];
    return wealthKeywords.some(keyword => query.includes(keyword));
  }

  private isGivingQuery(query: string): boolean {
    const givingKeywords = ['giving', 'generosity', 'donate', 'charity', 'help others', 'alms'];
    return givingKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Essential tithing verses when database is insufficient
   */
  private getEssentialTithingVerses(): BiblicalWisdomResult[] {
    return [
      {
        id: 'malachi-3-10',
        reference: 'Malachi 3:10',
        text: 'Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this," says the Lord Almighty, "and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.',
        financial_relevance: 10,
        wisdom_category: ['tithing', 'testing God', 'blessing'],
        defi_keywords: ['tithe', 'storehouse', 'blessing']
      },
      {
        id: 'leviticus-27-30',
        reference: 'Leviticus 27:30',
        text: 'A tithe of everything from the land, whether grain from the soil or fruit from the trees, belongs to the Lord; it is holy to the Lord.',
        financial_relevance: 10,
        wisdom_category: ['tithing', 'holiness', 'belonging to God'],
        defi_keywords: ['tithe', 'holy', 'belongs to Lord']
      },
      {
        id: 'proverbs-3-9-10',
        reference: 'Proverbs 3:9-10',
        text: 'Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine.',
        financial_relevance: 10,
        wisdom_category: ['firstfruits', 'honoring God', 'blessing'],
        defi_keywords: ['wealth', 'firstfruits', 'overflow']
      },
      {
        id: '2-corinthians-9-7',
        reference: '2 Corinthians 9:7',
        text: 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.',
        financial_relevance: 9,
        wisdom_category: ['cheerful giving', 'heart attitude'],
        defi_keywords: ['giving', 'cheerful', 'decided']
      },
      {
        id: 'matthew-23-23',
        reference: 'Matthew 23:23',
        text: 'Woe to you, teachers of the law and Pharisees, you hypocrites! You give a tenth of your spices—mint, dill and cumin. But you have neglected the more important matters of the law—justice, mercy and faithfulness. You should have practiced the latter, without neglecting the former.',
        financial_relevance: 9,
        wisdom_category: ['tithing', 'justice', 'mercy', 'faithfulness'],
        defi_keywords: ['tenth', 'justice', 'mercy']
      }
    ];
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