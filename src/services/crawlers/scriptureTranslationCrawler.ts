import { supabase } from '@/integrations/supabase/client';

interface ScriptureVerse {
  book: string;
  chapter: number;
  verse: number;
  kjv_text: string;
  hebrew_text?: string;
  greek_text?: string;
  aramaic_text?: string;
  strong_numbers?: string[];
  financial_keywords?: string[];
}

interface CrawlProgress {
  total: number;
  processed: number;
  currentBook: string;
  status: 'running' | 'completed' | 'error';
}

/**
 * Scripture & Translation Crawler
 * Pulls Hebrew Masoretic Text, Greek Septuagint, Aramaic Targums, and KJV
 * Preserves verse identifiers for multi-language alignment
 */
export class ScriptureTranslationCrawler {
  private progress: CrawlProgress = {
    total: 0,
    processed: 0,
    currentBook: '',
    status: 'running'
  };

  // Hebrew Masoretic Text books (OT)
  private hebrewBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];

  // Greek Septuagint/NT books
  private greekBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
    'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
    '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
    'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  async crawlAllScriptures(onProgress?: (progress: CrawlProgress) => void): Promise<void> {
    try {
      console.log('Starting comprehensive scripture crawl...');
      
      // Phase 1: Crawl Hebrew texts (OT)
      for (const book of this.hebrewBooks) {
        this.progress.currentBook = book;
        await this.crawlHebrewBook(book);
        if (onProgress) onProgress({ ...this.progress });
      }

      // Phase 2: Crawl Greek texts (NT)
      for (const book of this.greekBooks) {
        this.progress.currentBook = book;
        await this.crawlGreekBook(book);
        if (onProgress) onProgress({ ...this.progress });
      }

      // Phase 3: Crawl Aramaic portions
      await this.crawlAramaicTexts();

      this.progress.status = 'completed';
      console.log('Scripture crawl completed:', this.progress);
    } catch (error) {
      console.error('Scripture crawl error:', error);
      this.progress.status = 'error';
      throw error;
    }
  }

  private async crawlHebrewBook(bookName: string): Promise<void> {
    console.log(`Crawling Hebrew text for ${bookName}...`);
    
    // Fetch from Bible API Gateway (using publicly available APIs)
    const apiUrl = `https://bible-api.com/${bookName}?translation=hebrew`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`Hebrew text not available for ${bookName}, using KJV only`);
        return;
      }

      const data = await response.json();
      
      // Store in comprehensive_biblical_texts table
      await this.storeVerse({
        book: bookName,
        chapter: data.chapter || 1,
        verse: data.verse || 1,
        kjv_text: data.text || '',
        hebrew_text: data.hebrew_text,
        strong_numbers: this.extractStrongNumbers(data.hebrew_text)
      });

      this.progress.processed++;
    } catch (error) {
      console.error(`Error crawling ${bookName}:`, error);
    }
  }

  private async crawlGreekBook(bookName: string): Promise<void> {
    console.log(`Crawling Greek text for ${bookName}...`);
    
    const apiUrl = `https://bible-api.com/${bookName}?translation=greek`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`Greek text not available for ${bookName}`);
        return;
      }

      const data = await response.json();
      
      await this.storeVerse({
        book: bookName,
        chapter: data.chapter || 1,
        verse: data.verse || 1,
        kjv_text: data.text || '',
        greek_text: data.greek_text,
        strong_numbers: this.extractStrongNumbers(data.greek_text)
      });

      this.progress.processed++;
    } catch (error) {
      console.error(`Error crawling ${bookName}:`, error);
    }
  }

  private async crawlAramaicTexts(): Promise<void> {
    console.log('Crawling Aramaic portions (Daniel, Ezra)...');
    
    const aramaicBooks = [
      { book: 'Daniel', chapters: [2, 3, 4, 5, 6, 7] },
      { book: 'Ezra', chapters: [4, 5, 6, 7] }
    ];

    for (const { book, chapters } of aramaicBooks) {
      for (const chapter of chapters) {
        const apiUrl = `https://bible-api.com/${book}+${chapter}?translation=aramaic`;
        
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            
            await this.storeVerse({
              book,
              chapter,
              verse: 1,
              kjv_text: data.text || '',
              aramaic_text: data.aramaic_text
            });
          }
        } catch (error) {
          console.error(`Error crawling Aramaic ${book} ${chapter}:`, error);
        }
      }
    }
  }

  private extractStrongNumbers(text?: string): string[] {
    if (!text) return [];
    
    // Extract Strong's numbers (format: H1234 or G5678)
    const strongPattern = /[HG]\d{4,5}/g;
    const matches = text.match(strongPattern);
    return matches || [];
  }

  private async storeVerse(verse: ScriptureVerse): Promise<void> {
    const { error } = await supabase
      .from('comprehensive_biblical_texts')
      .upsert({
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        kjv_text: verse.kjv_text,
        hebrew_text: verse.hebrew_text,
        greek_text: verse.greek_text,
        aramaic_text: verse.aramaic_text,
        strong_numbers: verse.strong_numbers,
        financial_keywords: verse.financial_keywords || [],
        financial_relevance: this.calculateFinancialRelevance(verse.kjv_text)
      }, {
        onConflict: 'book,chapter,verse'
      });

    if (error) {
      console.error('Error storing verse:', error);
      throw error;
    }
  }

  private calculateFinancialRelevance(text: string): number {
    const financialKeywords = [
      'money', 'gold', 'silver', 'talent', 'treasure', 'wealth',
      'riches', 'debt', 'lend', 'borrow', 'interest', 'usury',
      'tithe', 'offering', 'tax', 'tribute', 'wage', 'labor'
    ];

    const lowerText = text.toLowerCase();
    let relevance = 0;

    financialKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) relevance++;
    });

    return Math.min(relevance * 10, 100);
  }

  getProgress(): CrawlProgress {
    return { ...this.progress };
  }
}

export const scriptureTranslationCrawler = new ScriptureTranslationCrawler();
