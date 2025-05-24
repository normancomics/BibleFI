
import { financialVerses, BibleVerse, getVersesByCategory, getRandomVerseByCategory } from '@/data/bibleVerses';
import { FinancialGuidanceRequest, FinancialGuidanceResponse, BiblicalPrinciple } from '@/types/wisdom';

// Define types for our wisdom engine
export interface DefiProtocolRecommendation {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  yield: string;
  biblicalPrinciple: string;
  verseReference: string;
}

export interface WisdomScoreFactors {
  diversification: number; // 0-100
  generosity: number; // 0-100
  risk: number; // 0-100 (lower is better)
  planning: number; // 0-100
  contentment: number; // 0-100
  stewardship: number; // 0-100
}

/**
 * Biblical Wisdom Engine
 * Provides financial guidance based on biblical principles
 */
class BiblicalWisdomService {
  private principles: BiblicalPrinciple[] = [];
  private loadedVerses: BibleVerse[] = [];

  constructor() {
    this.loadedVerses = financialVerses;
    this.initializePrinciples();
  }

  // Initialize wisdom principles from verses
  private initializePrinciples(): void {
    this.principles = this.loadedVerses
      .filter(verse => verse.principle && verse.application)
      .map(verse => ({
        id: verse.key,
        verse: verse.text,
        reference: verse.reference,
        principle: verse.principle || "",
        application: verse.application || "",
        defiRelevance: this.generateDefiRelevance(verse.category)
      }));
  }

  // Generate DeFi relevance based on verse category
  private generateDefiRelevance(category: BibleVerse['category']): string {
    switch(category) {
      case 'wealth':
        return "Focus on sustainable yield farming rather than speculative gains";
      case 'giving':
        return "Allocate a percentage of yields to ministry support";
      case 'work':
        return "Apply diligence in researching protocols and monitoring positions";
      case 'stewardship':
        return "Prioritize security audits and manage risk across your portfolio";
      case 'taxes':
        return "Maintain clear records for compliant reporting";
      case 'debt':
        return "Use leverage cautiously; maintain healthy collateralization ratios";
      case 'contentment':
        return "Set reasonable yield targets; avoid chasing unsustainable returns";
      case 'generosity':
        return "Consider impact investments that combine returns with ministry support";
      case 'planning':
        return "Develop a clear investment thesis before deploying capital";
      case 'investing':
        return "Diversify across multiple protocols and token types";
      default:
        return "Apply biblical wisdom to make sound financial decisions";
    }
  }

  // Get all wisdom principles
  public getAllPrinciples(): BiblicalPrinciple[] {
    return this.principles;
  }

  // Get principles by category
  public getPrinciplesByCategory(category: BibleVerse['category']): BiblicalPrinciple[] {
    const verses = getVersesByCategory(category);
    return verses
      .filter(verse => verse.principle && verse.application)
      .map(verse => ({
        id: verse.key,
        verse: verse.text,
        reference: verse.reference,
        principle: verse.principle || "",
        application: verse.application || "",
        defiRelevance: this.generateDefiRelevance(category)
      }));
  }

  // Get personalized financial guidance based on user query
  public getFinancialGuidance(request: FinancialGuidanceRequest): FinancialGuidanceResponse {
    // In a real implementation, this would use NLP to analyze the query
    // and return relevant biblical wisdom
    
    // Simple keyword matching for this implementation
    const lowerQuery = request.query.toLowerCase();
    
    const keywords = {
      investing: ['invest', 'stock', 'bond', 'market', 'return', 'yield'],
      saving: ['save', 'saving', 'emergency', 'fund', 'reserve'],
      debt: ['debt', 'loan', 'borrow', 'mortgage', 'credit'],
      giving: ['give', 'giving', 'tithe', 'charity', 'donate'],
      work: ['work', 'job', 'career', 'business', 'earn'],
      planning: ['plan', 'budget', 'goal', 'future', 'retire']
    };
    
    // Determine the primary category of the query
    let matchedCategory: BibleVerse['category'] = 'wealth';
    let maxMatches = 0;
    
    for (const [category, words] of Object.entries(keywords)) {
      const matches = words.filter(word => lowerQuery.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedCategory = category as BibleVerse['category'];
      }
    }
    
    // Get relevant verses
    const verses = getVersesByCategory(matchedCategory);
    const selectedVerses = verses.length > 3 
      ? verses.slice(0, 3) 
      : verses;
    
    // Generate DeFi suggestions based on the category
    const defiSuggestions = this.generateDefiSuggestions(matchedCategory, request.context);
    
    return {
      answer: this.generateAnswer(matchedCategory, request.context),
      relevantScriptures: selectedVerses.map(verse => ({
        reference: verse.reference,
        text: verse.text
      })),
      defiSuggestions
    };
  }
  
  // Generate an answer based on the category and context
  private generateAnswer(category: BibleVerse['category'], context?: any): string {
    const verse = getRandomVerseByCategory(category);
    
    let baseAnswer = `Based on biblical principles, particularly ${verse.reference}: "${verse.text}" `;
    
    switch(category) {
      case 'investing':
        baseAnswer += "Scripture teaches us to be diligent and wise with investments, diversifying our holdings as Ecclesiastes suggests. Consider steady, sustainable approaches rather than high-risk speculation.";
        break;
      case 'debt':
        baseAnswer += "The Bible cautions us about debt, noting that 'the borrower is slave to the lender.' Focus on minimizing debt and building ownership positions instead.";
        break;
      case 'giving':
        baseAnswer += "Generosity is at the heart of biblical finance. Consider setting up automatic tithing and exploring ways to support ministries through your financial activities.";
        break;
      case 'wealth':
        baseAnswer += "Wealth itself is not evil, but Scripture warns about the love of money. Approach wealth-building with the right heart - as a steward rather than an owner.";
        break;
      default:
        baseAnswer += "Scripture provides timeless wisdom for financial matters. Remember that everything ultimately belongs to God, and we are called to be faithful stewards.";
    }
    
    // Add context-specific advice if available
    if (context && context.walletBalance) {
      baseAnswer += " Based on your current holdings, consider a balanced approach that includes both giving and prudent investment.";
    }
    
    return baseAnswer;
  }
  
  // Generate DeFi suggestions based on biblical principles
  private generateDefiSuggestions(category: BibleVerse['category'], context?: any): {protocol: string, action: string, rationale: string}[] {
    const suggestions = [];
    
    switch(category) {
      case 'investing':
        suggestions.push({
          protocol: "Superfluid",
          action: "Set up a diversified streaming investment",
          rationale: "Aligns with Ecclesiastes 11:2 on diversification, creating steady, consistent returns"
        });
        suggestions.push({
          protocol: "Base Stablecoin Yields",
          action: "Allocate funds to stablecoin yields",
          rationale: "Follows the principle of steady accumulation from Proverbs 13:11"
        });
        break;
        
      case 'giving':
        suggestions.push({
          protocol: "Daimo",
          action: "Set up recurring tithing to your church",
          rationale: "Fulfills the principle of firstfruits giving from Proverbs 3:9-10"
        });
        suggestions.push({
          protocol: "Superfluid",
          action: "Create a continuous giving stream to missions",
          rationale: "Embodies the 'cheerful giver' principle from 2 Corinthians 9:7"
        });
        break;
        
      case 'debt':
        suggestions.push({
          protocol: "Bible.fi Savings",
          action: "Build an emergency fund before taking on leverage",
          rationale: "Follows Proverbs 22:7's warning about debt bondage"
        });
        break;
        
      default:
        suggestions.push({
          protocol: "Bible.fi Dashboard",
          action: "Review your biblical financial wisdom score",
          rationale: "Helps ensure your finances align with scriptural principles"
        });
    }
    
    return suggestions;
  }
  
  // Calculate a wisdom score for the user based on their actions
  public calculateWisdomScore(userActions: WisdomScoreFactors): {
    score: number;
    strengths: string[];
    improvements: string[];
    verseGuidance: BibleVerse;
  } {
    const { diversification, generosity, risk, planning, contentment, stewardship } = userActions;
    
    // Calculate weighted score
    const totalScore = Math.round(
      (diversification * 0.15) +
      (generosity * 0.25) +
      ((100 - risk) * 0.15) + // Lower risk is better
      (planning * 0.15) +
      (contentment * 0.15) +
      (stewardship * 0.15)
    );
    
    // Identify strengths (top 2 scores)
    const factors = [
      { name: 'diversification', score: diversification },
      { name: 'generosity', score: generosity },
      { name: 'risk management', score: 100 - risk },
      { name: 'planning', score: planning },
      { name: 'contentment', score: contentment },
      { name: 'stewardship', score: stewardship }
    ];
    
    const sortedFactors = [...factors].sort((a, b) => b.score - a.score);
    const strengths = sortedFactors.slice(0, 2).map(f => f.name);
    
    // Identify areas for improvement (bottom 2 scores)
    const improvements = sortedFactors.slice(-2).map(f => f.name);
    
    // Select appropriate verse guidance
    let verseCategory: BibleVerse['category'];
    
    if (improvements.includes('generosity')) {
      verseCategory = 'giving';
    } else if (improvements.includes('risk management')) {
      verseCategory = 'investing';
    } else if (improvements.includes('planning')) {
      verseCategory = 'planning';
    } else if (improvements.includes('contentment')) {
      verseCategory = 'contentment';
    } else {
      verseCategory = 'stewardship';
    }
    
    const verseGuidance = getRandomVerseByCategory(verseCategory);
    
    return {
      score: totalScore,
      strengths,
      improvements,
      verseGuidance
    };
  }
  
  // Get DeFi protocol recommendations based on biblical principles
  public getProtocolRecommendations(
    riskTolerance: 'low' | 'medium' | 'high',
    priorityValues: ('giving' | 'growth' | 'stability' | 'impact')[]
  ): DefiProtocolRecommendation[] {
    const recommendations: DefiProtocolRecommendation[] = [];
    
    // Base recommendations on biblical principles
    if (priorityValues.includes('giving')) {
      recommendations.push({
        name: "Superfluid Tithing Stream",
        description: "Automatically tithe a percentage of your earnings through continuous streams",
        riskLevel: "low",
        yield: "spiritual returns",
        biblicalPrinciple: "Bring the whole tithe into the storehouse",
        verseReference: "Malachi 3:10"
      });
    }
    
    if (priorityValues.includes('stability') || riskTolerance === 'low') {
      recommendations.push({
        name: "Stablecoin Yield Farming",
        description: "Generate consistent returns through stablecoin pairs",
        riskLevel: "low",
        yield: "3-8% APY",
        biblicalPrinciple: "Steady plodding brings prosperity",
        verseReference: "Proverbs 21:5"
      });
    }
    
    if (priorityValues.includes('growth') && riskTolerance !== 'low') {
      recommendations.push({
        name: "Balanced Liquidity Provision",
        description: "Provide liquidity across multiple token pairs with different risk profiles",
        riskLevel: riskTolerance === 'high' ? 'medium' : 'low',
        yield: "5-15% APY",
        biblicalPrinciple: "Divide your investments among many places",
        verseReference: "Ecclesiastes 11:2"
      });
    }
    
    if (priorityValues.includes('impact')) {
      recommendations.push({
        name: "Ministry Support Pools",
        description: "Support Christian ministries while earning yield",
        riskLevel: "low",
        yield: "4-7% APY + spiritual returns",
        biblicalPrinciple: "It is more blessed to give than to receive",
        verseReference: "Acts 20:35"
      });
    }
    
    // Always include a recommendation based on Proverbs wisdom
    recommendations.push({
      name: "Biblical Wisdom Reserve",
      description: "Set aside a portion in stablecoins as an emergency fund",
      riskLevel: "low",
      yield: "2-5% APY",
      biblicalPrinciple: "The wise store up choice food and olive oil",
      verseReference: "Proverbs 21:20"
    });
    
    return recommendations;
  }
}

export const biblicalWisdomService = new BiblicalWisdomService();
export default biblicalWisdomService;
