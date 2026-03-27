// BWSP Engine – Unit test scaffold (Vitest)
// Tests intent detection, BWTYA algorithm, and market wisdom correlator
// Supabase calls are mocked via vi.mock

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase before any imports that use it ──────────────────────────
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: { message: 'mocked' } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

// ── Mock Vite env variables ───────────────────────────────────────────────
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://mock.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
  },
});

// ── Mock data dependency ──────────────────────────────────────────────────
vi.mock('@/data/comprehensiveFinancialScriptures', () => ({
  comprehensiveFinancialScriptures: [],
}));

import { detectIntent } from '../engine';
import { bwtyaAlgorithm } from '../../bwtya/algorithm';
import { marketWisdomCorrelator } from '../marketWisdomCorrelator';
import type { BWTYAInput } from '../../bwtya/types';
import type { MarketContext } from '../types';

// ---------------------------------------------------------------------------
// 1. Intent detection
// ---------------------------------------------------------------------------

describe('detectIntent', () => {
  it('classifies yield queries', () => {
    expect(detectIntent('What is the best yield farming strategy?')).toBe('yield_advice');
  });

  it('classifies risk queries', () => {
    expect(detectIntent('Is this protocol safe from rug pulls?')).toBe('risk_assessment');
  });

  it('classifies tithe queries', () => {
    expect(detectIntent('How much should I tithe from my DeFi earnings?')).toBe('tithe_guidance');
  });

  it('classifies stewardship queries', () => {
    expect(detectIntent('How do I manage my portfolio as a faithful steward?')).toBe('stewardship_principle');
  });

  it('classifies defi action queries', () => {
    expect(detectIntent('How do I swap ETH for USDC?')).toBe('defi_action');
  });

  it('classifies tax queries', () => {
    expect(detectIntent('Do I need to report crypto taxes on capital gains?')).toBe('tax_wisdom');
  });

  it('falls back to general_wisdom for unclassified queries', () => {
    expect(detectIntent('Tell me something wise')).toBe('general_wisdom');
  });
});

// ---------------------------------------------------------------------------
// 2. BWTYA Algorithm
// ---------------------------------------------------------------------------

describe('BWTYAAlgorithm.run', () => {
  const mockInput: BWTYAInput = {
    wisdomScore: 55,
    capitalUsd: 10_000,
    riskTolerance: 'moderate',
    opportunities: [
      {
        protocol: 'Aave',
        poolName: 'USDC',
        tokenSymbol: 'USDC',
        chain: 'Ethereum',
        apy: 5.2,
        tvlUsd: 8_000_000_000,
        riskScore: 15,
        category: 'lending',
        biblicalAlignment: 'transparent',
        isVerified: true,
        audited: true,
        transparent: true,
      },
      {
        protocol: 'Compound',
        poolName: 'ETH',
        tokenSymbol: 'ETH',
        chain: 'Ethereum',
        apy: 3.8,
        tvlUsd: 3_000_000_000,
        riskScore: 20,
        category: 'lending',
        biblicalAlignment: 'transparent',
        isVerified: true,
        audited: true,
        transparent: true,
      },
    ],
  };

  it('returns a BWTYAResult with a recommended strategy', () => {
    const result = bwtyaAlgorithm.run(mockInput);
    expect(result).toBeDefined();
    expect(result.recommendedStrategy).toBeDefined();
    expect(result.scoredOpportunities).toHaveLength(2);
  });

  it('computes titheAmount and yieldAfterTithe', () => {
    const result = bwtyaAlgorithm.run(mockInput);
    expect(result.titheAmount).toBeGreaterThan(0);
    expect(result.yieldAfterTithe).toBeLessThan(
      mockInput.capitalUsd! * (result.projectedApy / 100),
    );
  });

  it('scores each opportunity with bwtyaScore between 0 and 100', () => {
    const result = bwtyaAlgorithm.run(mockInput);
    for (const so of result.scoredOpportunities) {
      expect(so.bwtyaScore).toBeGreaterThanOrEqual(0);
      expect(so.bwtyaScore).toBeLessThanOrEqual(100);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. MarketWisdomCorrelator
// ---------------------------------------------------------------------------

describe('MarketWisdomCorrelator.correlate', () => {
  const highVolatilityContext: MarketContext = {
    fearGreedIndex: 15,
    fearGreedLabel: 'Extreme Fear',
    biblicalSentiment: 'Testing season',
    topProtocols: [
      { name: 'Aave', tvl: 8_000_000_000, apy: 4.2, chain: 'Ethereum', riskLevel: 'low', biblicalAlignment: 'transparent' },
    ],
    lastUpdated: new Date().toISOString(),
  };

  it('returns a WisdomCorrelation for high-volatility context', async () => {
    const correlation = await marketWisdomCorrelator.correlate(highVolatilityContext);
    expect(correlation).toBeDefined();
    expect(correlation.verseRef).toBeTruthy();
    expect(correlation.riskLevel).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(correlation.riskLevel);
  });

  it('maps extreme fear to high-risk Proverbs/Ecclesiastes guidance', async () => {
    const correlation = await marketWisdomCorrelator.correlate(highVolatilityContext);
    expect(correlation.riskLevel).toBe('high');
    expect(correlation.wisdomAlignment).toBeGreaterThan(0.7);
  });

  it('maps bull market to Proverbs 27:1', async () => {
    const bullContext: MarketContext = {
      ...highVolatilityContext,
      fearGreedIndex: 80,
      fearGreedLabel: 'Extreme Greed',
    };
    const correlation = await marketWisdomCorrelator.correlate(bullContext);
    expect(correlation.verseRef).toMatch(/Proverbs 27:1/);
  });
});

// ---------------------------------------------------------------------------
// 4. BWSPAgentLoop
// ---------------------------------------------------------------------------

import { bwspAgentLoop } from '../agentLoop';
import type { BWSPQuery } from '../types';

describe('BWSPAgentLoop.execute', () => {
  it('returns a BWSPLoopResult with at least 1 iteration', async () => {
    const query: BWSPQuery = { text: 'What yield strategy should I use?', intent: 'yield_advice' };
    const result = await bwspAgentLoop.execute(query, 2);
    expect(result).toBeDefined();
    expect(result.iterations).toBeGreaterThanOrEqual(1);
    expect(result.reflectionNotes.length).toBeGreaterThanOrEqual(1);
    expect(result.finalResponse).toBeDefined();
  });

  it('accepts maxIterations parameter', async () => {
    const query: BWSPQuery = { text: 'tithe guidance', intent: 'tithe_guidance' };
    const result = await bwspAgentLoop.execute(query, 1);
    expect(result.iterations).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 5. WisdomScoreTracker
// ---------------------------------------------------------------------------

import { wisdomScoreTracker } from '../wisdomScoreTracker';

describe('WisdomScoreTracker', () => {
  it('trackQuery does not throw for a valid wallet address', async () => {
    const mockQuery: BWSPQuery = { text: 'test', intent: 'general_wisdom' };
    // We need a mock response — construct a minimal one
    const mockResponse = {
      query: mockQuery,
      synthesis: { confidenceScore: 0.8, tokenCount: 100 },
    } as any;

    await expect(
      wisdomScoreTracker.trackQuery('0xMockWallet', mockQuery, mockResponse),
    ).resolves.not.toThrow();
  });

  it('getScore returns null for unknown wallet', async () => {
    const score = await wisdomScoreTracker.getScore('0xUnknownWallet');
    expect(score).toBeNull();
  });
});
