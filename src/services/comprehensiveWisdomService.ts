import { completeBiblicalFinances, CompleteBiblicalExample, searchExamples, getExamplesByCategory, getRandomExample } from '@/data/completeBibleFinances';
import { FinancialGuidanceRequest, FinancialGuidanceResponse } from '@/types/wisdom';

export interface EnhancedWisdomQuery {
  query: string;
  category?: CompleteBiblicalExample["category"];
  character?: string;
  book?: string;
  testament?: "Old" | "New";
  riskLevel?: "low" | "medium" | "high";
  includeModernParallels?: boolean;
  includeDefiRelevance?: boolean;
}

export interface ComprehensiveWisdomResponse {
  primaryAnswer: string;
  relevantExamples: CompleteBiblicalExample[];
  practicalApplications: string[];
  defiStrategies: {
    protocol: string;
    action: string;
    biblicalBasis: string;
    riskLevel: "low" | "medium" | "high";
  }[];
  modernParallels: string[];
  relatedCharacters: string[];
  wisdomScore: number;
  recommendedActions: string[];
}

/**
 * Comprehensive Biblical Wisdom Service
 * Provides exhaustive biblical financial guidance using every financial example in the Bible
 */
class ComprehensiveWisdomService {
  private examples: CompleteBiblicalExample[] = [];

  constructor() {
    this.examples = completeBiblicalFinances;
  }

  /**
   * Get comprehensive wisdom for any financial query
   */
  public getComprehensiveWisdom(query: EnhancedWisdomQuery): ComprehensiveWisdomResponse {
    // Search for relevant examples
    let relevantExamples = this.findRelevantExamples(query);
    
    // If no specific examples found, get examples by category
    if (relevantExamples.length === 0 && query.category) {
      relevantExamples = getExamplesByCategory(query.category).slice(0, 5);
    }
    
    // If still no examples, get random examples
    if (relevantExamples.length === 0) {
      relevantExamples = [getRandomExample(), getRandomExample(), getRandomExample()];
    }

    const primaryAnswer = this.generatePrimaryAnswer(query, relevantExamples);
    const practicalApplications = this.extractPracticalApplications(relevantExamples);
    const defiStrategies = this.generateDefiStrategies(query, relevantExamples);
    const modernParallels = this.extractModernParallels(relevantExamples);
    const relatedCharacters = this.extractRelatedCharacters(relevantExamples);
    const wisdomScore = this.calculateQueryWisdomScore(query, relevantExamples);
    const recommendedActions = this.generateRecommendedActions(query, relevantExamples);

    return {
      primaryAnswer,
      relevantExamples,
      practicalApplications,
      defiStrategies,
      modernParallels,
      relatedCharacters,
      wisdomScore,
      recommendedActions
    };
  }

  /**
   * Find examples relevant to the query
   */
  private findRelevantExamples(query: EnhancedWisdomQuery): CompleteBiblicalExample[] {
    let examples = searchExamples(query.query);
    
    // Filter by additional criteria
    if (query.category) {
      examples = examples.filter(ex => ex.category === query.category);
    }
    
    if (query.character) {
      examples = examples.filter(ex => 
        ex.character?.toLowerCase().includes(query.character!.toLowerCase())
      );
    }
    
    if (query.book) {
      examples = examples.filter(ex => ex.book === query.book);
    }
    
    if (query.testament) {
      examples = examples.filter(ex => ex.testament === query.testament);
    }
    
    if (query.riskLevel) {
      examples = examples.filter(ex => ex.riskLevel === query.riskLevel);
    }
    
    return examples.slice(0, 10); // Limit to top 10 results
  }

  /**
   * Generate a comprehensive primary answer
   */
  private generatePrimaryAnswer(query: EnhancedWisdomQuery, examples: CompleteBiblicalExample[]): string {
    if (examples.length === 0) {
      return "Based on biblical principles, wisdom comes from seeking God's guidance in all financial matters.";
    }

    const primaryExample = examples[0];
    let answer = `Based on the biblical example of ${primaryExample.character || 'biblical teaching'} in ${primaryExample.book}, `;
    answer += `"${primaryExample.text}" (${primaryExample.reference}). `;
    answer += `This teaches us that ${primaryExample.principle.toLowerCase()}. `;
    
    if (examples.length > 1) {
      answer += `Additionally, other biblical examples show us: `;
      examples.slice(1, 3).forEach(example => {
        answer += `${example.character || 'Scripture'} demonstrates that ${example.principle.toLowerCase()}; `;
      });
    }
    
    answer += `In practical terms, this means: ${primaryExample.application}`;
    
    return answer;
  }

  /**
   * Extract practical applications from examples
   */
  private extractPracticalApplications(examples: CompleteBiblicalExample[]): string[] {
    return examples.map(example => example.application).slice(0, 5);
  }

  /**
   * Generate DeFi strategies based on biblical examples
   */
  private generateDefiStrategies(query: EnhancedWisdomQuery, examples: CompleteBiblicalExample[]): {
    protocol: string;
    action: string;
    biblicalBasis: string;
    riskLevel: "low" | "medium" | "high";
  }[] {
    const strategies = [];
    
    for (const example of examples.slice(0, 3)) {
      let protocol = "Bible.fi";
      let action = "Review biblical principles";
      let riskLevel: "low" | "medium" | "high" = "low";
      
      switch (example.category) {
        case "giving":
          protocol = "Superfluid";
          action = "Set up automated tithing streams";
          riskLevel = "low";
          break;
        case "investing":
          protocol = "Balanced DeFi Portfolio";
          action = "Diversify across multiple protocols";
          riskLevel = "medium";
          break;
        case "saving":
          protocol = "Stablecoin Yields";
          action = "Build emergency reserves";
          riskLevel = "low";
          break;
        case "debt":
          protocol = "Conservative Lending";
          action = "Minimize leverage and borrowing";
          riskLevel = "high";
          break;
        case "stewardship":
          protocol = "Transparent Protocols";
          action = "Choose audited, transparent platforms";
          riskLevel = "low";
          break;
        case "business":
          protocol = "DAO Participation";
          action = "Engage in community governance";
          riskLevel = "medium";
          break;
        default:
          action = example.defiRelevance;
      }
      
      strategies.push({
        protocol,
        action,
        biblicalBasis: `${example.reference}: ${example.principle}`,
        riskLevel
      });
    }
    
    return strategies;
  }

  /**
   * Extract modern parallels from examples
   */
  private extractModernParallels(examples: CompleteBiblicalExample[]): string[] {
    return examples.map(example => example.modernParallel).slice(0, 5);
  }

  /**
   * Extract related characters from examples
   */
  private extractRelatedCharacters(examples: CompleteBiblicalExample[]): string[] {
    const characters = new Set<string>();
    examples.forEach(example => {
      if (example.character) {
        characters.add(example.character);
      }
    });
    return Array.from(characters).slice(0, 5);
  }

  /**
   * Calculate wisdom score based on query and examples
   */
  private calculateQueryWisdomScore(query: EnhancedWisdomQuery, examples: CompleteBiblicalExample[]): number {
    let score = 70; // Base score
    
    // Add points for biblical alignment
    if (examples.length > 0) score += 10;
    if (examples.length > 3) score += 5;
    
    // Add points for good categories
    const goodCategories = ["giving", "stewardship", "planning", "honesty"];
    if (query.category && goodCategories.includes(query.category)) score += 10;
    
    // Subtract points for risky categories
    const riskyCategories = ["debt", "fraud", "corruption"];
    if (query.category && riskyCategories.includes(query.category)) score -= 20;
    
    // Add points for wisdom-seeking keywords
    const wisdomKeywords = ["wisdom", "guidance", "stewardship", "giving", "planning"];
    if (wisdomKeywords.some(keyword => query.query.toLowerCase().includes(keyword))) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommended actions based on examples
   */
  private generateRecommendedActions(query: EnhancedWisdomQuery, examples: CompleteBiblicalExample[]): string[] {
    const actions = [];
    
    // Add category-specific recommendations
    if (examples.some(ex => ex.category === "giving")) {
      actions.push("Set up automated tithing to your church");
      actions.push("Allocate a portion of DeFi gains to charitable causes");
    }
    
    if (examples.some(ex => ex.category === "stewardship")) {
      actions.push("Research protocols thoroughly before investing");
      actions.push("Monitor your investments regularly");
    }
    
    if (examples.some(ex => ex.category === "debt")) {
      actions.push("Minimize leverage in DeFi protocols");
      actions.push("Build an emergency fund before taking risks");
    }
    
    if (examples.some(ex => ex.category === "planning")) {
      actions.push("Create a biblical financial plan");
      actions.push("Set both spiritual and financial goals");
    }
    
    // Add universal recommendations
    actions.push("Study the biblical examples related to your situation");
    actions.push("Seek wise counsel from mature Christians");
    actions.push("Pray for wisdom in your financial decisions");
    
    return actions.slice(0, 7); // Limit to 7 actions
  }

  /**
   * Get financial guidance using the comprehensive system
   */
  public getFinancialGuidance(request: FinancialGuidanceRequest): FinancialGuidanceResponse {
    const query: EnhancedWisdomQuery = {
      query: request.query,
      includeModernParallels: true,
      includeDefiRelevance: true
    };
    
    const comprehensiveResponse = this.getComprehensiveWisdom(query);
    
    return {
      answer: comprehensiveResponse.primaryAnswer,
      relevantScriptures: comprehensiveResponse.relevantExamples.slice(0, 3).map(example => ({
        reference: example.reference,
        text: example.text
      })),
      defiSuggestions: comprehensiveResponse.defiStrategies.map(strategy => ({
        protocol: strategy.protocol,
        action: strategy.action,
        rationale: strategy.biblicalBasis
      }))
    };
  }

  /**
   * Get examples by specific criteria
   */
  public getExamplesByCriteria(criteria: {
    category?: CompleteBiblicalExample["category"];
    character?: string;
    book?: string;
    testament?: "Old" | "New";
    riskLevel?: "low" | "medium" | "high";
    limit?: number;
  }): CompleteBiblicalExample[] {
    let examples = [...this.examples];
    
    if (criteria.category) {
      examples = examples.filter(ex => ex.category === criteria.category);
    }
    
    if (criteria.character) {
      examples = examples.filter(ex => 
        ex.character?.toLowerCase().includes(criteria.character!.toLowerCase())
      );
    }
    
    if (criteria.book) {
      examples = examples.filter(ex => ex.book === criteria.book);
    }
    
    if (criteria.testament) {
      examples = examples.filter(ex => ex.testament === criteria.testament);
    }
    
    if (criteria.riskLevel) {
      examples = examples.filter(ex => ex.riskLevel === criteria.riskLevel);
    }
    
    return examples.slice(0, criteria.limit || 10);
  }

  /**
   * Get all available data for filtering
   */
  public getAvailableFilters() {
    const categories = new Set<string>();
    const characters = new Set<string>();
    const books = new Set<string>();
    
    this.examples.forEach(example => {
      categories.add(example.category);
      if (example.character) characters.add(example.character);
      books.add(example.book);
    });
    
    return {
      categories: Array.from(categories),
      characters: Array.from(characters),
      books: Array.from(books),
      testaments: ["Old", "New"],
      riskLevels: ["low", "medium", "high"]
    };
  }
}

export const comprehensiveWisdomService = new ComprehensiveWisdomService();
export default comprehensiveWisdomService;