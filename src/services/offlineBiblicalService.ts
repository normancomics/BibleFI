import { comprehensiveBibleVerses, ComprehensiveBibleVerse } from '@/data/comprehensiveBibleVerses';

interface OfflineBiblicalResponse {
  answer: string;
  relevantScriptures: Array<{
    reference: string;
    text: string;
    similarity: number;
  }>;
  biblicalPrinciples: string[];
  defiSuggestions?: Array<{
    protocol: string;
    action: string;
    rationale: string;
  }>;
}

export class OfflineBiblicalService {
  private verses: ComprehensiveBibleVerse[];

  constructor() {
    this.verses = comprehensiveBibleVerses;
  }

  /**
   * Search for relevant biblical guidance without needing AI
   */
  public getBiblicalGuidance(query: string): OfflineBiblicalResponse {
    const normalizedQuery = query.toLowerCase();
    
    // Find relevant verses based on keywords and categories
    const relevantVerses = this.findRelevantVerses(normalizedQuery);
    
    // Generate response based on found verses
    const answer = this.generateAnswer(normalizedQuery, relevantVerses);
    const principles = this.extractPrinciples(relevantVerses);
    const defiSuggestions = this.generateDefiSuggestions(normalizedQuery, relevantVerses);
    
    return {
      answer,
      relevantScriptures: relevantVerses.slice(0, 3).map(verse => ({
        reference: verse.reference,
        text: verse.text,
        similarity: this.calculateSimilarity(normalizedQuery, verse.text)
      })),
      biblicalPrinciples: principles,
      defiSuggestions
    };
  }

  private findRelevantVerses(query: string): ComprehensiveBibleVerse[] {
    const scores = this.verses.map(verse => ({
      verse,
      score: this.calculateRelevanceScore(query, verse)
    }));
    
    // Sort by relevance score and return top matches
    return scores
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0)
      .slice(0, 5)
      .map(item => item.verse);
  }

  private calculateRelevanceScore(query: string, verse: ComprehensiveBibleVerse): number {
    let score = 0;
    
    // Check category match
    if (this.matchesCategory(query, verse.category)) {
      score += 50;
    }
    
    // Check keyword matches
    if (verse.financial_keywords) {
      const keywordMatches = verse.financial_keywords.filter(keyword =>
        query.includes(keyword.toLowerCase())
      ).length;
      score += keywordMatches * 20;
    }
    
    // Check text content similarity
    const textSimilarity = this.calculateSimilarity(query, verse.text);
    score += textSimilarity * 10;
    
    // Check principle relevance
    if (verse.principle && this.calculateSimilarity(query, verse.principle) > 0.3) {
      score += 15;
    }
    
    return score;
  }

  private matchesCategory(query: string, category: string): boolean {
    const categoryMappings: Record<string, string[]> = {
      'debt': ['debt', 'borrow', 'loan', 'leverage', 'owe'],
      'giving': ['give', 'tithe', 'donate', 'charity', 'generosity'],
      'stewardship': ['manage', 'steward', 'responsible', 'wise', 'plan'],
      'wealth': ['money', 'rich', 'wealth', 'financial', 'invest'],
      'work': ['work', 'labor', 'job', 'earn', 'income']
    };
    
    const keywords = categoryMappings[category] || [];
    return keywords.some(keyword => query.includes(keyword));
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private generateAnswer(query: string, verses: ComprehensiveBibleVerse[]): string {
    if (verses.length === 0) {
      return "While I don't have specific scripture for your question, I encourage you to seek biblical wisdom through prayer, study, and consultation with wise counselors. Remember that God promises to give wisdom to those who ask (James 1:5).";
    }

    const primaryVerse = verses[0];
    let answer = `According to ${primaryVerse.reference}: "${primaryVerse.text}"`;
    
    if (primaryVerse.principle) {
      answer += `\n\nBiblical Principle: ${primaryVerse.principle}`;
    }
    
    if (primaryVerse.application) {
      answer += `\n\nPractical Application: ${primaryVerse.application}`;
    }
    
    // Add context-specific guidance
    if (query.includes('tithe') || query.includes('give')) {
      answer += `\n\nRemember that tithing is about trusting God with your finances and acknowledging Him as the source of all provision. Consider setting up consistent giving patterns that honor God first.`;
    } else if (query.includes('debt') || query.includes('borrow')) {
      answer += `\n\nBiblical wisdom emphasizes freedom from debt when possible. If you must borrow, do so responsibly and with a clear repayment plan.`;
    } else if (query.includes('invest') || query.includes('defi')) {
      answer += `\n\nWhen investing, including in DeFi protocols, remember to be wise stewards, diversify your investments, and never risk more than you can afford to lose.`;
    }
    
    return answer;
  }

  private extractPrinciples(verses: ComprehensiveBibleVerse[]): string[] {
    const principles = verses
      .map(verse => verse.principle)
      .filter(Boolean)
      .slice(0, 3);
    
    // Add default principles if not enough found
    const defaultPrinciples = ["Faithful Stewardship", "Wise Planning", "Generous Heart"];
    const allPrinciples = [...principles, ...defaultPrinciples];
    
    return [...new Set(allPrinciples)].slice(0, 5);
  }

  private generateDefiSuggestions(query: string, verses: ComprehensiveBibleVerse[]): Array<{
    protocol: string;
    action: string;
    rationale: string;
  }> {
    const suggestions = [];
    
    if (query.includes('tithe') || query.includes('give')) {
      suggestions.push({
        protocol: "Superfluid",
        action: "Set up automated tithing streams",
        rationale: "Automate your giving to ensure consistency and priority in your financial life"
      });
    }
    
    if (query.includes('save') || query.includes('stable')) {
      suggestions.push({
        protocol: "Compound",
        action: "Stake stablecoins for steady yield",
        rationale: "Build your savings through stable, low-risk yield generation"
      });
    }
    
    if (query.includes('invest') || query.includes('grow')) {
      suggestions.push({
        protocol: "Aave",
        action: "Diversified lending strategy",
        rationale: "Follow biblical diversification principles across multiple assets"
      });
    }
    
    return suggestions.slice(0, 3);
  }

  /**
   * Get verses by specific category
   */
  public getVersesByCategory(category: string): ComprehensiveBibleVerse[] {
    return this.verses.filter(verse => verse.category === category);
  }

  /**
   * Get all available categories
   */
  public getAvailableCategories(): string[] {
    const categories = new Set(this.verses.map(verse => verse.category));
    return Array.from(categories);
  }

  /**
   * Search verses by keyword
   */
  public searchByKeyword(keyword: string): ComprehensiveBibleVerse[] {
    const normalizedKeyword = keyword.toLowerCase();
    
    return this.verses.filter(verse => {
      const textMatch = verse.text.toLowerCase().includes(normalizedKeyword);
      const keywordMatch = verse.financial_keywords?.some(k => 
        k.toLowerCase().includes(normalizedKeyword)
      );
      const principleMatch = verse.principle?.toLowerCase().includes(normalizedKeyword);
      
      return textMatch || keywordMatch || principleMatch;
    });
  }
}

export const offlineBiblicalService = new OfflineBiblicalService();