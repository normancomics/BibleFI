import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Zap, Shield, BookOpen, Crown, Star, Calculator } from "lucide-react";
import SoundEffect from "@/components/SoundEffect";
import { useToast } from "@/hooks/use-toast";
import { useTalentScore } from "@/hooks/useTalentScore";
import { useWallet } from "@/contexts/WalletContext";

interface YieldStrategy {
  id: string;
  name: string;
  description: string;
  currentApy: number;
  tvl: number;
  risk: "low" | "medium" | "high";
  biblicalPrinciple: string;
  scriptureReference: string;
  isActive: boolean;
  allocation: number;
}

interface BiblicalYieldOptimizerProps {
  userBalance: number;
  wisdomScore: number;
}

const BiblicalYieldOptimizer: React.FC<BiblicalYieldOptimizerProps> = ({
  userBalance = 0,
  wisdomScore = 0
}) => {
  const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [optimizeMode, setOptimizeMode] = useState<"conservative" | "balanced" | "growth">("balanced");
  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const { data: talentData, fetchScore } = useTalentScore();

  // Auto-fetch builder score when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchScore(address);
    }
  }, [isConnected, address, fetchScore]);

  const builderMultiplier = talentData?.multiplier ?? 1.0;
  const builderTier = talentData?.builder_tier ?? 'Novice';

  useEffect(() => {
    // Mock yield strategies based on biblical themes
    setStrategies([
      {
        id: "proverbs",
        name: "Proverbs Stability Strategy",
        description: "Steady, low-risk returns following Solomon's wisdom",
        currentApy: 4.2,
        tvl: 2500000,
        risk: "low",
        biblicalPrinciple: "Steady plodding brings prosperity",
        scriptureReference: "Proverbs 21:5",
        isActive: true,
        allocation: 40
      },
      {
        id: "talents",
        name: "Parable of Talents Strategy",
        description: "Multiply your resources through diversified DeFi protocols",
        currentApy: 8.5,
        tvl: 1200000,
        risk: "medium",
        biblicalPrinciple: "Be faithful with little to receive much",
        scriptureReference: "Matthew 25:21",
        isActive: false,
        allocation: 35
      },
      {
        id: "joseph",
        name: "Joseph's Reserve Strategy",
        description: "Strategic preparation for market volatility",
        currentApy: 6.8,
        tvl: 850000,
        risk: "medium",
        biblicalPrinciple: "Prepare in times of plenty for times of need",
        scriptureReference: "Genesis 41:35",
        isActive: false,
        allocation: 25
      },
      {
        id: "nehemiah",
        name: "Nehemiah Builder Strategy",
        description: "Long-term infrastructure and protocol tokens",
        currentApy: 12.3,
        tvl: 450000,
        risk: "high",
        biblicalPrinciple: "Building with purpose and vision",
        scriptureReference: "Nehemiah 2:20",
        isActive: false,
        allocation: 0
      }
    ]);
  }, []);

  const getWisdomBonus = (baseApy: number): number => {
    if (wisdomScore >= 80) return baseApy * 0.15;
    if (wisdomScore >= 60) return baseApy * 0.10;
    if (wisdomScore >= 40) return baseApy * 0.05;
    return 0;
  };

  const getBuilderBonus = (baseApy: number): number => {
    return baseApy * (builderMultiplier - 1.0); // e.g. 1.75x → 75% bonus
  };

  const getEffectiveApy = (baseApy: number): number => {
    return baseApy + getWisdomBonus(baseApy) + getBuilderBonus(baseApy);
  };

  const calculateOptimalAllocation = () => {
    const allocations = [...strategies];
    
    switch (optimizeMode) {
      case "conservative":
        allocations.forEach(strategy => {
          if (strategy.risk === "low") strategy.allocation = 70;
          if (strategy.risk === "medium") strategy.allocation = 25;
          if (strategy.risk === "high") strategy.allocation = 5;
        });
        break;
      case "balanced":
        allocations.forEach(strategy => {
          if (strategy.risk === "low") strategy.allocation = 40;
          if (strategy.risk === "medium") strategy.allocation = 45;
          if (strategy.risk === "high") strategy.allocation = 15;
        });
        break;
      case "growth":
        allocations.forEach(strategy => {
          if (strategy.risk === "low") strategy.allocation = 25;
          if (strategy.risk === "medium") strategy.allocation = 45;
          if (strategy.risk === "high") strategy.allocation = 30;
        });
        break;
    }
    
    setStrategies(allocations);
    toast({
      title: "Portfolio Optimized!",
      description: `Allocation updated for ${optimizeMode} strategy with biblical wisdom`,
    });
  };

  const activateStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy => ({
      ...strategy,
      isActive: strategy.id === strategyId ? !strategy.isActive : strategy.isActive
    })));
    
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy) {
      toast({
        title: strategy.isActive ? "Strategy Deactivated" : "Strategy Activated",
        description: `${strategy.name} ${strategy.isActive ? "removed from" : "added to"} your portfolio`,
      });
    }
  };

  const calculateTotalApy = (): number => {
    const activeStrategies = strategies.filter(s => s.isActive);
    const totalAllocation = activeStrategies.reduce((sum, s) => sum + s.allocation, 0);
    
    if (totalAllocation === 0) return 0;
    
    const weightedApy = activeStrategies.reduce((sum, strategy) => {
      const effective = getEffectiveApy(strategy.currentApy);
      return sum + (effective * strategy.allocation / totalAllocation);
    }, 0);
    
    return weightedApy;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400 border-green-400";
      case "medium": return "text-yellow-400 border-yellow-400";
      case "high": return "text-red-400 border-red-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  const totalApy = calculateTotalApy();
  const estimatedYearlyEarnings = userBalance * (totalApy / 100);

  return (
    <div className="space-y-6">
      {/* No sound effect needed here - removing */}
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-ancient-gold/30 bg-gradient-to-br from-black/60 to-ancient-gold/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Portfolio APY</p>
                <p className="text-2xl font-bold text-ancient-gold">{totalApy.toFixed(2)}%</p>
                {wisdomScore > 0 && (
                  <p className="text-xs text-purple-400">+Wisdom Bonus Applied</p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-ancient-gold animate-pulse-glow" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-scripture/30 bg-gradient-to-br from-black/60 to-scripture/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Estimated Yearly</p>
                <p className="text-2xl font-bold text-scripture-light">
                  ${estimatedYearlyEarnings.toFixed(0)}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-scripture-light" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-gradient-to-br from-black/60 to-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Active Strategies</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {strategies.filter(s => s.isActive).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Controls */}
      <Card className="border-scripture/30 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="text-ancient-gold" />
            Biblical Yield Optimization
          </CardTitle>
          <CardDescription>
            Optimize your portfolio according to biblical principles of stewardship
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={optimizeMode} onValueChange={(value) => setOptimizeMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conservative">Proverbs (Conservative)</TabsTrigger>
              <TabsTrigger value="balanced">Talents (Balanced)</TabsTrigger>
              <TabsTrigger value="growth">Nehemiah (Growth)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conservative" className="mt-4">
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-scroll text-lg text-ancient-gold mb-2">Conservative Approach</h4>
                <p className="text-sm text-white/70 mb-2">
                  Following Solomon's wisdom: "Steady plodding brings prosperity" (Proverbs 21:5)
                </p>
                <p className="text-xs text-white/60">70% Low Risk • 25% Medium Risk • 5% High Risk</p>
              </div>
            </TabsContent>
            
            <TabsContent value="balanced" className="mt-4">
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-scroll text-lg text-ancient-gold mb-2">Balanced Stewardship</h4>
                <p className="text-sm text-white/70 mb-2">
                  "Be faithful with little to receive much" (Matthew 25:21)
                </p>
                <p className="text-xs text-white/60">40% Low Risk • 45% Medium Risk • 15% High Risk</p>
              </div>
            </TabsContent>
            
            <TabsContent value="growth" className="mt-4">
              <div className="p-4 bg-black/20 rounded-lg">
                <h4 className="font-scroll text-lg text-ancient-gold mb-2">Growth-Focused</h4>
                <p className="text-sm text-white/70 mb-2">
                  "Building with purpose and vision" (Nehemiah 2:20)
                </p>
                <p className="text-xs text-white/60">25% Low Risk • 45% Medium Risk • 30% High Risk</p>
              </div>
            </TabsContent>
          </Tabs>
          
          <Button 
            onClick={calculateOptimalAllocation}
            className="w-full mt-4 bg-ancient-gold text-black hover:bg-ancient-gold/80"
          >
            Apply Biblical Optimization
          </Button>
        </CardContent>
      </Card>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy) => {
          const effectiveApy = getEffectiveApy(strategy.currentApy);
          const wisdomBonus = getWisdomBonus(strategy.currentApy);
          const builderBonus = getBuilderBonus(strategy.currentApy);
          
          return (
            <Card 
              key={strategy.id} 
              className={`border transition-all duration-300 ${
                strategy.isActive 
                  ? "border-ancient-gold bg-gradient-to-br from-black/60 to-ancient-gold/10" 
                  : "border-scripture/30 bg-black/40 hover:border-scripture/50"
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-ancient-gold">{strategy.name}</CardTitle>
                    <CardDescription className="text-sm">{strategy.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getRiskColor(strategy.risk)}>
                    {strategy.risk.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/70">Base APY</p>
                    <p className="text-xl font-bold text-scripture-light">{strategy.currentApy}%</p>
                    {wisdomBonus > 0 && (
                      <p className="text-xs text-purple-400">+{wisdomBonus.toFixed(1)}% Wisdom</p>
                    )}
                    {builderBonus > 0 && (
                      <p className="text-xs text-secondary">+{builderBonus.toFixed(1)}% Builder ({builderTier})</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white/70">TVL</p>
                    <p className="text-lg font-semibold text-white">
                      ${(strategy.tvl / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Portfolio Allocation</span>
                    <span className="text-ancient-gold">{strategy.allocation}%</span>
                  </div>
                  <Progress value={strategy.allocation} className="h-2" />
                </div>

                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-ancient-gold mt-0.5" />
                    <div>
                      <p className="text-xs text-white/90 italic">"{strategy.biblicalPrinciple}"</p>
                      <p className="text-xs text-ancient-gold/70 mt-1">{strategy.scriptureReference}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => activateStrategy(strategy.id)}
                  variant={strategy.isActive ? "destructive" : "outline"}
                  className={strategy.isActive 
                    ? "w-full" 
                    : "w-full border-ancient-gold text-ancient-gold hover:bg-ancient-gold/20"
                  }
                >
                  {strategy.isActive ? "Deactivate Strategy" : "Activate Strategy"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BiblicalYieldOptimizer;