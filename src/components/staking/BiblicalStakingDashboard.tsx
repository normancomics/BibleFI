import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Coins, Crown, Star, TrendingUp, Shield, Clock, Users } from "lucide-react";
import SoundEffect from "@/components/SoundEffect";
import { useToast } from "@/hooks/use-toast";

interface StakingPosition {
  id: string;
  poolName: string;
  amount: number;
  token: string;
  apy: number;
  startDate: Date;
  lockPeriod: number;
  currentRewards: number;
  wisdomBonus: number;
}

interface BiblicalStakingDashboardProps {
  userAddress?: string | null;
  wisdomScore?: number;
}

const BiblicalStakingDashboard: React.FC<BiblicalStakingDashboardProps> = ({ 
  userAddress, 
  wisdomScore = 0 
}) => {
  const [activePositions, setActivePositions] = useState<StakingPosition[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [selectedPool, setSelectedPool] = useState<string>("");
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    if (userAddress) {
      setActivePositions([
        {
          id: "1",
          poolName: "Proverbs Pool",
          amount: 1000,
          token: "USDC",
          apy: 3.5,
          startDate: new Date("2024-01-15"),
          lockPeriod: 30,
          currentRewards: 12.35,
          wisdomBonus: 0.5
        },
        {
          id: "2", 
          poolName: "Talents Pool",
          amount: 2500,
          token: "USDC",
          apy: 5.2,
          startDate: new Date("2024-02-01"),
          lockPeriod: 90,
          currentRewards: 45.67,
          wisdomBonus: 0.8
        }
      ]);
      setTotalValue(3500);
      setTotalRewards(58.02);
    }
  }, [userAddress]);

  const handleClaimRewards = (positionId: string) => {
    const position = activePositions.find(p => p.id === positionId);
    if (position) {
      toast({
        title: "Rewards Claimed!",
        description: `Successfully claimed ${position.currentRewards} ${position.token} from ${position.poolName}`,
      });
      
      // Update the position
      setActivePositions(prev => prev.map(p => 
        p.id === positionId 
          ? { ...p, currentRewards: 0 }
          : p
      ));
      
      setTotalRewards(prev => prev - position.currentRewards);
    }
  };

  const handleCompoundRewards = (positionId: string) => {
    const position = activePositions.find(p => p.id === positionId);
    if (position) {
      toast({
        title: "Rewards Compounded!",
        description: `Added ${position.currentRewards} ${position.token} to your stake in ${position.poolName}`,
      });
      
      // Update the position
      setActivePositions(prev => prev.map(p => 
        p.id === positionId 
          ? { 
              ...p, 
              amount: p.amount + p.currentRewards,
              currentRewards: 0 
            }
          : p
      ));
      
      setTotalRewards(prev => prev - position.currentRewards);
    }
  };

  const getDaysRemaining = (startDate: Date, lockPeriod: number): number => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + lockPeriod);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getWisdomTier = (score: number): { name: string; color: string; icon: React.ReactNode } => {
    if (score >= 80) return { name: "King Solomon", color: "text-ancient-gold", icon: <Crown className="w-4 h-4" /> };
    if (score >= 60) return { name: "Wise Steward", color: "text-purple-400", icon: <Star className="w-4 h-4" /> };
    if (score >= 40) return { name: "Faithful Servant", color: "text-blue-400", icon: <Shield className="w-4 h-4" /> };
    return { name: "New Believer", color: "text-gray-400", icon: <BookOpen className="w-4 h-4" /> };
  };

  const wisdomTier = getWisdomTier(wisdomScore);

  if (!userAddress) {
    return (
      <Card className="border-scripture/30 bg-black/40">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 text-ancient-gold mx-auto mb-4 animate-pulse-glow" />
          <h3 className="text-xl font-scroll text-ancient-gold mb-2">Connect Your Wallet</h3>
          <p className="text-white/70">
            Connect your wallet to view your biblical staking positions and start earning righteous returns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* No sound effect needed here - removing */}
      
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-ancient-gold/30 bg-gradient-to-br from-black/60 to-ancient-gold/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total Staked Value</p>
                <p className="text-2xl font-bold text-ancient-gold">${totalValue.toLocaleString()}</p>
              </div>
              <Coins className="w-8 h-8 text-ancient-gold animate-float" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-scripture/30 bg-gradient-to-br from-black/60 to-scripture/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total Rewards</p>
                <p className="text-2xl font-bold text-scripture-light">${totalRewards.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-scripture-light animate-pulse-glow" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-gradient-to-br from-black/60 to-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Active Positions</p>
                <p className="text-2xl font-bold text-emerald-400">{activePositions.length}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30 bg-gradient-to-br from-black/60 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Wisdom Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-400">{wisdomScore}</span>
                  {wisdomTier.icon}
                </div>
                <Badge variant="outline" className={`text-xs ${wisdomTier.color} border-current`}>
                  {wisdomTier.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card className="border-scripture/30 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-ancient-gold" />
            Your Biblical Staking Positions
          </CardTitle>
          <CardDescription>
            Faithful stewardship of your resources according to biblical principles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activePositions.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-ancient-gold/50 mx-auto mb-4" />
              <p className="text-white/70">No active staking positions. Start with the Proverbs Pool!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePositions.map((position) => {
                const daysRemaining = getDaysRemaining(position.startDate, position.lockPeriod);
                const progress = ((position.lockPeriod - daysRemaining) / position.lockPeriod) * 100;
                const effectiveAPY = position.apy + position.wisdomBonus;
                
                return (
                  <Card key={position.id} className="border-ancient-gold/20 bg-black/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-scroll text-ancient-gold">{position.poolName}</h3>
                          <p className="text-sm text-white/70">
                            {position.amount.toLocaleString()} {position.token} • {effectiveAPY.toFixed(1)}% APY
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white/70">Current Rewards</p>
                          <p className="text-xl font-bold text-scripture-light">
                            {position.currentRewards.toFixed(2)} {position.token}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Lock Period Progress</span>
                          <span className="text-ancient-gold">
                            {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Unlocked"}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        
                        {position.wisdomBonus > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400">
                              +{position.wisdomBonus}% Wisdom Bonus Applied
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClaimRewards(position.id)}
                          disabled={position.currentRewards === 0}
                          className="border-scripture text-scripture hover:bg-scripture/20"
                        >
                          Claim Rewards
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompoundRewards(position.id)}
                          disabled={position.currentRewards === 0}
                          className="border-ancient-gold text-ancient-gold hover:bg-ancient-gold/20"
                        >
                          Compound
                        </Button>
                        {daysRemaining === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500/20"
                          >
                            Unstake
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Biblical Wisdom Quote */}
      <Card className="border-ancient-gold/30 bg-gradient-to-r from-black/60 to-ancient-gold/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-ancient-gold mt-1 animate-pulse-glow" />
            <div>
              <p className="italic text-white/90 mb-2">
                "Dishonest money dwindles away, but whoever gathers money little by little makes it grow."
              </p>
              <p className="text-sm text-ancient-gold">Proverbs 13:11</p>
              <p className="text-xs text-white/70 mt-2">
                Biblical principle: Steady, patient accumulation leads to lasting wealth
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiblicalStakingDashboard;