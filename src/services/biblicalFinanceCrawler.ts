import { supabase } from '@/integrations/supabase/client';

export interface BiblicalFinanceVerse {
  id?: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  testament: string;
  financial_relevance: number; // 1-10 scale
  wisdom_category: string[];
  defi_keywords: string[];
  financial_principle: string;
  modern_application: string;
  created_at?: string;
  updated_at?: string;
}

export interface CrawlerStats {
  totalVerses: number;
  financialVerses: number;
  categoriesFound: number;
  keywordsExtracted: number;
  booksProcessed: number;
}

export class BiblicalFinanceCrawlerService {
  // Comprehensive financial keywords for verse identification
  private static readonly FINANCIAL_KEYWORDS = [
    // Money & Currency
    'money', 'coin', 'coins', 'silver', 'gold', 'treasure', 'riches', 'wealth', 'precious',
    'currency', 'denarius', 'shekel', 'talent', 'mite', 'penny', 'farthing',
    
    // Giving & Tithing
    'tithe', 'tithes', 'tithing', 'offering', 'offerings', 'give', 'giving', 'gave', 'given',
    'donate', 'donation', 'charity', 'alms', 'firstfruits', 'sacrifice', 'generous', 'generosity',
    
    // Lending & Borrowing
    'lend', 'lending', 'lender', 'borrow', 'borrowing', 'borrower', 'debt', 'debtor', 'creditor',
    'loan', 'interest', 'usury', 'pledge', 'surety', 'guarantee', 'mortgage',
    
    // Trading & Business
    'trade', 'trading', 'trader', 'merchant', 'marketplace', 'market', 'buy', 'buying', 'sell',
    'selling', 'seller', 'business', 'profit', 'loss', 'gain', 'investment', 'invest',
    'commerce', 'commercial', 'exchange', 'transaction',
    
    // Work & Labor
    'work', 'working', 'worker', 'labor', 'laborer', 'wage', 'wages', 'salary', 'hire', 'hired',
    'employment', 'job', 'occupation', 'craft', 'skill', 'trade', 'profession',
    
    // Stewardship & Management
    'steward', 'stewardship', 'manage', 'management', 'manager', 'overseer', 'administrator',
    'responsible', 'responsibility', 'faithful', 'faithfulness', 'account', 'accounting',
    
    // Poverty & Prosperity
    'poor', 'poverty', 'needy', 'rich', 'prosperity', 'prosper', 'abundant', 'abundance',
    'blessed', 'blessing', 'provision', 'provide', 'supply', 'need', 'wants',
    
    // Taxes & Government
    'tax', 'taxes', 'tribute', 'census', 'government', 'authority', 'ruler', 'king', 'caesar',
    'render', 'due', 'custom', 'toll', 'revenue',
    
    // Modern DeFi Concepts (biblical equivalents)
    'store', 'storing', 'storehouse', 'treasury', 'bank', 'deposit', 'withdraw', 'save', 'saving',
    'inherit', 'inheritance', 'legacy', 'seed', 'sow', 'sowing', 'reap', 'reaping', 'harvest',
    'multiply', 'increase', 'decrease', 'yield', 'return', 'reward'
  ];

  // Biblical books most relevant to finance
  private static readonly FINANCIAL_BOOKS = [
    'Proverbs', 'Ecclesiastes', 'Matthew', 'Luke', 'Mark', 'John', 'Acts', 
    '1 Timothy', '2 Timothy', 'James', 'Deuteronomy', 'Leviticus', 
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Nehemiah',
    'Malachi', '2 Corinthians', 'Philippians', 'Hebrews'
  ];

  // Wisdom categories for financial verses
  private static readonly WISDOM_CATEGORIES = [
    'stewardship', 'generosity', 'contentment', 'work_ethic', 'debt_management',
    'investment_wisdom', 'poverty_care', 'wealth_responsibility', 'tithing_principle',
    'business_ethics', 'tax_obligations', 'saving_provision', 'lending_borrowing',
    'financial_integrity', 'prosperity_theology', 'money_idolatry_warning'
  ];

  static async crawlAllFinancialVerses(): Promise<CrawlerStats> {
    console.log('Starting comprehensive biblical finance verse crawl...');
    
    const stats: CrawlerStats = {
      totalVerses: 0,
      financialVerses: 0,
      categoriesFound: 0,
      keywordsExtracted: 0,
      booksProcessed: 0
    };

    try {
      // First, get all existing verses from bible_verses table
      const { data: existingVerses, error: fetchError } = await supabase
        .from('bible_verses')
        .select('*');

      if (fetchError) {
        console.error('Error fetching existing verses:', fetchError);
        throw fetchError;
      }

      if (!existingVerses) {
        console.log('No verses found in database');
        return stats;
      }

      stats.totalVerses = existingVerses.length;
      console.log(`Processing ${stats.totalVerses} verses...`);

      const financialVerses: BiblicalFinanceVerse[] = [];
      const processedBooks = new Set<string>();

      for (const verse of existingVerses) {
        processedBooks.add(verse.book_name);
        
        // Check if verse contains financial keywords
        const verseText = verse.text.toLowerCase();
        const foundKeywords = this.FINANCIAL_KEYWORDS.filter(keyword => 
          verseText.includes(keyword.toLowerCase())
        );

        if (foundKeywords.length > 0) {
          // Calculate financial relevance score (1-10)
          const relevanceScore = Math.min(10, Math.max(1, 
            foundKeywords.length + 
            (this.FINANCIAL_BOOKS.includes(verse.book_name) ? 2 : 0) +
            (verseText.includes('money') || verseText.includes('tithe') ? 3 : 0)
          ));

          // Determine wisdom categories
          const categories = this.determineWisdomCategories(verseText, foundKeywords);
          
          // Generate financial principle and modern application
          const { principle, application } = this.generateFinancialInsights(
            verse.text, 
            foundKeywords, 
            categories
          );

          const financialVerse: BiblicalFinanceVerse = {
            book_name: verse.book_name,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
            version: verse.version || 'ESV',
            testament: verse.testament,
            financial_relevance: relevanceScore,
            wisdom_category: categories,
            defi_keywords: foundKeywords,
            financial_principle: principle,
            modern_application: application
          };

          financialVerses.push(financialVerse);
          stats.financialVerses++;
        }
      }

      stats.booksProcessed = processedBooks.size;
      stats.categoriesFound = this.WISDOM_CATEGORIES.length;
      stats.keywordsExtracted = this.FINANCIAL_KEYWORDS.length;

      // Update existing verses with financial relevance data
      console.log(`Updating ${financialVerses.length} verses with financial data...`);
      
      for (const verse of financialVerses) {
        const { error: updateError } = await supabase
          .from('bible_verses')
          .update({
            financial_relevance: verse.financial_relevance,
            wisdom_category: verse.wisdom_category,
            defi_keywords: verse.defi_keywords
          })
          .eq('book_name', verse.book_name)
          .eq('chapter', verse.chapter)
          .eq('verse', verse.verse);

        if (updateError) {
          console.error('Error updating verse:', updateError);
        }
      }

      console.log('Biblical finance crawl completed successfully!');
      return stats;

    } catch (error) {
      console.error('Error in biblical finance crawler:', error);
      throw error;
    }
  }

  private static determineWisdomCategories(verseText: string, keywords: string[]): string[] {
    const categories: string[] = [];
    const text = verseText.toLowerCase();

    // Stewardship
    if (keywords.some(k => ['steward', 'manage', 'faithful', 'responsible'].includes(k)) ||
        text.includes('faithful') || text.includes('steward')) {
      categories.push('stewardship');
    }

    // Generosity
    if (keywords.some(k => ['give', 'giving', 'generous', 'charity', 'alms'].includes(k))) {
      categories.push('generosity');
    }

    // Tithing
    if (keywords.some(k => ['tithe', 'offering', 'firstfruits'].includes(k))) {
      categories.push('tithing_principle');
    }

    // Work ethic
    if (keywords.some(k => ['work', 'labor', 'wage'].includes(k))) {
      categories.push('work_ethic');
    }

    // Debt management
    if (keywords.some(k => ['debt', 'borrow', 'lend', 'interest'].includes(k))) {
      categories.push('debt_management');
    }

    // Wealth responsibility
    if (keywords.some(k => ['rich', 'wealth', 'treasure'].includes(k))) {
      categories.push('wealth_responsibility');
    }

    // Poverty care
    if (keywords.some(k => ['poor', 'needy'].includes(k))) {
      categories.push('poverty_care');
    }

    // Business ethics
    if (keywords.some(k => ['trade', 'merchant', 'honest', 'just'].includes(k))) {
      categories.push('business_ethics');
    }

    // Tax obligations
    if (keywords.some(k => ['tax', 'tribute', 'caesar', 'render'].includes(k))) {
      categories.push('tax_obligations');
    }

    // Investment wisdom
    if (keywords.some(k => ['seed', 'sow', 'reap', 'harvest', 'multiply'].includes(k))) {
      categories.push('investment_wisdom');
    }

    // Contentment
    if (text.includes('content') || text.includes('sufficient')) {
      categories.push('contentment');
    }

    // Money idolatry warning
    if (text.includes('mammon') || text.includes('love of money') || 
        (text.includes('money') && text.includes('root'))) {
      categories.push('money_idolatry_warning');
    }

    return categories.length > 0 ? categories : ['financial_integrity'];
  }

  private static generateFinancialInsights(
    verseText: string, 
    keywords: string[], 
    categories: string[]
  ): { principle: string; application: string } {
    // Generate principle based on categories and keywords
    let principle = '';
    let application = '';

    if (categories.includes('stewardship')) {
      principle = 'God entrusts us with resources to manage faithfully for His kingdom purposes.';
      application = 'Practice transparent financial management, budget responsibly, and invest in eternal values through DeFi protocols that align with biblical principles.';
    } else if (categories.includes('generosity')) {
      principle = 'Generous giving reflects God\'s character and creates blessing for both giver and receiver.';
      application = 'Use automated giving through Superfluid streams, set up recurring donations to churches, and participate in DeFi yield farming that funds charitable causes.';
    } else if (categories.includes('tithing_principle')) {
      principle = 'The tithe represents our acknowledgment that all resources belong to God.';
      application = 'Implement smart contract tithing through Bible.fi, use DeFi protocols to automatically allocate first 10% of yields to church giving.';
    } else if (categories.includes('debt_management')) {
      principle = 'Debt should be approached with wisdom, caution, and commitment to repayment.';
      application = 'Use DeFi lending protocols responsibly, maintain healthy collateralization ratios, and avoid over-leveraging in yield farming strategies.';
    } else if (categories.includes('work_ethic')) {
      principle = 'Honest work deserves fair compensation and should serve others.';
      application = 'Participate in DeFi governance tokens through active contribution, stake responsibly in protocols that create value, and support fair tokenomics.';
    } else if (categories.includes('investment_wisdom')) {
      principle = 'Wise investment requires patience, diversification, and long-term perspective.';
      application = 'Dollar-cost average into blue-chip DeFi protocols, diversify across multiple chains like Base and Arbitrum, and reinvest yields strategically.';
    } else {
      principle = 'Biblical financial wisdom emphasizes integrity, faithfulness, and service to others.';
      application = 'Apply biblical principles to DeFi investing, prioritize protocols with strong ethics, and use profits to advance kingdom purposes.';
    }

    return { principle, application };
  }

  // Search for specific financial topics
  static async searchFinancialVerses(
    query: string,
    categories?: string[],
    minRelevance?: number
  ): Promise<BiblicalFinanceVerse[]> {
    try {
      let supabaseQuery = supabase
        .from('bible_verses')
        .select('*')
        .gt('financial_relevance', minRelevance || 0);

      if (query) {
        supabaseQuery = supabaseQuery.ilike('text', `%${query}%`);
      }

      if (categories && categories.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('wisdom_category', categories);
      }

      const { data, error } = await supabaseQuery
        .order('financial_relevance', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(verse => ({
        ...verse,
        financial_principle: 'Biblical financial wisdom from Scripture',
        modern_application: 'Apply biblical principles to modern financial decisions'
      }));
    } catch (error) {
      console.error('Error searching financial verses:', error);
      return [];
    }
  }

  // Get verses by DeFi keyword relevance
  static async getDefiRelevantVerses(defiKeyword: string): Promise<BiblicalFinanceVerse[]> {
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .contains('defi_keywords', [defiKeyword])
        .order('financial_relevance', { ascending: false });

      if (error) throw error;
      return (data || []).map(verse => ({
        ...verse,
        financial_principle: 'Biblical wisdom for DeFi applications',
        modern_application: 'Use this verse to guide DeFi investment decisions'
      }));
    } catch (error) {
      console.error('Error getting DeFi relevant verses:', error);
      return [];
    }
  }
}