import { supabase } from '@/integrations/supabase/client';

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
      console.log('[BWSP] Calling biblical-advisor edge function...');
      
      const { data, error } = await supabase.functions.invoke('biblical-advisor', {
        body: { query: question, userContext },
      });

      if (error) {
        console.error('[BWSP] Edge function error:', error);
        throw new Error(error.message || 'Edge function call failed');
      }

      // The edge function returns the full BiblicalFinancialAdvice shape
      const result: BiblicalFinancialAdvice = {
        question: data.question || question,
        biblicalPrinciple: data.biblicalPrinciple || 'Seek wisdom from the Lord in all financial decisions.',
        scriptureReferences: (data.scriptureReferences || []).map((s: any) => ({
          reference: s.reference,
          text: s.text,
          originalLanguage: s.originalLanguage,
          strongNumbers: s.strongNumbers,
        })),
        marketContext: {
          relevantTokens: data.marketContext?.relevantTokens || [],
          marketTrend: data.marketContext?.marketTrend || 'neutral',
          riskAssessment: data.marketContext?.riskAssessment || 'medium',
        },
        practicalGuidance: {
          tithingAdvice: data.practicalGuidance?.tithingAdvice || null,
          investmentStrategy: data.practicalGuidance?.investmentStrategy || null,
          riskManagement: data.practicalGuidance?.riskManagement || null,
          stakeRecommendations: data.practicalGuidance?.stakeRecommendations || [],
        },
        wisdomScore: data.wisdomScore ?? 50,
        defiApplications: (data.defiApplications || []).map((app: any) => ({
          protocol: app.protocol,
          action: app.action,
          biblicalRationale: app.biblicalRationale,
          riskLevel: app.riskLevel || 'medium',
        })),
      };

      return result;
    } catch (error) {
      console.error('[BWSP] Error, using offline fallback:', error);
      return this.getOfflineFallback(question, userContext);
    }
  }

  private getOfflineFallback(
    question: string,
    userContext?: any
  ): BiblicalFinancialAdvice {
    const lq = question.toLowerCase();
    let principle = 'God calls us to be wise stewards of every resource He entrusts to us.';
    let scriptures = [
      { reference: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
      { reference: 'Proverbs 21:5', text: 'The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.' },
    ];

    if (lq.includes('tithe') || lq.includes('give')) {
      principle = 'Tithing demonstrates trust in God\'s provision and unlocks His blessings. Give faithfully and cheerfully.';
      scriptures = [
        { reference: 'Malachi 3:10', text: 'Bring the full tithe into the storehouse, that there may be food in my house.' },
        { reference: '2 Corinthians 9:7', text: 'Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver.' },
      ];
    } else if (lq.includes('debt') || lq.includes('borrow')) {
      principle = 'Scripture warns against the bondage of debt. Seek financial freedom through wise stewardship.';
      scriptures = [
        { reference: 'Proverbs 22:7', text: 'The rich rules over the poor, and the borrower is the slave of the lender.' },
        { reference: 'Romans 13:8', text: 'Owe no one anything, except to love each other.' },
      ];
    }

    return {
      question,
      biblicalPrinciple: principle + '\n\n*Note: Using offline biblical wisdom. Connect to the network for AI-powered BWSP guidance.*',
      scriptureReferences: scriptures,
      marketContext: {
        relevantTokens: [
          { symbol: 'ETH', price: 0, change24h: 0, marketCap: 0, volume24h: 0 },
          { symbol: 'USDC', price: 1.0, change24h: 0, marketCap: 0, volume24h: 0 },
        ],
        marketTrend: 'neutral',
        riskAssessment: 'medium',
      },
      practicalGuidance: {
        tithingAdvice: 'Consider setting up consistent giving through automated streams.',
        investmentStrategy: 'Build gradually and diversify across stable protocols.',
        riskManagement: 'Never invest more than you can afford to lose.',
        stakeRecommendations: ['USDC staking for stable returns'],
      },
      wisdomScore: this.calculateOfflineWisdomScore(question, userContext),
      defiApplications: [
        {
          protocol: 'Superfluid Tithing',
          action: 'Set up automated tithe streams',
          biblicalRationale: 'Malachi 3:10 — Bring the whole tithe into the storehouse',
          riskLevel: 'low',
        },
      ],
    };
  }

  private calculateOfflineWisdomScore(question: string, userContext?: any): number {
    let score = 50;
    const lq = question.toLowerCase();
    if (lq.includes('tithe')) score += 20;
    if (lq.includes('give')) score += 15;
    if (lq.includes('save')) score += 10;
    if (lq.includes('plan')) score += 10;
    if (userContext?.tithingHistory && userContext.tithingHistory > 0) score += 15;
    if (userContext?.riskTolerance === 'conservative') score += 10;
    return Math.min(100, Math.max(1, score));
  }

  async getTithingCalculation(income: number, incomeType: 'salary' | 'business' | 'investment' | 'gifts'): Promise<{
    recommendedAmount: number;
    percentage: number;
    biblicalBasis: string;
    calculation: string;
  }> {
    const percentage = incomeType === 'gifts' ? 5 : 10;
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
}

export const enhancedBiblicalFinanceService = EnhancedBiblicalFinanceService.getInstance();
