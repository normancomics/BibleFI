import { supabase } from '@/integrations/supabase/client';

export interface BiblicalText {
  book: string;
  chapter: number;
  verse: number;
  kjv_text: string;
  hebrew_text?: string;
  greek_text?: string;
  aramaic_text?: string;
  strong_numbers?: string[];
  original_words?: {
    word: string;
    strong_number: string;
    meaning: string;
    transliteration: string;
    part_of_speech: string;
  }[];
  financial_keywords: string[];
  financial_relevance_score: number;
  topic_categories: string[];
}

export interface StrongsConcordance {
  number: string;
  original_word: string;
  transliteration: string;
  pronunciation: string;
  definition: string;
  usage: string;
  language: 'hebrew' | 'greek' | 'aramaic';
}

export class ComprehensiveBiblicalCrawler {
  private readonly FINANCIAL_KEYWORDS = [
    // English Financial Terms
    'tithe', 'tithing', 'tenth', 'money', 'gold', 'silver', 'treasure', 'wealth',
    'rich', 'poor', 'poverty', 'abundance', 'prosperity', 'blessing', 'bless',
    'give', 'giving', 'gift', 'offering', 'sacrifice', 'firstfruits',
    'lend', 'lending', 'borrow', 'borrowing', 'debt', 'debtor', 'creditor',
    'usury', 'interest', 'profit', 'gain', 'loss', 'business', 'trade', 'merchant',
    'tax', 'taxes', 'tribute', 'custom', 'steward', 'stewardship', 'faithful',
    'wise', 'wisdom', 'prudent', 'diligent', 'lazy', 'sluggard', 'work', 'labor',
    'wages', 'hire', 'payment', 'reward', 'inheritance', 'portion',
    
    // Hebrew Financial Terms (transliterated)
    'maaser', 'maasrah', 'kesef', 'zahav', 'nechasim', 'ashir', 'ani', 'evyon',
    'dal', 'nathan', 'natan', 'matanah', 'terumah', 'korban', 'reshit',
    'lavah', 'malveh', 'loveh', 'neshek', 'tarbit', 'sachar', 'peulah',
    'mas', 'mekhes', 'ben-bayit', 'ne-eman', 'chakham', 'chokhmah',
    'amel', 'melakah', 'sakhar', 'yerushah', 'chelek',
    
    // Greek Financial Terms (transliterated)
    'dekate', 'dekatoo', 'argurion', 'chrusos', 'ploutos', 'plousios',
    'ptochos', 'penes', 'didomi', 'doron', 'prosphora', 'thusia',
    'aparche', 'daneizo', 'danistes', 'opheiletes', 'tokos',
    'kerdos', 'emporia', 'emporos', 'telos', 'phoros', 'oikonomos',
    'oikonomia', 'pistos', 'sophia', 'spoudaios', 'ergon', 'kopos',
    'misthos', 'kleronomia', 'meros'
  ];

  private readonly TOPIC_CATEGORIES = [
    'tithing', 'giving', 'generosity', 'offerings', 'firstfruits',
    'lending', 'borrowing', 'debt', 'usury', 'interest',
    'wealth', 'prosperity', 'abundance', 'poverty', 'contentment',
    'stewardship', 'faithfulness', 'wisdom', 'diligence', 'work',
    'business', 'trade', 'commerce', 'partnership', 'taxes',
    'inheritance', 'justice', 'righteousness', 'trust', 'provision'
  ];

  public async crawlCompleteBible(): Promise<void> {
    console.log('Starting comprehensive biblical financial crawl...');
    
    try {
      // Crawl all biblical texts with financial relevance
      await this.crawlKJVBible();
      await this.crawlHebrewTexts();
      await this.crawlGreekTexts();
      await this.crawlAramaicTexts();
      await this.crawlStrongsConcordance();
      
      // Process and categorize financial content
      await this.processFinancialContent();
      await this.generateFinancialEmbeddings();
      
      console.log('Comprehensive biblical crawl completed successfully');
    } catch (error) {
      console.error('Error in comprehensive biblical crawl:', error);
      throw error;
    }
  }

  private async crawlKJVBible(): Promise<void> {
    console.log('Crawling KJV Bible...');
    
    // Mock data for demonstration - in production, this would crawl actual Bible APIs
    const kjvBooks = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
      'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
      'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
      'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
      'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
      'Galatians', 'Ephesians', 'Philippians', 'Colossians',
      '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
      'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
      '1 John', '2 John', '3 John', 'Jude', 'Revelation'
    ];

    for (const book of kjvBooks) {
      await this.processBook(book);
    }
  }

  private async processBook(bookName: string): Promise<void> {
    // In production, this would make actual API calls to Bible services
    // For now, we'll create sample financial verses
    
    const financialVerses = this.getFinancialVersesForBook(bookName);
    
    for (const verse of financialVerses) {
      const processedVerse = await this.processVerse(verse);
      await this.storeVerse(processedVerse);
    }
  }

  private getFinancialVersesForBook(bookName: string): any[] {
    // Sample financial verses for demonstration
    const sampleVerses = {
      'Malachi': [
        {
          chapter: 3,
          verse: 10,
          kjv_text: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.",
          hebrew_text: "הָבִיאוּ אֶת־כָּל־הַמַּעֲשֵׂר אֶל־בֵּית הָאוֹצָר וִיהִי טֶרֶף בְּבֵיתִי וּבְחָנוּנִי נָא בָזֹאת אָמַר יְהוָה צְבָאוֹת אִם־לֹא אֶפְתַּח לָכֶם אֵת אֲרֻבּוֹת הַשָּׁמַיִם וַהֲרִיקֹתִי לָכֶם בְּרָכָה עַד־בְּלִי־דָי׃"
        }
      ],
      'Matthew': [
        {
          chapter: 22,
          verse: 21,
          kjv_text: "They say unto him, Caesar's. Then saith he unto them, Render therefore unto Caesar the things which are Caesar's; and unto God the things that are God's.",
          greek_text: "λέγουσιν αὐτῷ Καίσαρος τότε λέγει αὐτοῖς ἀπόδοτε οὖν τὰ Καίσαρος Καίσαρι καὶ τὰ τοῦ θεοῦ τῷ θεῷ"
        }
      ],
      'Proverbs': [
        {
          chapter: 22,
          verse: 7,
          kjv_text: "The rich ruleth over the poor, and the borrower is servant to the lender.",
          hebrew_text: "עָשִׁיר בְּרָשִׁים יִמְשׁוֹל וְעֶבֶד לֹוֶה לְאִישׁ מַלְוֶה׃"
        }
      ]
    };

    return sampleVerses[bookName] || [];
  }

  private async processVerse(verse: any): Promise<BiblicalText> {
    const financialKeywords = this.extractFinancialKeywords(verse.kjv_text);
    const topicCategories = this.categorizeVerse(verse.kjv_text, financialKeywords);
    const financialRelevance = this.calculateFinancialRelevance(financialKeywords, topicCategories);

    return {
      book: verse.book || 'Unknown',
      chapter: verse.chapter,
      verse: verse.verse,
      kjv_text: verse.kjv_text,
      hebrew_text: verse.hebrew_text,
      greek_text: verse.greek_text,
      aramaic_text: verse.aramaic_text,
      strong_numbers: verse.strong_numbers || [],
      original_words: verse.original_words || [],
      financial_keywords: financialKeywords,
      financial_relevance_score: financialRelevance,
      topic_categories: topicCategories
    };
  }

  private extractFinancialKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    return this.FINANCIAL_KEYWORDS.filter(keyword => 
      words.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))
    );
  }

  private categorizeVerse(text: string, keywords: string[]): string[] {
    const categories: string[] = [];
    
    for (const category of this.TOPIC_CATEGORIES) {
      const categoryKeywords = this.getCategoryKeywords(category);
      if (categoryKeywords.some(keyword => 
        keywords.includes(keyword) || text.toLowerCase().includes(keyword)
      )) {
        categories.push(category);
      }
    }

    return categories;
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'tithing': ['tithe', 'tithing', 'tenth', 'maaser', 'dekate'],
      'giving': ['give', 'giving', 'gift', 'generosity', 'nathan', 'didomi'],
      'lending': ['lend', 'lending', 'loan', 'lavah', 'daneizo'],
      'borrowing': ['borrow', 'borrowing', 'debt', 'loveh', 'opheiletes'],
      'wealth': ['wealth', 'rich', 'riches', 'prosperity', 'ashir', 'plousios'],
      'poverty': ['poor', 'poverty', 'needy', 'ani', 'ptochos'],
      'taxes': ['tax', 'taxes', 'tribute', 'mas', 'telos', 'phoros'],
      'stewardship': ['steward', 'stewardship', 'faithful', 'oikonomos'],
      'business': ['business', 'trade', 'merchant', 'commerce', 'emporia'],
      'work': ['work', 'labor', 'diligent', 'amel', 'ergon']
    };

    return categoryMap[category] || [];
  }

  private calculateFinancialRelevance(keywords: string[], categories: string[]): number {
    const keywordScore = Math.min(keywords.length * 10, 50);
    const categoryScore = Math.min(categories.length * 15, 50);
    return Math.min(keywordScore + categoryScore, 100);
  }

  private async storeVerse(verse: BiblicalText): Promise<void> {
    try {
      const { error } = await supabase
        .from('comprehensive_biblical_texts')
        .insert([
          {
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            kjv_text: verse.kjv_text,
            hebrew_text: verse.hebrew_text ?? null,
            greek_text: verse.greek_text ?? null,
            aramaic_text: verse.aramaic_text ?? null,
            strong_numbers: verse.strong_numbers ?? null,
            original_words: verse.original_words ?? null,
            financial_keywords: verse.financial_keywords ?? null,
            financial_relevance: verse.financial_relevance_score ?? 0,
          },
        ]);

      if (error) {
        console.error('Error storing verse:', error);
      }
    } catch (error) {
      console.error('Error in storeVerse:', error);
    }
  }

  private async crawlHebrewTexts(): Promise<void> {
    console.log('Crawling Hebrew texts...');
    // Implementation for Hebrew text crawling
  }

  private async crawlGreekTexts(): Promise<void> {
    console.log('Crawling Greek texts...');
    // Implementation for Greek text crawling
  }

  private async crawlAramaicTexts(): Promise<void> {
    console.log('Crawling Aramaic texts...');
    // Implementation for Aramaic text crawling
  }

  private async crawlStrongsConcordance(): Promise<void> {
    console.log('Crawling Strongs Concordance...');
    // Implementation for Strong's concordance crawling
  }

  private async processFinancialContent(): Promise<void> {
    console.log('Processing financial content categorization...');
    // Implementation for advanced financial content processing
  }

  private async generateFinancialEmbeddings(): Promise<void> {
    console.log('Generating embeddings for financial content...');
    // Implementation for generating embeddings
  }
}

export const comprehensiveBiblicalCrawler = new ComprehensiveBiblicalCrawler();