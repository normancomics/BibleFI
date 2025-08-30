import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Droplets, 
  TrendingUp, 
  Shield, 
  Info, 
  DollarSign, 
  Clock,
  Users,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { GlowingText } from "@/components/ui/tailwind-extensions";
import { baseTokens } from "@/data/baseTokens";

interface LiquidityPool {
  id: string;
  name: string;
  token0: string;
  token1: string;
  apy: number;
  tvl: string;
  volume24h: string;
  fee: number;
  risk: 'low' | 'medium' | 'high';
  biblicalPrinciple: string;
  verse: string;
  participants: number;
}

const biblicalPools: LiquidityPool[] = [
  {
    id: "eth-usdc-stewardship",
    name: "Steward's Stable Pool",
    token0: "ETH",
    token1: "USDC",
    apy: 12.5,
    tvl: "$2.4M",
    volume24h: "$124K",
    fee: 0.3,
    risk: 'low',
    biblicalPrinciple: "Faithful Stewardship",
    verse: "Whoever can be trusted with very little can also be trusted with much. - Luke 16:10",
    participants: 1247
  },
  {
    id: "dai-usdt-wisdom",
    name: "Wise Builder Pool", 
    token0: "DAI",
    token1: "USDT",
    apy: 8.3,
    tvl: "$1.8M",
    volume24h: "$89K",
    fee: 0.25,
    risk: 'low',
    biblicalPrinciple: "Building on Solid Foundation",
    verse: "Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock. - Matthew 7:24",
    participants: 892
  },
  {
    id: "weth-dai-abundance",
    name: "Abundance Multiplier Pool",
    token0: "WETH", 
    token1: "DAI",
    apy: 18.7,
    tvl: "$3.1M",
    volume24h: "$234K",
    fee: 0.5,
    risk: 'medium',
    biblicalPrinciple: "Multiplying Talents",
    verse: "For whoever has will be given more, and they will have an abundance. - Matthew 25:29",
    participants: 567
  }
];

const BiblicalLiquidityPools: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [activeTab, setActiveTab] = useState("pools");
  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPositions, setUserPositions] = useState<any[]>([]);

  const handlePoolSelect = (pool: LiquidityPool) => {
    playSound("select");
    setSelectedPool(pool);
    setActiveTab("provide");
  };

  const handleProvideLiquidity = async () => {
    if (!selectedPool || !token0Amount || !token1Amount) return;
    
    setIsLoading(true);
    playSound("powerup");
    
    toast({
      title: "Biblical Liquidity Provision",
      description: `Providing liquidity to ${selectedPool.name} with biblical principles of stewardship`,
    });

    // Simulate transaction
    setTimeout(() => {
      setIsLoading(false);
      playSound("success");
      toast({
        title: "Liquidity Added Successfully",
        description: `You've become a steward in the ${selectedPool.name}. May your investment multiply like the loaves and fishes.`,
      });
      
      // Add to user positions
      const newPosition = {
        id: Date.now().toString(),
        pool: selectedPool.name,
        token0: selectedPool.token0,
        token1: selectedPool.token1,
        amount0: token0Amount,
        amount1: token1Amount,
        lpTokens: (parseFloat(token0Amount) + parseFloat(token1Amount)).toFixed(4),
        timestamp: new Date(),
      };
      setUserPositions(prev => [...prev, newPosition]);
      setToken0Amount("");
      setToken1Amount("");
    }, 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-400/20 text-green-400';
      case 'medium': return 'bg-yellow-400/20 text-yellow-400';
      case 'high': return 'bg-red-400/20 text-red-400';
      default: return 'bg-white/20 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GlowingText color="yellow" className="text-3xl font-scroll mb-4">
          Biblical Liquidity Pools
        </GlowingText>
        <p className="text-white/80 max-w-2xl mx-auto">
          Provide liquidity guided by biblical principles of stewardship, wisdom, and faithful multiplication of resources.
        </p>
      </div>

      <Alert className="border-ancient-gold/50 bg-ancient-gold/10">
        <BookOpen className="h-4 w-4 text-ancient-gold" />
        <AlertDescription className="text-ancient-gold">
          <strong>Biblical Principle:</strong> "Each of you should use whatever gift you have to serve others, 
          as faithful stewards of God's grace in its various forms." - 1 Peter 4:10
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pools">Available Pools</TabsTrigger>
          <TabsTrigger value="provide">Provide Liquidity</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid gap-4">
            {biblicalPools.map((pool) => (
              <Card key={pool.id} className="border-scripture/30 bg-black/40 hover:bg-black/60 transition-all cursor-pointer" 
                    onClick={() => handlePoolSelect(pool)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        <img 
                          src={baseTokens[pool.token0]?.logoURI || '/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png'} 
                          alt={pool.token0} 
                          className="w-8 h-8 rounded-full border-2 border-ancient-gold/50" 
                        />
                        <img 
                          src={baseTokens[pool.token1]?.logoURI || '/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png'} 
                          alt={pool.token1} 
                          className="w-8 h-8 rounded-full border-2 border-ancient-gold/50" 
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-ancient-gold">{pool.name}</h3>
                        <p className="text-sm text-white/60">{pool.token0}/{pool.token1} • {pool.fee}% fee</p>
                      </div>
                    </div>
                    <Badge className={getRiskBadgeColor(pool.risk)}>
                      {pool.risk.toUpperCase()} RISK
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-white/60">APY</p>
                      <p className="text-lg font-bold text-green-400">{pool.apy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">TVL</p>
                      <p className="text-lg font-bold">{pool.tvl}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">24h Volume</p>
                      <p className="text-lg font-bold">{pool.volume24h}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Participants</p>
                      <p className="text-lg font-bold">{pool.participants}</p>
                    </div>
                  </div>

                  <div className="bg-black/30 p-3 rounded-lg border border-ancient-gold/20">
                    <p className="text-sm font-medium text-ancient-gold mb-1">{pool.biblicalPrinciple}</p>
                    <p className="text-xs text-white/80 italic">{pool.verse}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="provide" className="space-y-4">
          {selectedPool ? (
            <Card className="border-scripture/30 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-ancient-gold" />
                  <span>Provide Liquidity to {selectedPool.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-black/30 p-4 rounded-lg border border-ancient-gold/20">
                  <h4 className="text-ancient-gold font-medium mb-2">{selectedPool.biblicalPrinciple}</h4>
                  <p className="text-sm text-white/80 italic">{selectedPool.verse}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">
                      {selectedPool.token0} Amount
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={token0Amount}
                        onChange={(e) => setToken0Amount(e.target.value)}
                        className="bg-black/30 border-scripture/30"
                      />
                      <img 
                        src={baseTokens[selectedPool.token0]?.logoURI || '/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png'} 
                        alt={selectedPool.token0} 
                        className="w-8 h-8" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/70">
                      {selectedPool.token1} Amount
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={token1Amount}
                        onChange={(e) => setToken1Amount(e.target.value)}
                        className="bg-black/30 border-scripture/30"
                      />
                      <img 
                        src={baseTokens[selectedPool.token1]?.logoURI || '/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png'} 
                        alt={selectedPool.token1} 
                        className="w-8 h-8" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Pool Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Expected APY:</span>
                      <span className="text-green-400">{selectedPool.apy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Fee Tier:</span>
                      <span>{selectedPool.fee}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Risk Level:</span>
                      <span className={getRiskColor(selectedPool.risk)}>{selectedPool.risk.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Pool TVL:</span>
                      <span>{selectedPool.tvl}</span>
                    </div>
                  </div>
                </div>

                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-200">
                    Remember: Providing liquidity involves impermanent loss risk. 
                    "Count the cost before building" - Luke 14:28
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleProvideLiquidity}
                  disabled={!token0Amount || !token1Amount || isLoading}
                  className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-bold"
                >
                  {isLoading ? "Providing Liquidity..." : "Provide Liquidity"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-scripture/30 bg-black/40">
              <CardContent className="p-8 text-center">
                <Droplets className="h-12 w-12 text-ancient-gold mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Select a Pool</h3>
                <p className="text-white/60">Choose a biblical liquidity pool from the available pools tab to begin providing liquidity.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          {userPositions.length > 0 ? (
            <div className="space-y-4">
              {userPositions.map((position) => (
                <Card key={position.id} className="border-scripture/30 bg-black/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-ancient-gold">{position.pool}</h3>
                      <Badge className="bg-green-400/20 text-green-400">ACTIVE</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-white/60">{position.token0} Provided</p>
                        <p className="text-lg font-bold">{position.amount0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">{position.token1} Provided</p>
                        <p className="text-lg font-bold">{position.amount1}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">LP Tokens</p>
                        <p className="text-lg font-bold">{position.lpTokens}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Since</p>
                        <p className="text-sm">{position.timestamp.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-scripture/30 bg-black/40">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-ancient-gold mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Liquidity Positions</h3>
                <p className="text-white/60 mb-4">You haven't provided liquidity to any pools yet.</p>
                <Button 
                  onClick={() => setActiveTab("pools")}
                  variant="outline" 
                  className="border-ancient-gold text-ancient-gold"
                >
                  Explore Pools
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BiblicalLiquidityPools;