// BWSP – Market-Wisdom Correlator
// Maps live DeFi market signals to biblical principles

import type { MarketContext, WisdomCorrelation } from './types';

interface CorrelationRule {
  test: (ctx: MarketContext) => boolean;
  marketSignal: string;
  biblicalPrinciple: string;
  scripture: string;
  verseRef: string;
  actionRecommendation: string;
  riskLevel: WisdomCorrelation['riskLevel'];
  wisdomAlignment: number;
}

const CORRELATION_RULES: CorrelationRule[] = [
  // High volatility (fear/greed index ≤ 30 or ≥ 70)
  {
    test: (ctx) => ctx.fearGreedIndex <= 30 || ctx.fearGreedIndex >= 70,
    marketSignal: 'High market volatility detected',
    biblicalPrinciple: 'Diligent planning overcomes volatile markets',
    scripture: 'The plans of the diligent lead to profit as surely as haste leads to poverty.',
    verseRef: 'Proverbs 21:5',
    actionRecommendation:
      'Avoid impulsive trades. Establish a steady accumulation plan and hold to it regardless of short-term swings.',
    riskLevel: 'high',
    wisdomAlignment: 0.85,
  },
  // Bear market (fear/greed ≤ 25)
  {
    test: (ctx) => ctx.fearGreedIndex <= 25,
    marketSignal: 'Bear market conditions',
    biblicalPrinciple: 'Diversify across multiple ventures to weather down-cycles',
    scripture: 'Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land.',
    verseRef: 'Ecclesiastes 11:2',
    actionRecommendation:
      'Spread capital across at least 7 uncorrelated positions. Keep a cash reserve for opportunistic entries.',
    riskLevel: 'high',
    wisdomAlignment: 0.92,
  },
  // Bull market (fear/greed ≥ 75)
  {
    test: (ctx) => ctx.fearGreedIndex >= 75,
    marketSignal: 'Bull market euphoria',
    biblicalPrinciple: 'Guard against boasting about future gains',
    scripture: 'Do not boast about tomorrow, for you do not know what a day may bring.',
    verseRef: 'Proverbs 27:1',
    actionRecommendation:
      'Take partial profits and rebalance. Do not chase parabolic assets — let your strategy, not emotion, guide exits.',
    riskLevel: 'medium',
    wisdomAlignment: 0.88,
  },
  // High yield (top protocol APY > 20%)
  {
    test: (ctx) => ctx.topProtocols?.some((p) => p.apy > 20) ?? false,
    marketSignal: 'High yield opportunities available',
    biblicalPrinciple: 'Be vigilant against greed — put capital to work with wisdom',
    scripture:
      'Watch out! Be on your guard against all kinds of greed. (Luke 12:15) / You should have put my money on deposit with the bankers. (Matthew 25:27)',
    verseRef: 'Luke 12:15 / Matthew 25:27',
    actionRecommendation:
      'Pursue yield purposefully but audit each protocol. Reserve 10% as tithe before compounding rewards.',
    riskLevel: 'medium',
    wisdomAlignment: 0.78,
  },
  // High protocol risk (top protocol riskLevel === 'high')
  {
    test: (ctx) => ctx.topProtocols?.some((p) => p.riskLevel === 'high') ?? false,
    marketSignal: 'High-risk protocols in top positions',
    biblicalPrinciple: 'The prudent see danger and take refuge',
    scripture: 'The prudent see danger and take refuge, but the simple keep going and pay the penalty.',
    verseRef: 'Proverbs 22:3',
    actionRecommendation:
      'Avoid unaudited or high-risk protocols. Prefer conservative allocations — sacrifice some yield for capital preservation.',
    riskLevel: 'high',
    wisdomAlignment: 0.95,
  },
];

// Default fallback correlation
const DEFAULT_CORRELATION: WisdomCorrelation = {
  marketSignal: 'Stable market conditions',
  biblicalPrinciple: 'Faithful stewardship in all seasons',
  scripture: 'Whoever can be trusted with very little can also be trusted with much.',
  verseRef: 'Luke 16:10',
  actionRecommendation:
    'Maintain your current strategy. Review allocations monthly and ensure your tithe reserve is funded.',
  riskLevel: 'low',
  wisdomAlignment: 0.8,
};

export class MarketWisdomCorrelator {
  async correlate(marketContext: MarketContext): Promise<WisdomCorrelation> {
    try {
      // Find the first matching rule (rules are ordered by priority)
      const matched = CORRELATION_RULES.find((rule) => rule.test(marketContext));

      if (matched) {
        const { test: _test, ...correlation } = matched;
        return correlation;
      }

      return DEFAULT_CORRELATION;
    } catch (err) {
      console.error('[MarketWisdomCorrelator] correlate error', err);
      return DEFAULT_CORRELATION;
    }
  }

  /** Convenience method: return up to `count` correlations (matching multiple rules). */
  async correlateAll(marketContext: MarketContext, count = 3): Promise<WisdomCorrelation[]> {
    try {
      const matched = CORRELATION_RULES
        .filter((rule) => rule.test(marketContext))
        .slice(0, count)
        .map(({ test: _test, ...correlation }) => correlation);

      if (matched.length === 0) return [DEFAULT_CORRELATION];
      return matched;
    } catch (err) {
      console.error('[MarketWisdomCorrelator] correlateAll error', err);
      return [DEFAULT_CORRELATION];
    }
  }
}

export const marketWisdomCorrelator = new MarketWisdomCorrelator();
