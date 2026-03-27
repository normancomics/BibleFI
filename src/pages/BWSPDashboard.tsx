// BWSP Dashboard Page
// Route: /bwsp-dashboard
// Full dashboard for the BWSP/BWTYA Sovereign Agent Framework

import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSovereignAgent } from '@/contexts/SovereignAgentContext';
import { wisdomScoreTracker } from '@/services/bwsp/wisdomScoreTracker';
import { useWallet } from '@/contexts/WalletContext';
import type { WisdomCorrelation, WisdomScore, MarketContext } from '@/services/bwsp/types';
import { BookOpen, Brain, RefreshCw, Shield, TrendingUp, Zap, Leaf, Crown } from 'lucide-react';

const BWSPWisdomPanel = lazy(() =>
  import('@/components/bwsp/BWSPWisdomPanel').then((m) => ({ default: m.BWSPWisdomPanel })),
);

// ---------------------------------------------------------------------------
// Mock market contexts for live correlation demo
// ---------------------------------------------------------------------------

const MOCK_MARKET_CONTEXTS: MarketContext[] = [
  {
    fearGreedIndex: 22,
    fearGreedLabel: 'Extreme Fear',
    biblicalSentiment: 'Season of testing',
    topProtocols: [
      { name: 'Aave', tvl: 12_000_000_000, apy: 4.2, chain: 'Ethereum', riskLevel: 'low', biblicalAlignment: 'transparent' },
      { name: 'Compound', tvl: 3_000_000_000, apy: 3.8, chain: 'Ethereum', riskLevel: 'low', biblicalAlignment: 'transparent' },
    ],
    lastUpdated: new Date().toISOString(),
  },
  {
    fearGreedIndex: 78,
    fearGreedLabel: 'Extreme Greed',
    biblicalSentiment: 'Guard against hubris',
    topProtocols: [
      { name: 'Uniswap', tvl: 5_000_000_000, apy: 22.5, chain: 'Base', riskLevel: 'medium', biblicalAlignment: 'transparent' },
      { name: 'Curve', tvl: 2_000_000_000, apy: 8.1, chain: 'Ethereum', riskLevel: 'low', biblicalAlignment: 'transparent' },
    ],
    lastUpdated: new Date().toISOString(),
  },
  {
    fearGreedIndex: 50,
    fearGreedLabel: 'Neutral',
    biblicalSentiment: 'Steady stewardship',
    topProtocols: [
      { name: 'Lido', tvl: 20_000_000_000, apy: 3.9, chain: 'Ethereum', riskLevel: 'low', biblicalAlignment: 'transparent' },
    ],
    lastUpdated: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Strategy card data
// ---------------------------------------------------------------------------

interface StrategyCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  scriptureAnchor: string;
  description: string;
  riskLevel: 'Conservative' | 'Moderate' | 'Advanced';
  riskColor: string;
  allocations: { label: string; pct: number }[];
}

const STRATEGY_CARDS: StrategyCard[] = [
  {
    id: 'talents',
    name: 'Talents Multiplied',
    icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
    scriptureAnchor: 'Matthew 25:14-30',
    description:
      'Moderate growth strategy based on the Parable of the Talents. Balances yield and stewardship — faithful with little, entrusted with more.',
    riskLevel: 'Moderate',
    riskColor: 'bg-amber-600',
    allocations: [
      { label: 'Stablecoin Lending', pct: 40 },
      { label: 'ETH Staking', pct: 35 },
      { label: 'LP Tokens', pct: 15 },
      { label: 'Tithe Reserve', pct: 10 },
    ],
  },
  {
    id: 'storehouse',
    name: "Joseph's Storehouse",
    icon: <Leaf className="w-5 h-5 text-green-400" />,
    scriptureAnchor: 'Genesis 41:35',
    description:
      'Conservative strategy inspired by Joseph\'s 7-year grain storage plan. Prioritizes capital preservation and broad diversification during uncertain seasons.',
    riskLevel: 'Conservative',
    riskColor: 'bg-green-700',
    allocations: [
      { label: 'Stablecoin Yields', pct: 60 },
      { label: 'Blue-chip Staking', pct: 25 },
      { label: 'Reserve Fund', pct: 15 },
    ],
  },
  {
    id: 'solomon',
    name: "Solomon's Portfolio",
    icon: <Crown className="w-5 h-5 text-yellow-300" />,
    scriptureAnchor: 'Proverbs 8:11 / Ecclesiastes 11:2',
    description:
      'Advanced diversified strategy for seasoned stewards (Wisdom Score ≥ 70). Spreads across 7+ ventures as advised by Ecclesiastes 11:2.',
    riskLevel: 'Advanced',
    riskColor: 'bg-purple-700',
    allocations: [
      { label: 'DeFi Lending', pct: 25 },
      { label: 'ETH Staking', pct: 20 },
      { label: 'LP Positions', pct: 20 },
      { label: 'Index Tokens', pct: 15 },
      { label: 'RWA Exposure', pct: 10 },
      { label: 'Tithe Reserve', pct: 10 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AgentStatusHeader() {
  const { agentVersion, isAgentReady, lastSync, syncAgent } = useSovereignAgent();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAgent();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="border-ancient-gold/30 bg-background/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-amber-400" />
            <CardTitle className="font-mono text-ancient-gold text-lg">
              Sovereign Agent Framework
            </CardTitle>
            <Badge className="font-mono text-xs bg-amber-900/50 text-amber-300 border-amber-700">
              {agentVersion}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`font-mono text-xs ${
                isAgentReady
                  ? 'bg-green-900/50 text-green-300 border-green-700'
                  : 'bg-red-900/50 text-red-300 border-red-700'
              }`}
            >
              {isAgentReady ? '● READY' : '○ OFFLINE'}
            </Badge>
            {lastSync && (
              <span className="text-xs text-amber-300/60 font-mono hidden sm:block">
                Last sync: {lastSync.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-amber-700 text-amber-300 hover:bg-amber-900/30 font-mono text-xs"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Zap className="w-3 h-3 mr-1" />
              )}
              {syncing ? 'Syncing…' : 'Sync Agent'}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function StrategyCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STRATEGY_CARDS.map((card) => (
        <Card
          key={card.id}
          className="border-ancient-gold/20 bg-background/70 backdrop-blur-sm hover:border-ancient-gold/50 transition-colors"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {card.icon}
              <CardTitle className="font-mono text-sm text-amber-200">{card.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-xs font-mono text-white ${card.riskColor}`}>
                {card.riskLevel}
              </Badge>
              <span className="text-xs text-amber-300/60 font-mono">{card.scriptureAnchor}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-amber-300/80 leading-relaxed">{card.description}</p>
            <div className="space-y-1">
              {card.allocations.map((alloc) => (
                <div key={alloc.label} className="flex items-center justify-between text-xs">
                  <span className="text-amber-300/70 font-mono">{alloc.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-amber-900/30 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${alloc.pct}%` }}
                      />
                    </div>
                    <span className="text-amber-400 font-mono w-8 text-right">{alloc.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StewardshipBadge({ walletAddress }: { walletAddress: string | undefined }) {
  const [score, setScore] = useState<WisdomScore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    wisdomScoreTracker
      .getScore(walletAddress)
      .then(setScore)
      .catch((err) => console.error('[BWSPDashboard] stewardship load error', err))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <Card className="border-amber-700/20 bg-background/60">
        <CardContent className="py-4 text-center text-amber-300/60 text-sm font-mono">
          Connect wallet to view your Stewardship Level
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-amber-700/20 bg-background/60">
        <CardContent className="py-4 text-center text-amber-300/60 text-sm font-mono">
          Loading stewardship level…
        </CardContent>
      </Card>
    );
  }

  const level = score?.stewardshipLevel ?? 'Novice';
  const levelColors: Record<string, string> = {
    Novice: 'text-gray-300 border-gray-600',
    Apprentice: 'text-blue-300 border-blue-600',
    Steward: 'text-amber-300 border-amber-600',
    Elder: 'text-yellow-300 border-yellow-500',
    Solomon: 'text-yellow-100 border-yellow-400',
  };

  return (
    <Card className="border-ancient-gold/30 bg-background/70">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-ancient-gold text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" /> Stewardship Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Badge
            className={`text-lg font-mono px-4 py-1 bg-transparent border ${levelColors[level] ?? 'text-amber-300 border-amber-600'}`}
          >
            {level}
          </Badge>
          {score && (
            <div className="text-xs text-amber-300/70 font-mono space-y-0.5">
              <div>Queries: {score.totalQueries}</div>
              <div>Avg Confidence: {(score.avgConfidenceScore * 100).toFixed(1)}%</div>
              <div>Focus: {score.dominantIntent?.replace(/_/g, ' ')}</div>
            </div>
          )}
          {!score && (
            <span className="text-xs text-amber-300/60 font-mono">
              No queries yet — ask your first wisdom question!
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MarketWisdomPanel() {
  const { marketWisdomCorrelator } = useSovereignAgent();
  const [correlations, setCorrelations] = useState<WisdomCorrelation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCorrelations = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        MOCK_MARKET_CONTEXTS.map((ctx) => marketWisdomCorrelator.correlate(ctx)),
      );
      setCorrelations(results);
    } catch (err) {
      console.error('[BWSPDashboard] market wisdom load error', err);
    } finally {
      setLoading(false);
    }
  }, [marketWisdomCorrelator]);

  useEffect(() => {
    loadCorrelations();
  }, [loadCorrelations]);

  const riskColors: Record<string, string> = {
    low: 'bg-green-800/50 text-green-300 border-green-700',
    medium: 'bg-amber-800/50 text-amber-300 border-amber-700',
    high: 'bg-red-800/50 text-red-300 border-red-700',
  };

  return (
    <Card className="border-ancient-gold/30 bg-background/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-ancient-gold text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Market-Wisdom Correlations
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-400 hover:text-amber-300 h-7 px-2"
            onClick={loadCorrelations}
            disabled={loading}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center text-amber-300/60 text-xs font-mono py-4">
            Correlating market signals with scripture…
          </div>
        ) : (
          correlations.map((c, i) => (
            <div
              key={i}
              className="border border-amber-900/30 rounded-lg p-3 space-y-1.5 bg-background/40"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-amber-200 font-mono font-semibold">
                  {c.marketSignal}
                </span>
                <Badge className={`text-xs font-mono ${riskColors[c.riskLevel]}`}>
                  {c.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              <div className="text-xs text-amber-300/80 italic">
                "{c.scripture}" — <span className="not-italic font-mono text-amber-400">{c.verseRef}</span>
              </div>
              <div className="text-xs text-green-300/80">{c.actionRecommendation}</div>
              <div className="text-xs text-amber-300/50 font-mono">
                Wisdom alignment: {(c.wisdomAlignment * 100).toFixed(0)}%
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

const BWSPDashboard: React.FC = () => {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-mono text-3xl font-bold text-ancient-gold tracking-widest uppercase">
            ✝ BWSP Dashboard
          </h1>
          <p className="text-amber-300/70 text-sm font-mono">
            Biblical-Wisdom-Synthesis-Protocol · Sovereign Agent Framework
          </p>
        </div>

        {/* Agent Status */}
        <AgentStatusHeader />

        {/* Tabs */}
        <Tabs defaultValue="wisdom" className="w-full">
          <TabsList className="bg-background/80 border border-ancient-gold/20 font-mono text-xs">
            <TabsTrigger value="wisdom" className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-200">
              <Brain className="w-3 h-3 mr-1" /> Wisdom Query
            </TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-200">
              <TrendingUp className="w-3 h-3 mr-1" /> Strategies
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-200">
              <BookOpen className="w-3 h-3 mr-1" /> Market Wisdom
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-200">
              <Shield className="w-3 h-3 mr-1" /> Stewardship
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wisdom" className="mt-4">
            <Suspense
              fallback={
                <div className="text-center text-amber-300/60 text-sm font-mono py-8">
                  Loading wisdom panel…
                </div>
              }
            >
              <BWSPWisdomPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="strategies" className="mt-4">
            <StrategyCards />
          </TabsContent>

          <TabsContent value="market" className="mt-4">
            <MarketWisdomPanel />
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <StewardshipBadge walletAddress={address} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BWSPDashboard;
