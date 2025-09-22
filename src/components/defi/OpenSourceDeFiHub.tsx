import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  GitBranch,
  Code,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface OpenSourceProtocol {
  id: string;
  name: string;
  type: 'dex' | 'lending' | 'yield' | 'aggregator';
  cost: 'free' | 'gas_only' | 'revenue_share';
  tvl: string;
  apy: string;
  description: string;
  features: string[];
  github: string;
  documentation: string;
  auditStatus: 'audited' | 'unaudited' | 'partially_audited';
}

const OpenSourceDeFiHub: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const openSourceProtocols: OpenSourceProtocol[] = [
    {
      id: 'uniswap_v3',
      name: 'Uniswap V3',
      type: 'dex',
      cost: 'gas_only',
      tvl: '$3.2B',
      apy: '5-40%',
      description: 'Most liquid DEX with concentrated liquidity and lowest slippage',
      features: ['Concentrated liquidity', 'Multiple fee tiers', 'Flash loans', 'Best execution'],
      github: 'https://github.com/Uniswap/v3-core',
      documentation: 'https://docs.uniswap.org',
      auditStatus: 'audited'
    },
    {
      id: 'aave_v3',
      name: 'Aave V3',
      type: 'lending',
      cost: 'gas_only',
      tvl: '$6.8B',
      apy: '2-8%',
      description: 'Decentralized lending with flash loans and diverse assets',
      features: ['Flash loans', 'Variable rates', 'Collateral switching', 'Risk management'],
      github: 'https://github.com/aave/aave-v3-core',
      documentation: 'https://docs.aave.com',
      auditStatus: 'audited'
    },
    {
      id: 'compound_v3',
      name: 'Compound V3',
      type: 'lending',
      cost: 'gas_only',
      tvl: '$1.2B',
      apy: '1-6%',
      description: 'Governance-minimal money markets with single collateral',
      features: ['Single collateral', 'COMP rewards', 'Liquidation protection', 'Auto-compound'],
      github: 'https://github.com/compound-finance/comet',
      documentation: 'https://docs.compound.finance',
      auditStatus: 'audited'
    },
    {
      id: 'yearn_v3',
      name: 'Yearn V3',
      type: 'yield',
      cost: 'revenue_share',
      tvl: '$800M',
      apy: '3-12%',
      description: 'Automated yield farming with battle-tested strategies',
      features: ['Auto-compound', 'Strategy optimization', 'Risk assessment', 'Community governance'],
      github: 'https://github.com/yearn/yearn-vaults-v3',
      documentation: 'https://docs.yearn.fi',
      auditStatus: 'audited'
    },
    {
      id: '1inch_v5',
      name: '1inch V5',
      type: 'aggregator',
      cost: 'gas_only',
      tvl: 'N/A',
      apy: 'N/A',
      description: 'Best price aggregation across all DEXs for optimal swaps',
      features: ['Multi-DEX routing', 'MEV protection', 'Gas optimization', 'Limit orders'],
      github: 'https://github.com/1inch/limit-order-protocol',
      documentation: 'https://docs.1inch.io',
      auditStatus: 'audited'
    },
    {
      id: 'balancer_v2',
      name: 'Balancer V2',
      type: 'dex',
      cost: 'gas_only',
      tvl: '$1.1B',
      apy: '4-15%',
      description: 'Flexible AMM with custom pool weights and multiple assets',
      features: ['Custom weights', 'Multi-asset pools', 'Composable stable pools', 'Boosted pools'],
      github: 'https://github.com/balancer/balancer-v2-monorepo',
      documentation: 'https://docs.balancer.fi',
      auditStatus: 'audited'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dex': return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'lending': return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'yield': return <BarChart3 className="h-5 w-5 text-purple-400" />;
      case 'aggregator': return <Target className="h-5 w-5 text-orange-400" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getCostBadge = (cost: string) => {
    switch (cost) {
      case 'gas_only': return <Badge className="bg-green-500/20 text-green-400">Gas Only</Badge>;
      case 'revenue_share': return <Badge className="bg-blue-500/20 text-blue-400">Rev Share</Badge>;
      case 'free': return <Badge className="bg-purple-500/20 text-purple-400">FREE</Badge>;
      default: return null;
    }
  };

  const getAuditBadge = (status: string) => {
    switch (status) {
      case 'audited': return <Badge className="bg-green-500/20 text-green-400">✓ Audited</Badge>;
      case 'partially_audited': return <Badge className="bg-yellow-500/20 text-yellow-400">⚠ Partial</Badge>;
      case 'unaudited': return <Badge className="bg-red-500/20 text-red-400">⚠ Unaudited</Badge>;
      default: return null;
    }
  };

  const dexProtocols = openSourceProtocols.filter(p => p.type === 'dex');
  const lendingProtocols = openSourceProtocols.filter(p => p.type === 'lending');
  const yieldProtocols = openSourceProtocols.filter(p => p.type === 'yield');
  const aggregatorProtocols = openSourceProtocols.filter(p => p.type === 'aggregator');

  const renderProtocolGrid = (protocols: OpenSourceProtocol[]) => (
    <div className="grid gap-4">
      {protocols.map((protocol) => (
        <Card key={protocol.id} className="border-white/10 hover:border-white/20 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {getTypeIcon(protocol.type)}
                {protocol.name}
              </CardTitle>
              <div className="flex gap-2">
                {getCostBadge(protocol.cost)}
                {getAuditBadge(protocol.auditStatus)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{protocol.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">TVL</div>
                <div className="font-semibold text-lg">{protocol.tvl}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">APY Range</div>
                <div className="font-semibold text-lg">{protocol.apy}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {protocol.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={protocol.github} target="_blank" rel="noopener noreferrer">
                  <GitBranch className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={protocol.documentation} target="_blank" rel="noopener noreferrer">
                  <Code className="h-4 w-4 mr-2" />
                  Docs
                </a>
              </Button>
              <Button size="sm" className="flex-1">
                Integrate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-400/30 bg-blue-400/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            Open Source DeFi Protocols
          </CardTitle>
          <p className="text-muted-foreground">
            Battle-tested, audited protocols with transparent code and minimal fees. 
            Build on the shoulders of giants while maintaining full control.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">$13.1B+</div>
              <div className="text-sm text-muted-foreground">Total TVL</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">6/6</div>
              <div className="text-sm text-muted-foreground">Audited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">100%</div>
              <div className="text-sm text-muted-foreground">Open Source</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">~$0.01</div>
              <div className="text-sm text-muted-foreground">Avg Gas Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dex" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dex">DEX ({dexProtocols.length})</TabsTrigger>
          <TabsTrigger value="lending">Lending ({lendingProtocols.length})</TabsTrigger>
          <TabsTrigger value="yield">Yield ({yieldProtocols.length})</TabsTrigger>
          <TabsTrigger value="aggregator">Aggregators ({aggregatorProtocols.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dex">
          {renderProtocolGrid(dexProtocols)}
        </TabsContent>

        <TabsContent value="lending">
          {renderProtocolGrid(lendingProtocols)}
        </TabsContent>

        <TabsContent value="yield">
          {renderProtocolGrid(yieldProtocols)}
        </TabsContent>

        <TabsContent value="aggregator">
          {renderProtocolGrid(aggregatorProtocols)}
        </TabsContent>
      </Tabs>

      {/* Implementation Strategy */}
      <Card className="border-green-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-400" />
            Implementation Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-400 text-black rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium">Core DEX Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Start with Uniswap V3 for swaps and liquidity provision - proven, audited, highest TVL
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-400 text-black rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium">Lending Markets</h4>
                <p className="text-sm text-muted-foreground">
                  Add Aave V3 for lending/borrowing with flash loans for advanced strategies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-400 text-black rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium">Yield Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Integrate Yearn V3 for automated yield farming with proven strategies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-400 text-black rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-medium">Price Aggregation</h4>
                <p className="text-sm text-muted-foreground">
                  Use 1inch for optimal routing and MEV protection across all integrated DEXs
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenSourceDeFiHub;