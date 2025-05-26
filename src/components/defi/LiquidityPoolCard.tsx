
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Droplets, Plus, Minus, TrendingUp, Shield, BookOpen } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";

interface LiquidityPool {
  id: string;
  name: string;
  token1: string;
  token2: string;
  apy: string;
  tvl: string;
  volume24h: string;
  fees: string;
  myLiquidity: string;
  biblicalPrinciple: {
    verse: string;
    reference: string;
  };
}

interface LiquidityPoolCardProps {
  pool: LiquidityPool;
  onAddLiquidity?: (poolId: string, amount1: string, amount2: string) => void;
  onRemoveLiquidity?: (poolId: string, percentage: number) => void;
}

const LiquidityPoolCard: React.FC<LiquidityPoolCardProps> = ({
  pool,
  onAddLiquidity,
  onRemoveLiquidity
}) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [removePercentage, setRemovePercentage] = useState(25);
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

  const handleAddLiquidity = () => {
    if (!amount1 || !amount2) {
      toast({
        title: "Missing Amounts",
        description: "Please enter amounts for both tokens.",
        variant: "destructive",
      });
      return;
    }

    playSound("powerup");
    onAddLiquidity?.(pool.id, amount1, amount2);
    
    toast({
      title: "Liquidity Added",
      description: `Added ${amount1} ${pool.token1} and ${amount2} ${pool.token2} to the pool.`,
    });

    setAmount1("");
    setAmount2("");
  };

  const handleRemoveLiquidity = () => {
    playSound("select");
    onRemoveLiquidity?.(pool.id, removePercentage);
    
    toast({
      title: "Liquidity Removed",
      description: `Removed ${removePercentage}% of your liquidity from ${pool.name}.`,
    });
  };

  const getRiskColor = () => {
    const apyNum = parseFloat(pool.apy);
    if (apyNum < 5) return "text-green-500";
    if (apyNum < 15) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="border border-ancient-gold/20 hover:border-ancient-gold/40 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="text-blue-400" size={20} />
              {pool.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{pool.token1}/{pool.token2}</span>
              <Badge variant="outline" className="text-xs">
                {pool.fees} fee
              </Badge>
            </CardDescription>
          </div>
          <Badge className={`${getRiskColor()} bg-black/30 border-current`}>
            {pool.apy} APY
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/60">TVL</p>
            <p className="font-medium">${pool.tvl}</p>
          </div>
          <div>
            <p className="text-white/60">Volume 24h</p>
            <p className="font-medium">${pool.volume24h}</p>
          </div>
          <div>
            <p className="text-white/60">My Liquidity</p>
            <p className="font-medium">${pool.myLiquidity}</p>
          </div>
        </div>

        <div className="bg-black/20 p-3 rounded-md border border-ancient-gold/20">
          <div className="flex items-center gap-2 text-ancient-gold mb-2">
            <BookOpen size={14} />
            <span className="text-sm font-medium">Biblical Wisdom</span>
          </div>
          <p className="text-xs italic text-white/80">"{pool.biblicalPrinciple.verse}"</p>
          <p className="text-xs text-ancient-gold/70 text-right mt-1">
            {pool.biblicalPrinciple.reference}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isExpanded ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              playSound("click");
              setIsExpanded(!isExpanded);
            }}
            className="flex-1"
          >
            {isExpanded ? "Hide Details" : "Manage Position"}
          </Button>
          <PixelButton
            size="sm"
            onClick={() => {
              playSound("powerup");
              toast({
                title: "Pool Analytics",
                description: "Opening detailed pool analytics...",
              });
            }}
            farcasterStyle
          >
            <TrendingUp size={16} />
          </PixelButton>
        </div>

        {isExpanded && (
          <div className="border-t border-ancient-gold/20 pt-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === "add" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("add")}
                className="flex-1"
              >
                <Plus size={16} className="mr-1" />
                Add
              </Button>
              <Button
                variant={activeTab === "remove" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("remove")}
                className="flex-1"
              >
                <Minus size={16} className="mr-1" />
                Remove
              </Button>
            </div>

            {activeTab === "add" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/70">{pool.token1} Amount</label>
                    <Input
                      value={amount1}
                      onChange={(e) => setAmount1(e.target.value)}
                      placeholder="0.0"
                      className="bg-black/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70">{pool.token2} Amount</label>
                    <Input
                      value={amount2}
                      onChange={(e) => setAmount2(e.target.value)}
                      placeholder="0.0"
                      className="bg-black/30"
                    />
                  </div>
                </div>
                <PixelButton
                  onClick={handleAddLiquidity}
                  className="w-full"
                  farcasterStyle
                >
                  Add Liquidity
                </PixelButton>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/70 mb-2 block">
                    Remove {removePercentage}% of liquidity
                  </label>
                  <Progress value={removePercentage} className="mb-2" />
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((percent) => (
                      <Button
                        key={percent}
                        variant={removePercentage === percent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRemovePercentage(percent)}
                        className="flex-1 text-xs"
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                </div>
                <PixelButton
                  onClick={handleRemoveLiquidity}
                  className="w-full"
                  variant="outline"
                  farcasterStyle
                >
                  Remove Liquidity
                </PixelButton>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiquidityPoolCard;
