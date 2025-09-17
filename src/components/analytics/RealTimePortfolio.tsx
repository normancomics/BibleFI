import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  PieChart, 
  BarChart3,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useRealTimePrices } from '@/hooks/useRealTimePrices';
import { useToast } from '@/components/ui/use-toast';
import { useSound } from '@/contexts/SoundContext';

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  allocation: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent: number;
  riskScore: number;
  diversificationScore: number;
  wisdomScore: number;
}

const RealTimePortfolio: React.FC = () => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { toast } = useToast();
  const { playSound } = useSound();
  const { prices } = useRealTimePrices();

  useEffect(() => {
    loadPortfolioData();
    
    // Update portfolio every 30 seconds
    const interval = setInterval(loadPortfolioData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prices && Object.keys(prices).length > 0) {
      updatePortfolioWithPrices();
    }
  }, [prices]);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      
      // Mock portfolio data - in real app, this would come from wallet/DB
      const mockAssets: PortfolioAsset[] = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 2.5,
          value: 0,
          price: 0,
          change24h: 0,
          allocation: 0
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: 1000,
          value: 0,
          price: 0,
          change24h: 0,
          allocation: 0
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: 0.1,
          value: 0,
          price: 0,
          change24h: 0,
          allocation: 0
        }
      ];

      setAssets(mockAssets);
      generatePriceHistory();
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePortfolioWithPrices = () => {
    if (!prices) return;

    const updatedAssets = assets.map(asset => {
      let priceData;
      
      switch (asset.symbol) {
        case 'ETH':
          priceData = prices.ethereum;
          break;
        case 'BTC':
          priceData = prices.bitcoin;
          break;
        case 'USDC':
          priceData = prices['usd-coin'];
          break;
        default:
          priceData = { usd: 1, usd_24h_change: 0 };
      }

      const price = priceData?.usd || 1;
      const change24h = priceData?.usd_24h_change || 0;
      const value = asset.balance * price;

      return {
        ...asset,
        price,
        change24h,
        value
      };
    });

    const totalValue = updatedAssets.reduce((sum, asset) => sum + asset.value, 0);
    
    // Calculate allocations
    const assetsWithAllocation = updatedAssets.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0
    }));

    setAssets(assetsWithAllocation);

    // Calculate metrics
    const totalChange24h = assetsWithAllocation.reduce((sum, asset) => {
      return sum + (asset.value * (asset.change24h / 100));
    }, 0);

    const totalChangePercent = totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0;
    
    // Calculate scores
    const riskScore = calculateRiskScore(assetsWithAllocation);
    const diversificationScore = calculateDiversificationScore(assetsWithAllocation);
    const wisdomScore = calculateBiblicalWisdomScore(assetsWithAllocation);

    setMetrics({
      totalValue,
      totalChange24h,
      totalChangePercent,
      riskScore,
      diversificationScore,
      wisdomScore
    });
  };

  const generatePriceHistory = () => {
    const history = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      history.push({
        time: time.toLocaleTimeString(),
        value: 5000 + Math.random() * 1000 - 500 + (Math.sin(i / 4) * 200)
      });
    }
    
    setPriceHistory(history);
  };

  const calculateRiskScore = (assets: PortfolioAsset[]): number => {
    // Higher concentration in volatile assets = higher risk
    const volatileAllocation = assets.reduce((sum, asset) => {
      if (asset.symbol !== 'USDC') return sum + asset.allocation;
      return sum;
    }, 0);
    
    return Math.min(100, volatileAllocation * 1.2);
  };

  const calculateDiversificationScore = (assets: PortfolioAsset[]): number => {
    // More even distribution = better diversification
    const allocations = assets.map(a => a.allocation).filter(a => a > 0);
    if (allocations.length <= 1) return 0;
    
    const evenAllocation = 100 / allocations.length;
    const variance = allocations.reduce((sum, allocation) => {
      return sum + Math.pow(allocation - evenAllocation, 2);
    }, 0) / allocations.length;
    
    return Math.max(0, 100 - variance);
  };

  const calculateBiblicalWisdomScore = (assets: PortfolioAsset[]): number => {
    let score = 50; // Base score
    
    // Reward diversification (don't put all eggs in one basket)
    const diversificationScore = calculateDiversificationScore(assets);
    score += diversificationScore * 0.3;
    
    // Reward stable asset allocation (prudent stewardship)
    const stableAllocation = assets.find(a => a.symbol === 'USDC')?.allocation || 0;
    if (stableAllocation >= 20) score += 20;
    
    // Penalize excessive risk
    const riskScore = calculateRiskScore(assets);
    if (riskScore > 80) score -= 20;
    
    return Math.min(100, Math.max(0, score));
  };

  const refreshPortfolio = () => {
    playSound('select');
    loadPortfolioData();
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8'];

  if (isLoading) {
    return (
      <Card className="border-gradient">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ancient-gold" />
            <p className="text-white/70">Loading portfolio data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gradient">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ancient-gold">
              ${metrics?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              (metrics?.totalChangePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(metrics?.totalChangePercent || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {metrics?.totalChangePercent.toFixed(2)}% (${metrics?.totalChange24h.toFixed(2)})
            </div>
          </CardContent>
        </Card>

        <Card className="border border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{metrics?.riskScore.toFixed(0) || '0'}</div>
            <Progress value={metrics?.riskScore || 0} className="mt-2" />
            <p className="text-xs text-white/60 mt-1">
              {(metrics?.riskScore || 0) < 30 ? 'Conservative' : 
               (metrics?.riskScore || 0) < 70 ? 'Balanced' : 'Aggressive'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Diversification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{metrics?.diversificationScore.toFixed(0) || '0'}</div>
            <Progress value={metrics?.diversificationScore || 0} className="mt-2" />
            <p className="text-xs text-white/60 mt-1">Portfolio spread</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Wisdom Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{metrics?.wisdomScore.toFixed(0) || '0'}</div>
            <Progress value={metrics?.wisdomScore || 0} className="mt-2" />
            <p className="text-xs text-white/60 mt-1">Biblical stewardship</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Details */}
      <Tabs defaultValue="assets" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="chart">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500 text-green-400">
              <div className="w-2 h-2 rounded-full mr-2 bg-green-500" />
              Live
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshPortfolio}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="assets" className="space-y-4">
          <Card className="border-gradient">
            <CardHeader>
              <CardTitle>Portfolio Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-3 rounded border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-xs font-bold">{asset.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-white/60">{asset.balance} {asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className={`flex items-center gap-1 text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {asset.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <Card className="border-gradient">
            <CardHeader>
              <CardTitle>Portfolio Performance (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card className="border-gradient">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={assets.filter(a => a.allocation > 0)}
                      dataKey="allocation"
                      nameKey="symbol"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ symbol, allocation }) => `${symbol} ${allocation.toFixed(1)}%`}
                    >
                      {assets.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                <div className="space-y-4">
                  {assets.filter(a => a.allocation > 0).map((asset, index) => (
                    <div key={asset.symbol} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{asset.symbol}</span>
                        </div>
                        <span className="text-sm font-medium">{asset.allocation.toFixed(1)}%</span>
                      </div>
                      <Progress value={asset.allocation} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <p className="text-xs text-white/50">
          Last updated: {lastUpdate.toLocaleTimeString()} • 
          Prices via CoinGecko • 
          Biblical wisdom scoring enabled
        </p>
      </div>
    </div>
  );
};

export default RealTimePortfolio;