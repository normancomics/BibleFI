import { supabase } from '@/integrations/supabase/client';
import { mcpBiblicalServer } from './mcpBiblicalServer';

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export interface BiblicalFinancialAdvice {
  question: string;
  biblicalPrinciple: string;
  scriptureReferences: {
    reference: string;
    text: string;
    originalLanguage?: {
      hebrew?: string;
      greek?: string;
      aramaic?: string;
    };
    strongNumbers?: string[];
  }[];
  marketContext: {
    relevantTokens: MarketData[];
    marketTrend: 'bullish' | 'bearish' | 'neutral';
    riskAssessment: 'low' | 'medium' | 'high';
  };
  practicalGuidance: {
    tithingAdvice?: string;
    investmentStrategy?: string;
    riskManagement?: string;
    stakeRecommendations?: string[];
  };
  wisdomScore: number;
  defiApplications: {
    protocol: string;
    action: string;
    biblicalRationale: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

export class EnhancedBiblicalFinanceService {
  private static instance: EnhancedBiblicalFinanceService;
  
  public static getInstance(): EnhancedBiblicalFinanceService {
    if (!EnhancedBiblicalFinanceService.instance) {
      EnhancedBiblicalFinanceService.instance = new EnhancedBiblicalFinanceService();
    }
    return EnhancedBiblicalFinanceService.instance;
  }

  async getComprehensiveBiblicalAdvice(
    question: string,
    userContext?: {
      walletBalance?: number;
      riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
      primaryChurch?: string;
      tithingHistory?: number;
    }
  ): Promise<BiblicalFinancialAdvice> {
    try {
      // Get Biblical wisdom through MCP
      const biblicalResponse = await mcpBiblicalServer.callTool('search_biblical_financial_wisdom', {
        query: question,
        context: {
          includeOriginalLanguages: true,
          versions: ['kjv', 'hebrew', 'greek', 'aramaic']
        }
      });

      // Get current market data
      const marketData = await this.getCurrentMarketData();
      
      // Analyze market trend
      const marketTrend = this.analyzeMarketTrend(marketData);

      // Generate DeFi recommendations based on Biblical principles
      const defiApplications = this.generateBiblicalDefiRecommendations(question, marketTrend);

      // Calculate wisdom score based on question content
      const wisdomScore = this.calculateWisdomScore(question, userContext);

      return {
        question,
        biblicalPrinciple: biblicalResponse.guidance.primary_principle,
        scriptureReferences: biblicalResponse.scriptures.map(scripture => ({
          reference: scripture.reference,
          text: scripture.kjv_text,
          originalLanguage: {
            hebrew: scripture.hebrew_text,
            greek: scripture.greek_text,
            aramaic: scripture.aramaic_text
          },
          strongNumbers: scripture.original_words?.map(word => word.strong_number).filter(Boolean) || []
        })),
        marketContext: {
          relevantTokens: marketData,
          marketTrend,
          riskAssessment: this.assessRisk(marketTrend, userContext?.riskTolerance)
        },
        practicalGuidance: {
          tithingAdvice: this.generateTithingAdvice(userContext),
          investmentStrategy: this.generateInvestmentStrategy(marketTrend, userContext),
          riskManagement: this.generateRiskManagement(),
          stakeRecommendations: this.generateStakeRecommendations(marketTrend)
        },
        wisdomScore,
        defiApplications
      };
    } catch (error) {
      console.error('Error getting comprehensive Biblical advice:', error);
      throw new Error('Failed to get Biblical financial guidance');
    }
  }

  private async getCurrentMarketData(): Promise<MarketData[]> {
    try {
      // Get Base chain token data
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=base-ecosystem&order=market_cap_desc&per_page=10&page=1');
      const data = await response.json();
      
      return data.map((token: any) => ({
        symbol: token.symbol.toUpperCase(),
        price: token.current_price,
        change24h: token.price_change_percentage_24h,
        marketCap: token.market_cap,
        volume24h: token.total_volume
      }));
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Return default data
      return [
        { symbol: 'ETH', price: 1800, change24h: 2.5, marketCap: 216000000000, volume24h: 8000000000 },
        { symbol: 'USDC', price: 1.00, change24h: 0.1, marketCap: 32000000000, volume24h: 2000000000 }
      ];
    }
  }

  private analyzeMarketTrend(marketData: MarketData[]): 'bullish' | 'bearish' | 'neutral' {
    const averageChange = marketData.reduce((acc, token) => acc + token.change24h, 0) / marketData.length;
    
    if (averageChange > 3) return 'bullish';
    if (averageChange < -3) return 'bearish';
    return 'neutral';
  }

  private assessRisk(marketTrend: string, riskTolerance?: string): 'low' | 'medium' | 'high' {
    if (marketTrend === 'bearish') return 'high';
    if (marketTrend === 'bullish' && riskTolerance === 'conservative') return 'medium';
    if (riskTolerance === 'aggressive') return 'low';
    return 'low';
  }

  private generateBiblicalDefiRecommendations(question: string, marketTrend: string): {
    protocol: string;
    action: string;
    biblicalRationale: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[] {
    const baseRecommendations: {
      protocol: string;
      action: string;
      biblicalRationale: string;
      riskLevel: 'low' | 'medium' | 'high';
    }[] = [
      {
        protocol: 'USDC Staking',
        action: 'Stake in low-risk pools',
        biblicalRationale: 'Proverbs 21:5 - The plans of the diligent lead to profit',
        riskLevel: 'low'
      },
      {
        protocol: 'Superfluid Tithing',
        action: 'Set up streaming donations',
        biblicalRationale: '2 Corinthians 9:7 - God loves a cheerful giver',
        riskLevel: 'low'
      }
    ];

    if (marketTrend === 'bullish') {
      baseRecommendations.push({
        protocol: 'ETH Liquid Staking',
        action: 'Consider ETH staking for steady returns',
        biblicalRationale: 'Matthew 25:20-21 - Parable of the Talents',
        riskLevel: 'medium'
      });
    }

    return baseRecommendations;
  }

  private calculateWisdomScore(question: string, userContext?: any): number {
    let score = 50; // Base score

    // Increase score for wisdom-related keywords
    if (question.toLowerCase().includes('tithe')) score += 20;
    if (question.toLowerCase().includes('give')) score += 15;
    if (question.toLowerCase().includes('save')) score += 10;
    if (question.toLowerCase().includes('debt')) score += 5;
    if (question.toLowerCase().includes('plan')) score += 10;

    // Adjust based on user context
    if (userContext?.tithingHistory && userContext.tithingHistory > 0) score += 15;
    if (userContext?.riskTolerance === 'conservative') score += 10;

    return Math.min(100, Math.max(1, score));
  }

  private generateTithingAdvice(userContext?: any): string {
    if (userContext?.tithingHistory && userContext.tithingHistory > 0) {
      return "Continue your faithful tithing practice. Consider setting up automated streaming donations for consistency.";
    }
    return "Consider starting with a 10% tithe as outlined in Malachi 3:10. You can begin with digital tithing through our platform.";
  }

  private generateInvestmentStrategy(marketTrend: string, userContext?: any): string {
    if (marketTrend === 'bearish') {
      return "During market downturns, focus on stablecoins and conservative strategies. Remember Ecclesiastes 3:1 - there is a time for everything.";
    }
    if (userContext?.riskTolerance === 'conservative') {
      return "Focus on stablecoin yields and proven DeFi protocols. Build your emergency fund first (Proverbs 21:20).";
    }
    return "Consider diversified strategies across staking, liquidity provision, and stablecoins. Pray for wisdom in all decisions.";
  }

  private generateRiskManagement(): string {
    return "Never invest more than you can afford to lose. Maintain 3-6 months emergency fund. Diversify across protocols and assets.";
  }

  private generateStakeRecommendations(marketTrend: string): string[] {
    const baseRecommendations = [
      "USDC staking for stable returns",
      "ETH liquid staking for network rewards"
    ];

    if (marketTrend === 'bullish') {
      baseRecommendations.push("Base ecosystem tokens with strong fundamentals");
    }

    return baseRecommendations;
  }

  async getTithingCalculation(income: number, incomeType: 'salary' | 'business' | 'investment' | 'gifts'): Promise<{
    recommendedAmount: number;
    percentage: number;
    biblicalBasis: string;
    calculation: string;
  }> {
    const percentage = incomeType === 'gifts' ? 5 : 10; // Different rate for gifts
    const recommendedAmount = income * (percentage / 100);
    
    return {
      recommendedAmount,
      percentage,
      biblicalBasis: incomeType === 'gifts' 
        ? "Consider giving from gifts as a blessing received (1 Chronicles 29:14)"
        : "Malachi 3:10 - Bring the whole tithe into the storehouse",
      calculation: `${percentage}% of $${income.toFixed(2)} = $${recommendedAmount.toFixed(2)}`
    };
  }

  async getMarketBasedLendingAdvice(): Promise<{
    safeProtocols: string[];
    riskFactors: string[];
    biblicalGuidance: string;
  }> {
    return {
      safeProtocols: ['Aave on Base', 'Compound V3', 'Moonwell'],
      riskFactors: [
        'Smart contract risk',
        'Liquidation risk in volatile markets',
        'Protocol governance changes'
      ],
      biblicalGuidance: "Proverbs 22:7 warns that 'the borrower is slave to the lender.' Be cautious with leverage and borrowing."
    };
  }
}

export const enhancedBiblicalFinanceService = EnhancedBiblicalFinanceService.getInstance();