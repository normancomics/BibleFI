import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Info, BookOpen, Droplets } from "lucide-react";
import { baseTokens } from "@/data/baseTokens";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";

interface Pool {
  id: string;
  token0: string;
  token1: string;
  token0Reserve: string;
  token1Reserve: string;
  apy: string;
  totalLiquidity: string;
  myLiquidity: string;
  fees24h: string;
  volume24h: string;
  biblicalWisdom: {
    principle: string;
    verse: string;
    reference: string;
  };
}

const pools: Pool[] = [
  {
    id: 'usdc-eth',
    token0: 'USDC',
    token1: 'ETH',
    token0Reserve: '1,234,567',
    token1Reserve: '543.21',
    apy: '8.5%',
    totalLiquidity: '$2,456,789',
    myLiquidity: '$0',
    fees24h: '$1,234',
    volume24h: '$456,789',
    biblicalWisdom: {
      principle: "Partnership in Business",
      verse: "Two are better than one, because they have a good return for their labor.",
      reference: "Ecclesiastes 4:9"
    }
  },
  {
    id: 'dai-usdc',
    token0: 'DAI',
    token1: 'USDC',
    token0Reserve: '890,123',
    token1Reserve: '891,456',
    apy: '4.2%',
    totalLiquidity: '$1,781,579',
    myLiquidity: '$0',
    fees24h: '$234',
    volume24h: '$67,890',
    biblicalWisdom: {
      principle: "Stable Foundation",
      verse: "Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock.",
      reference: "Matthew 7:24"
    }
  }
];

const LiquidityProvisionCard: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [selectedPool, setSelectedPool] = useState<Pool>(pools[0]);
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [removePercentage, setRemovePercentage] = useState(25);

  const handleAddLiquidity = () => {
    if (!amount0 || !amount1 || parseFloat(amount0) <= 0 || parseFloat(amount1) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter valid amounts for both tokens.",
        variant: "destructive",
      });
      return;
    }

    playSound("powerup");
    toast({
      title: "Liquidity Added",
      description: `Successfully added ${amount0} ${selectedPool.token0} and ${amount1} ${selectedPool.token1} to the pool`,
    });
    setAmount0("");
    setAmount1("");
  };

  const handleRemoveLiquidity = () => {
    if (parseFloat(selectedPool.myLiquidity.replace(/[$,]/g, '')) === 0) {
      toast({
        title: "No Liquidity",
        description: "You don't have any liquidity in this pool to remove.",
        variant: "destructive",
      });
      return;
    }

    playSound("select");
    toast({
      title: "Liquidity Removed",
      description: `Successfully removed ${removePercentage}% of your liquidity`,
    });
  };

  const getTokenLogo = (symbol: string) => {
    const token = baseTokens[symbol as keyof typeof baseTokens];
    return token?.logoURI || null;
  };

  return (
    <Card className="border-scripture/30 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-ancient-gold" />
          <span>Liquidity Provision</span>
        </CardTitle>
        <CardDescription>
          Provide liquidity to earn fees and rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pool Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Select Pool</label>
          <div className="grid grid-cols-1 gap-2">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPool.id === pool.id
                    ? 'border-ancient-gold bg-ancient-gold/10'
                    : 'border-white/20 hover:border-white/40 bg-black/20'
                }`}
                onClick={() => setSelectedPool(pool)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      {getTokenLogo(pool.token0) && (
                        <img 
                          src={getTokenLogo(pool.token0)!} 
                          alt={pool.token0}
                          className="w-6 h-6 rounded-full border border-white/20"
                        />
                      )}
                      {getTokenLogo(pool.token1) && (
                        <img 
                          src={getTokenLogo(pool.token1)!} 
                          alt={pool.token1}
                          className="w-6 h-6 rounded-full border border-white/20"
                        />
                      )}
                    </div>
                    <span className="font-medium text-white">
                      {pool.token0}/{pool.token1}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-ancient-gold border-ancient-gold/50">
                    {pool.apy} APY
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-black/30 rounded-lg border border-white/10">
          <div>
            <p className="text-xs text-white/60">Total Liquidity</p>
            <p className="font-medium text-white">{selectedPool.totalLiquidity}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">24h Volume</p>
            <p className="font-medium text-white">{selectedPool.volume24h}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">24h Fees</p>
            <p className="font-medium text-green-400">{selectedPool.fees24h}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">My Liquidity</p>
            <p className="font-medium text-ancient-gold">{selectedPool.myLiquidity}</p>
          </div>
        </div>

        {/* Add/Remove Liquidity */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "add" | "remove")}>
          <TabsList className="grid grid-cols-2 bg-black/30">
            <TabsTrigger value="add" className="data-[state=active]:bg-green-600/30">
              <Plus className="h-4 w-4 mr-1" />
              Add Liquidity
            </TabsTrigger>
            <TabsTrigger value="remove" className="data-[state=active]:bg-red-600/30">
              <Minus className="h-4 w-4 mr-1" />
              Remove Liquidity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-3 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border">
                {getTokenLogo(selectedPool.token0) && (
                  <img 
                    src={getTokenLogo(selectedPool.token0)!} 
                    alt={selectedPool.token0}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <Input
                  value={amount0}
                  onChange={(e) => setAmount0(e.target.value)}
                  placeholder={`${selectedPool.token0} amount`}
                  className="border-0 bg-transparent"
                />
                <span className="text-sm text-white/60">{selectedPool.token0}</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border">
                {getTokenLogo(selectedPool.token1) && (
                  <img 
                    src={getTokenLogo(selectedPool.token1)!} 
                    alt={selectedPool.token1}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <Input
                  value={amount1}
                  onChange={(e) => setAmount1(e.target.value)}
                  placeholder={`${selectedPool.token1} amount`}
                  className="border-0 bg-transparent"
                />
                <span className="text-sm text-white/60">{selectedPool.token1}</span>
              </div>

              <Button onClick={handleAddLiquidity} className="w-full">
                Add Liquidity
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="remove" className="space-y-3 mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-white/80">Amount to Remove: {removePercentage}%</label>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      variant={removePercentage === percent ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRemovePercentage(percent)}
                      className="flex-1"
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleRemoveLiquidity} 
                className="w-full"
                disabled={parseFloat(selectedPool.myLiquidity.replace(/[$,]/g, '')) === 0}
              >
                Remove Liquidity
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Biblical Wisdom */}
        <div className="bg-black/30 p-3 rounded-lg border border-ancient-gold/20">
          <div className="flex items-center gap-2 text-ancient-gold mb-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">{selectedPool.biblicalWisdom.principle}</span>
          </div>
          <p className="text-xs italic text-white/80">"{selectedPool.biblicalWisdom.verse}"</p>
          <p className="text-xs text-ancient-gold/70 text-right mt-1">
            {selectedPool.biblicalWisdom.reference}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiquidityProvisionCard;