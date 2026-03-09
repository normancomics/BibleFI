import React, { useState, useEffect } from 'react';
import { useDefiScanner } from '@/hooks/useDefiScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw, TrendingUp, TrendingDown, AlertTriangle, BookOpen,
  Coins, BarChart3, Zap, Shield, Activity, ArrowUpRight, ArrowDownRight,
  Timer, Wheat, Landmark, Globe, Star
} from 'lucide-react';
import { toast } from 'sonner';
import TokenPriceGrid from './TokenPriceGrid';
import ProtocolTVLTable from './ProtocolTVLTable';
import YieldPoolCards from './YieldPoolCards';
import SignalFeed from './SignalFeed';
import MarketOverviewBar from './MarketOverviewBar';

const DefiOpportunitiesDashboard: React.FC = () => {
  const { data, loading, error, lastRefresh, secondsUntilRefresh, newSignals, refresh } = useDefiScanner(120000);
  const [refreshing, setRefreshing] = useState(false);

  // Toast notifications for new signals
  useEffect(() => {
    if (newSignals.length > 0) {
      newSignals.forEach((sig) => {
        toast(`📡 New ${sig.type} signal`, {
          description: `${sig.protocol} • ${sig.asset}: ${sig.details}`,
          duration: 6000,
        });
      });
    }
  }, [newSignals]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-mono text-sm">Scanning Base Chain DeFi protocols...</p>
          <p className="text-xs text-muted-foreground italic">
            "The heart of the prudent getteth knowledge" — Proverbs 18:15
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-foreground font-medium">Scanner Unavailable</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground italic">
              "The LORD is close to the brokenhearted" — Psalm 34:18
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-3 h-3 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const signalTypes = data.signals_by_type || {};
  const totalWarnings = signalTypes.warning?.count || 0;
  const totalEntry = signalTypes.entry?.count || 0;
  const totalExit = signalTypes.exit?.count || 0;
  const totalFarming = signalTypes.farming?.count || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="w-7 h-7 text-secondary" />
            DeFi Opportunities
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live Base Chain market intelligence with Biblical wisdom guardrails
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Badge variant="outline" className="text-[10px] font-mono border-secondary/30 gap-1">
            <RefreshCw className="w-2.5 h-2.5" />
            {Math.floor(secondsUntilRefresh / 60)}:{(secondsUntilRefresh % 60).toString().padStart(2, '0')}
          </Badge>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="border-secondary/30 hover:border-secondary"
          >
            <RefreshCw className={`w-3 h-3 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Overview Bar */}
      <MarketOverviewBar data={data} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Coins className="w-4 h-4" />}
          label="Tokens Tracked"
          value={data.prices_fetched.toString()}
          accent="text-secondary"
        />
        <StatCard
          icon={<Landmark className="w-4 h-4" />}
          label="Protocols Scanned"
          value={data.protocols_scanned.toString()}
          accent="text-primary"
        />
        <StatCard
          icon={<Wheat className="w-4 h-4" />}
          label="Yield Pools"
          value={data.yield_pools_found.toString()}
          accent="text-green-400"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Signals"
          value={data.total_signals.toString()}
          accent="text-orange-400"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="bg-card border border-border w-full md:w-auto flex-wrap h-auto p-1">
          <TabsTrigger value="prices" className="text-xs md:text-sm gap-1.5">
            <TrendingUp className="w-3 h-3" /> Prices
          </TabsTrigger>
          <TabsTrigger value="protocols" className="text-xs md:text-sm gap-1.5">
            <BarChart3 className="w-3 h-3" /> Protocols
          </TabsTrigger>
          <TabsTrigger value="yields" className="text-xs md:text-sm gap-1.5">
            <Wheat className="w-3 h-3" /> Yields
          </TabsTrigger>
          <TabsTrigger value="signals" className="text-xs md:text-sm gap-1.5">
            <Zap className="w-3 h-3" /> Signals
            {data.total_signals > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {data.total_signals}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices">
          <TokenPriceGrid prices={data.prices} />
        </TabsContent>

        <TabsContent value="protocols">
          <ProtocolTVLTable protocols={data.protocols} totalScanned={data.protocols_scanned} />
        </TabsContent>

        <TabsContent value="yields">
          <YieldPoolCards pools={data.yield_pools} />
        </TabsContent>

        <TabsContent value="signals">
          <SignalFeed signalsByType={data.signals_by_type} topOpportunities={data.top_opportunities} />
        </TabsContent>
      </Tabs>

      {/* Scripture Footer */}
      <Card className="border-secondary/20 bg-card/50">
        <CardContent className="py-4 text-center">
          <BookOpen className="w-5 h-5 text-secondary mx-auto mb-2" />
          <p className="text-sm italic text-muted-foreground">
            "Cast thy bread upon the waters: for thou shalt find it after many days.
            Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth."
          </p>
          <p className="text-xs text-secondary mt-1 font-medium">Ecclesiastes 11:1-2</p>
        </CardContent>
      </Card>
    </div>
  );
};

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={accent}>{icon}</div>
        <div>
          <p className="text-lg font-bold text-foreground">{value}</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DefiOpportunitiesDashboard;
