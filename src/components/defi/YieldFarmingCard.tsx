
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sprout, Clock, DollarSign, BookOpen, ArrowUpRight } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";

interface YieldFarm {
  id: string;
  name: string;
  stakingToken: string;
  rewardTokens: string[];
  apy: string;
  totalStaked: string;
  myStaked: string;
  pendingRewards: string;
  lockPeriod?: string;
  multiplier?: string;
  biblicalTeaching: {
    principle: string;
    verse: string;
    reference: string;
  };
}

interface YieldFarmingCardProps {
  farm: YieldFarm;
  onStake?: (farmId: string, amount: string) => void;
  onUnstake?: (farmId: string, amount: string) => void;
  onHarvest?: (farmId: string) => void;
}

const YieldFarmingCard: React.FC<YieldFarmingCardProps> = ({
  farm,
  onStake,
  onUnstake,
  onHarvest
}) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [activeAction, setActiveAction] = useState<"stake" | "unstake" | null>(null);

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount.",
        variant: "destructive",
      });
      return;
    }

    playSound("powerup");
    onStake?.(farm.id, stakeAmount);
    
    toast({
      title: "Tokens Staked",
      description: `Successfully staked ${stakeAmount} ${farm.stakingToken}`,
    });

    setStakeAmount("");
    setActiveAction(null);
  };

  const handleUnstake = () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid unstaking amount.",
        variant: "destructive",
      });
      return;
    }

    playSound("select");
    onUnstake?.(farm.id, unstakeAmount);
    
    toast({
      title: "Tokens Unstaked",
      description: `Successfully unstaked ${unstakeAmount} ${farm.stakingToken}`,
    });

    setUnstakeAmount("");
    setActiveAction(null);
  };

  const handleHarvest = () => {
    playSound("success");
    onHarvest?.(farm.id);
    
    toast({
      title: "Rewards Harvested",
      description: `Harvested ${farm.pendingRewards} rewards from ${farm.name}`,
    });
  };

  const getApyColor = () => {
    const apyNum = parseFloat(farm.apy);
    if (apyNum < 10) return "text-green-400";
    if (apyNum < 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="border border-scripture/30 hover:border-scripture/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sprout className="text-green-400" size={20} />
              {farm.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>Stake {farm.stakingToken}</span>
              {farm.multiplier && (
                <Badge variant="outline" className="text-xs text-ancient-gold border-ancient-gold/50">
                  {farm.multiplier}x
                </Badge>
              )}
            </CardDescription>
          </div>
          <Badge className={`${getApyColor()} bg-black/30 border-current`}>
            {farm.apy} APY
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60 flex items-center gap-1">
              <DollarSign size={12} />
              Total Staked
            </p>
            <p className="font-medium">${farm.totalStaked}</p>
          </div>
          <div>
            <p className="text-white/60 flex items-center gap-1">
              <Clock size={12} />
              {farm.lockPeriod ? "Lock Period" : "Flexible"}
            </p>
            <p className="font-medium">{farm.lockPeriod || "No lock"}</p>
          </div>
        </div>

        <div className="bg-scripture/10 p-3 rounded-md border border-scripture/20">
          <p className="text-sm font-medium text-white/90 mb-1">My Position</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-white/60">Staked</p>
              <p className="font-medium">{farm.myStaked} {farm.stakingToken}</p>
            </div>
            <div>
              <p className="text-white/60">Pending Rewards</p>
              <p className="font-medium text-green-400">{farm.pendingRewards}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-3 rounded-md border border-ancient-gold/20">
          <div className="flex items-center gap-2 text-ancient-gold mb-2">
            <BookOpen size={14} />
            <span className="text-sm font-medium">Biblical Teaching</span>
          </div>
          <p className="text-xs font-medium text-white/90 mb-1">{farm.biblicalTeaching.principle}</p>
          <p className="text-xs italic text-white/80">"{farm.biblicalTeaching.verse}"</p>
          <p className="text-xs text-ancient-gold/70 text-right mt-1">
            {farm.biblicalTeaching.reference}
          </p>
        </div>

        <div className="space-y-2">
          {parseFloat(farm.pendingRewards) > 0 && (
            <PixelButton
              onClick={handleHarvest}
              className="w-full bg-green-600 hover:bg-green-700"
              farcasterStyle
            >
              <ArrowUpRight size={16} className="mr-2" />
              Harvest {farm.pendingRewards} Rewards
            </PixelButton>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={activeAction === "stake" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveAction(activeAction === "stake" ? null : "stake")}
              className="text-xs"
            >
              Stake
            </Button>
            <Button
              variant={activeAction === "unstake" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveAction(activeAction === "unstake" ? null : "unstake")}
              className="text-xs"
              disabled={parseFloat(farm.myStaked) === 0}
            >
              Unstake
            </Button>
          </div>

          {activeAction === "stake" && (
            <div className="space-y-2">
              <Input
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder={`Amount to stake (${farm.stakingToken})`}
                className="bg-black/30"
              />
              <PixelButton
                onClick={handleStake}
                className="w-full"
                size="sm"
                farcasterStyle
              >
                Stake Tokens
              </PixelButton>
            </div>
          )}

          {activeAction === "unstake" && (
            <div className="space-y-2">
              <Input
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder={`Amount to unstake (max: ${farm.myStaked})`}
                className="bg-black/30"
              />
              <PixelButton
                onClick={handleUnstake}
                className="w-full"
                size="sm"
                variant="outline"
                farcasterStyle
              >
                Unstake Tokens
              </PixelButton>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default YieldFarmingCard;
