
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LiquidityPoolCard from './LiquidityPoolCard';
import YieldFarmingCard from './YieldFarmingCard';
import { TrendingUp, Wallet, BarChart3, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";

const DefiPortfolio: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState("1,234.56");
  const [dailyChange, setDailyChange] = useState("+2.3%");

  // Mock data for liquidity pools
  const liquidityPools = [
    {
      id: "1",
      name: "ETH/USDC Pool",
      token1: "ETH",
      token2: "USDC",
      apy: "12.5%",
      tvl: "2.1M",
      volume24h: "450K",
      fees: "0.3%",
      myLiquidity: "542.30",
      biblicalPrinciple: {
        verse: "Cast your bread upon the waters, for you will find it after many days.",
        reference: "Ecclesiastes 11:1"
      }
    },
    {
      id: "2",
      name: "DAI/USDT Pool",
      token1: "DAI",
      token2: "USDT",
      apy: "8.2%",
      tvl: "1.5M",
      volume24h: "200K",
      fees: "0.25%",
      myLiquidity: "0.00",
      biblicalPrinciple: {
        verse: "Whoever gathers money little by little makes it grow.",
        reference: "Proverbs 13:11"
      }
    }
  ];

  // Mock data for yield farms
  const yieldFarms = [
    {
      id: "1",
      name: "USDC Stability Farm",
      stakingToken: "USDC",
      rewardTokens: ["BIBLE"],
      apy: "15.3%",
      totalStaked: "850K",
      myStaked: "100.00",
      pendingRewards: "2.45",
      lockPeriod: "7 days",
      multiplier: "2",
      biblicalTeaching: {
        principle: "Faithful Stewardship Brings Multiplication",
        verse: "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.",
        reference: "Matthew 25:23"
      }
    },
    {
      id: "2",
      name: "ETH Yield Farm",
      stakingToken: "ETH",
      rewardTokens: ["BIBLE", "ETH"],
      apy: "22.1%",
      totalStaked: "1.2M",
      myStaked: "0.00",
      pendingRewards: "0.00",
      multiplier: "3",
      biblicalTeaching: {
        principle: "Patient Investment Yields Great Returns",
        verse: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
        reference: "Proverbs 21:5"
      }
    }
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    playSound("powerup");
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Portfolio Refreshed",
        description: "Latest DeFi positions and yields updated.",
      });
    }, 1500);
  };

  const handleAddLiquidity = (poolId: string, amount1: string, amount2: string) => {
    console.log(`Adding liquidity to pool ${poolId}: ${amount1}, ${amount2}`);
    // Implementation would connect to actual DeFi protocols
  };

  const handleRemoveLiquidity = (poolId: string, percentage: number) => {
    console.log(`Removing ${percentage}% liquidity from pool ${poolId}`);
    // Implementation would connect to actual DeFi protocols
  };

  const handleStake = (farmId: string, amount: string) => {
    console.log(`Staking ${amount} in farm ${farmId}`);
    // Implementation would connect to actual DeFi protocols
  };

  const handleUnstake = (farmId: string, amount: string) => {
    console.log(`Unstaking ${amount} from farm ${farmId}`);
    // Implementation would connect to actual DeFi protocols
  };

  const handleHarvest = (farmId: string) => {
    console.log(`Harvesting rewards from farm ${farmId}`);
    // Implementation would connect to actual DeFi protocols
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="border border-ancient-gold/30 bg-gradient-to-br from-purple-900/20 to-black/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-scroll">DeFi Portfolio</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-ancient-gold/50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-3xl font-bold text-ancient-gold">${totalValue}</p>
              <p className="text-sm text-white/60">Total Portfolio Value</p>
            </div>
            <div className="flex items-center text-green-400">
              <TrendingUp size={16} className="mr-1" />
              <span className="font-medium">{dailyChange}</span>
              <span className="text-xs text-white/60 ml-1">24h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DeFi Positions */}
      <Tabs defaultValue="liquidity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/30">
          <TabsTrigger value="liquidity" className="data-[state=active]:bg-scripture/30">
            <Wallet className="w-4 h-4 mr-2" />
            Liquidity Pools
          </TabsTrigger>
          <TabsTrigger value="farming" className="data-[state=active]:bg-scripture/30">
            <BarChart3 className="w-4 h-4 mr-2" />
            Yield Farming
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liquidity" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {liquidityPools.map((pool) => (
              <LiquidityPoolCard
                key={pool.id}
                pool={pool}
                onAddLiquidity={handleAddLiquidity}
                onRemoveLiquidity={handleRemoveLiquidity}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="farming" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {yieldFarms.map((farm) => (
              <YieldFarmingCard
                key={farm.id}
                farm={farm}
                onStake={handleStake}
                onUnstake={handleUnstake}
                onHarvest={handleHarvest}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DefiPortfolio;
