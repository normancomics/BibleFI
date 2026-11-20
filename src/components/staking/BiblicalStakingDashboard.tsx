import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Coins, Crown, Star, TrendingUp, Shield, Users } from "lucide-react";

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
  // Staking pool contracts are not live on Base yet, so there are no real positions to show.
  const activePositions: StakingPosition[] = [];
  const totalValue = 0;
  const totalRewards = 0;

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
              <p className="text-white/70">No staking positions yet. Pools are previews until their contracts go live on Base — nothing is staked on your behalf.</p>
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