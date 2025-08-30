import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sprout, 
  TrendingUp, 
  Clock, 
  Coins,
  BookOpen,
  AlertTriangle,
  Wheat,
  Zap,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { GlowingText } from "@/components/ui/tailwind-extensions";
import { baseTokens } from "@/data/baseTokens";

interface YieldFarm {
  id: string;
  name: string;
  stakingToken: string;
  rewardToken: string;
  apy: number;
  tvl: string;
  dailyRewards: string;
  lockPeriod: number; // days
  risk: 'low' | 'medium' | 'high';
  biblicalPrinciple: string;
  verse: string;
  maxStakers: number;
  currentStakers: number;
  multiplier: number;
}

const biblicalFarms: YieldFarm[] = [
  {
    id: "parable-eth-farm",
    name: "Parable of the Talents Farm",
    stakingToken: "ETH",
    rewardToken: "BIBLE",
    apy: 24.5,
    tvl: "$1.2M",
    dailyRewards: "1,200 BIBLE",
    lockPeriod: 30,
    risk: 'medium',
    biblicalPrinciple: "Multiplying Talents",
    verse: "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things. - Matthew 25:23",
    maxStakers: 1000,
    currentStakers: 743,
    multiplier: 2.5
  },
  {
    id: "widow-mite-farm",
    name: "Widow's Mite Staking",
    stakingToken: "USDC",
    rewardToken: "BIBLE",
    apy: 15.8,
    tvl: "$890K",
    dailyRewards: "800 BIBLE",
    lockPeriod: 7,
    risk: 'low',
    biblicalPrinciple: "Faithful in Little",
    verse: "Truly I tell you, this poor widow has put more into the treasury than all the others. - Mark 12:43",
    maxStakers: 2000,
    currentStakers: 1456,
    multiplier: 1.0
  },
  {
    id: "solomons-wisdom-farm",
    name: "Solomon's Wisdom Vault",
    stakingToken: "DAI",
    rewardToken: "WISDOM",
    apy: 32.1,
    tvl: "$2.1M",
    dailyRewards: "500 WISDOM",
    lockPeriod: 90,
    risk: 'high',
    biblicalPrinciple: "Seeking Wisdom",
    verse: "The beginning of wisdom is this: Get wisdom, and whatever you get, get insight. - Proverbs 4:7",
    maxStakers: 500,
    currentStakers: 287,
    multiplier: 5.0
  },
  {
    id: "good-shepherd-farm",
    name: "Good Shepherd Pool",
    stakingToken: "WETH",
    rewardToken: "FAITH",
    apy: 19.7,
    tvl: "$1.5M",
    dailyRewards: "600 FAITH",
    lockPeriod: 14,
    risk: 'low',
    biblicalPrinciple: "Faithful Shepherd",
    verse: "I am the good shepherd. The good shepherd lays down his life for the sheep. - John 10:11",
    maxStakers: 1500,
    currentStakers: 892,
    multiplier: 1.8
  }
];

interface UserFarmPosition {
  farmId: string;
  stakedAmount: string;
  earnedRewards: string;
  stakingDate: Date;
  lockEndDate: Date;
  isLocked: boolean;
}

const BiblicalYieldFarming: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [selectedFarm, setSelectedFarm] = useState<YieldFarm | null>(null);
  const [activeTab, setActiveTab] = useState("farms");
  const [stakeAmount, setStakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPositions, setUserPositions] = useState<UserFarmPosition[]>([]);
  const [totalEarnings, setTotalEarnings] = useState("0");

  useEffect(() => {
    // Simulate earning rewards over time
    const interval = setInterval(() => {
      setUserPositions(prev => prev.map(position => {
        const farm = biblicalFarms.find(f => f.id === position.farmId);
        if (!farm) return position;
        
        const stakingAmount = parseFloat(position.stakedAmount);
        const dailyRate = farm.apy / 365 / 100;
        const newRewards = stakingAmount * dailyRate / 24; // hourly rewards
        const currentRewards = parseFloat(position.earnedRewards);
        
        return {
          ...position,
          earnedRewards: (currentRewards + newRewards).toFixed(6)
        };
      }));
    }, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  const handleFarmSelect = (farm: YieldFarm) => {
    playSound("select");
    setSelectedFarm(farm);
    setActiveTab("stake");
  };

  const handleStake = async () => {
    if (!selectedFarm || !stakeAmount) return;
    
    setIsLoading(true);
    playSound("powerup");
    
    toast({
      title: "Biblical Staking Initiated",
      description: `Staking ${stakeAmount} ${selectedFarm.stakingToken} in ${selectedFarm.name}`,
    });

    // Simulate transaction
    setTimeout(() => {
      setIsLoading(false);
      playSound("success");
      
      const lockEndDate = new Date();
      lockEndDate.setDate(lockEndDate.getDate() + selectedFarm.lockPeriod);
      
      const newPosition: UserFarmPosition = {
        farmId: selectedFarm.id,
        stakedAmount: stakeAmount,
        earnedRewards: "0",
        stakingDate: new Date(),
        lockEndDate,
        isLocked: selectedFarm.lockPeriod > 0
      };
      
      setUserPositions(prev => [...prev, newPosition]);
      setStakeAmount("");
      
      toast({
        title: "Staking Successful",
        description: `Your ${stakeAmount} ${selectedFarm.stakingToken} is now working faithfully in ${selectedFarm.name}. May it multiply like the talents in the parable!`,
      });
    }, 2000);
  };

  const handleHarvest = (farmId: string) => {
    playSound("coin");
    const position = userPositions.find(p => p.farmId === farmId);
    const farm = biblicalFarms.find(f => f.id === farmId);
    
    if (position && farm) {
      const harvestedAmount = position.earnedRewards;
      setTotalEarnings(prev => (parseFloat(prev) + parseFloat(harvestedAmount)).toFixed(6));
      
      setUserPositions(prev => prev.map(p => 
        p.farmId === farmId ? { ...p, earnedRewards: "0" } : p
      ));
      
      toast({
        title: "Harvest Successful",
        description: `Harvested ${harvestedAmount} ${farm.rewardToken} tokens. "The harvest is plentiful!" - Matthew 9:37`,
      });
    }
  };

  const handleUnstake = (farmId: string) => {
    const position = userPositions.find(p => p.farmId === farmId);
    const farm = biblicalFarms.find(f => f.id === farmId);
    
    if (position && farm) {
      if (position.isLocked && new Date() < position.lockEndDate) {
        toast({
          title: "Still Locked",
          description: `Your stake is locked until ${position.lockEndDate.toLocaleDateString()}. "Wait for the Lord; be strong and take heart and wait for the Lord." - Psalm 27:14`,
          variant: "destructive"
        });
        return;
      }
      
      playSound("success");
      
      // Add harvested rewards to total
      if (parseFloat(position.earnedRewards) > 0) {
        setTotalEarnings(prev => (parseFloat(prev) + parseFloat(position.earnedRewards)).toFixed(6));
      }
      
      setUserPositions(prev => prev.filter(p => p.farmId !== farmId));
      
      toast({
        title: "Unstaking Complete",
        description: `Withdrawn ${position.stakedAmount} ${farm.stakingToken} and harvested ${position.earnedRewards} ${farm.rewardToken}`,
      });
    }
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
          Biblical Yield Farming
        </GlowingText>
        <p className="text-white/80 max-w-2xl mx-auto">
          Multiply your digital assets through faithful farming, guided by biblical principles of patience, wisdom, and stewardship.
        </p>
      </div>

      <Alert className="border-ancient-gold/50 bg-ancient-gold/10">
        <Sprout className="h-4 w-4 text-ancient-gold" />
        <AlertDescription className="text-ancient-gold">
          <strong>Biblical Farming:</strong> "A man scatters seed on the ground. Night and day, whether he sleeps or gets up, 
          the seed sprouts and grows, though he does not know how." - Mark 4:26-27
        </AlertDescription>
      </Alert>

      {totalEarnings !== "0" && (
        <Card className="border-green-400/50 bg-green-400/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wheat className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Total Harvested Rewards</span>
              </div>
              <span className="text-lg font-bold text-green-400">{totalEarnings} Tokens</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="farms">Available Farms</TabsTrigger>
          <TabsTrigger value="stake">Stake & Earn</TabsTrigger>
          <TabsTrigger value="positions">My Farms</TabsTrigger>
        </TabsList>

        <TabsContent value="farms" className="space-y-4">
          <div className="grid gap-4">
            {biblicalFarms.map((farm) => (
              <Card key={farm.id} className="border-scripture/30 bg-black/40 hover:bg-black/60 transition-all cursor-pointer" 
                    onClick={() => handleFarmSelect(farm)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        <img 
                          src={baseTokens[farm.stakingToken]?.logoURI || '/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png'} 
                          alt={farm.stakingToken} 
                          className="w-8 h-8 rounded-full border-2 border-ancient-gold/50" 
                        />
                        <div className="w-8 h-8 rounded-full border-2 border-ancient-gold/50 bg-gradient-to-r from-ancient-gold to-yellow-600 flex items-center justify-center">
                          <Sprout className="w-4 h-4 text-black" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-ancient-gold">{farm.name}</h3>
                        <p className="text-sm text-white/60">Stake {farm.stakingToken} • Earn {farm.rewardToken}</p>
                      </div>
                    </div>
                    <Badge className={getRiskBadgeColor(farm.risk)}>
                      {farm.risk.toUpperCase()} RISK
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-white/60">APY</p>
                      <p className="text-lg font-bold text-green-400">{farm.apy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">TVL</p>
                      <p className="text-lg font-bold">{farm.tvl}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Daily Rewards</p>
                      <p className="text-lg font-bold">{farm.dailyRewards}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Lock Period</p>
                      <p className="text-lg font-bold">{farm.lockPeriod}d</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">Stakers</span>
                      <span>{farm.currentStakers} / {farm.maxStakers}</span>
                    </div>
                    <Progress 
                      value={(farm.currentStakers / farm.maxStakers) * 100} 
                      className="h-2 bg-black/30"
                    />
                  </div>

                  <div className="bg-black/30 p-3 rounded-lg border border-ancient-gold/20">
                    <p className="text-sm font-medium text-ancient-gold mb-1">{farm.biblicalPrinciple}</p>
                    <p className="text-xs text-white/80 italic">{farm.verse}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stake" className="space-y-4">
          {selectedFarm ? (
            <Card className="border-scripture/30 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sprout className="h-5 w-5 text-ancient-gold" />
                  <span>Stake in {selectedFarm.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-black/30 p-4 rounded-lg border border-ancient-gold/20">
                  <h4 className="text-ancient-gold font-medium mb-2">{selectedFarm.biblicalPrinciple}</h4>
                  <p className="text-sm text-white/80 italic">{selectedFarm.verse}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">
                      Stake Amount ({selectedFarm.stakingToken})
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="bg-black/30 border-scripture/30"
                      />
                      <img 
                        src={baseTokens[selectedFarm.stakingToken]?.logoURI || '/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png'} 
                        alt={selectedFarm.stakingToken} 
                        className="w-8 h-8" 
                      />
                    </div>
                  </div>

                  {stakeAmount && (
                    <div className="bg-black/30 p-4 rounded-lg space-y-3">
                      <h4 className="font-medium">Staking Preview</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">You will stake:</span>
                          <span>{stakeAmount} {selectedFarm.stakingToken}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Expected APY:</span>
                          <span className="text-green-400">{selectedFarm.apy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Lock period:</span>
                          <span>{selectedFarm.lockPeriod} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Daily rewards:</span>
                          <span>{((parseFloat(stakeAmount) || 0) * selectedFarm.apy / 365 / 100).toFixed(4)} {selectedFarm.rewardToken}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedFarm.lockPeriod > 0 && (
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-200">
                      This farm has a {selectedFarm.lockPeriod} day lock period. Your funds will be locked until the period ends.
                      "Wait for the Lord; be strong and take heart and wait for the Lord." - Psalm 27:14
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleStake}
                  disabled={!stakeAmount || isLoading}
                  className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-bold"
                >
                  {isLoading ? "Staking..." : `Stake ${selectedFarm.stakingToken}`}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-scripture/30 bg-black/40">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-ancient-gold mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Select a Farm</h3>
                <p className="text-white/60">Choose a biblical yield farm from the available farms tab to begin staking.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          {userPositions.length > 0 ? (
            <div className="space-y-4">
              {userPositions.map((position, index) => {
                const farm = biblicalFarms.find(f => f.id === position.farmId);
                if (!farm) return null;

                const isLocked = position.isLocked && new Date() < position.lockEndDate;
                const timeLeft = isLocked ? Math.ceil((position.lockEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

                return (
                  <Card key={index} className="border-scripture/30 bg-black/40">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-ancient-gold">{farm.name}</h3>
                        <div className="flex space-x-2">
                          {isLocked && (
                            <Badge className="bg-yellow-400/20 text-yellow-400">
                              LOCKED {timeLeft}d
                            </Badge>
                          )}
                          <Badge className="bg-green-400/20 text-green-400">ACTIVE</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-white/60">Staked</p>
                          <p className="text-lg font-bold">{position.stakedAmount} {farm.stakingToken}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60">Earned</p>
                          <p className="text-lg font-bold text-green-400">{position.earnedRewards} {farm.rewardToken}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60">APY</p>
                          <p className="text-lg font-bold">{farm.apy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60">Since</p>
                          <p className="text-sm">{position.stakingDate.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleHarvest(farm.id)}
                          disabled={parseFloat(position.earnedRewards) === 0}
                          variant="outline"
                          className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                        >
                          <Wheat className="w-4 h-4 mr-2" />
                          Harvest
                        </Button>
                        <Button
                          onClick={() => handleUnstake(farm.id)}
                          disabled={isLocked}
                          variant="outline"
                          className="border-ancient-gold text-ancient-gold hover:bg-ancient-gold hover:text-black"
                        >
                          Unstake
                        </Button>
                      </div>

                      {isLocked && (
                        <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                          <p className="text-sm text-yellow-200">
                            Your stake is locked for {timeLeft} more days. "Wait for the Lord; be strong and take heart and wait for the Lord." - Psalm 27:14
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-scripture/30 bg-black/40">
              <CardContent className="p-8 text-center">
                <Sprout className="h-12 w-12 text-ancient-gold mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Active Farms</h3>
                <p className="text-white/60 mb-4">You haven't staked in any yield farms yet.</p>
                <Button 
                  onClick={() => setActiveTab("farms")}
                  variant="outline" 
                  className="border-ancient-gold text-ancient-gold"
                >
                  Explore Farms
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BiblicalYieldFarming;