
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, TrendingDown, TrendingUp, AlertTriangle, BookOpen } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { baseTokens } from "@/data/baseTokens";

interface LendingPool {
  id: string;
  token: string;
  supplyAPY: string;
  borrowAPY: string;
  totalSupplied: string;
  totalBorrowed: string;
  mySupplied: string;
  myBorrowed: string;
  collateralFactor: string;
  liquidationThreshold: string;
  biblicalPrinciple: {
    verse: string;
    reference: string;
    principle: string;
  };
}

interface LendingBorrowingCardProps {
  pool: LendingPool;
  onSupply?: (poolId: string, amount: string) => void;
  onWithdraw?: (poolId: string, amount: string) => void;
  onBorrow?: (poolId: string, amount: string) => void;
  onRepay?: (poolId: string, amount: string) => void;
}

const LendingBorrowingCard: React.FC<LendingBorrowingCardProps> = ({
  pool,
  onSupply,
  onWithdraw,
  onBorrow,
  onRepay
}) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [activeTab, setActiveTab] = useState<"supply" | "borrow">("supply");
  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  const handleSupply = () => {
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid supply amount.",
        variant: "destructive",
      });
      return;
    }

    playSound("powerup");
    onSupply?.(pool.id, supplyAmount);
    
    toast({
      title: "Tokens Supplied",
      description: `Successfully supplied ${supplyAmount} ${pool.token}`,
    });

    setSupplyAmount("");
  };

  const handleBorrow = () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid borrow amount.",
        variant: "destructive",
      });
      return;
    }

    playSound("select");
    onBorrow?.(pool.id, borrowAmount);
    
    toast({
      title: "Tokens Borrowed",
      description: `Successfully borrowed ${borrowAmount} ${pool.token}`,
    });

    setBorrowAmount("");
  };

  const getUtilizationRate = () => {
    const supplied = parseFloat(pool.totalSupplied.replace(/[^0-9.]/g, ''));
    const borrowed = parseFloat(pool.totalBorrowed.replace(/[^0-9.]/g, ''));
    return supplied > 0 ? ((borrowed / supplied) * 100).toFixed(1) : "0";
  };

  return (
    <Card className="border border-ancient-gold/20 hover:border-ancient-gold/40 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {baseTokens[pool.token as keyof typeof baseTokens]?.logoURI ? (
                <img 
                  src={baseTokens[pool.token as keyof typeof baseTokens].logoURI} 
                  alt={pool.token}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <Banknote className="text-green-400" size={20} />
              )}
              {pool.token} Lending Pool
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>Supply & Borrow {pool.token}</span>
              <Badge variant="outline" className="text-xs">
                {getUtilizationRate()}% utilized
              </Badge>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp size={12} />
              <span>{pool.supplyAPY} Supply</span>
            </div>
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <TrendingDown size={12} />
              <span>{pool.borrowAPY} Borrow</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60">Total Supplied</p>
            <p className="font-medium">${pool.totalSupplied}</p>
          </div>
          <div>
            <p className="text-white/60">Total Borrowed</p>
            <p className="font-medium">${pool.totalBorrowed}</p>
          </div>
        </div>

        <div className="bg-scripture/10 p-3 rounded-md border border-scripture/20">
          <p className="text-sm font-medium text-white/90 mb-1">My Position</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-white/60">Supplied</p>
              <p className="font-medium text-green-400">{pool.mySupplied} {pool.token}</p>
            </div>
            <div>
              <p className="text-white/60">Borrowed</p>
              <p className="font-medium text-red-400">{pool.myBorrowed} {pool.token}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-3 rounded-md border border-ancient-gold/20">
          <div className="flex items-center gap-2 text-ancient-gold mb-2">
            <BookOpen size={14} />
            <span className="text-sm font-medium">Biblical Principle</span>
          </div>
          <p className="text-xs font-medium text-white/90 mb-1">{pool.biblicalPrinciple.principle}</p>
          <p className="text-xs italic text-white/80">"{pool.biblicalPrinciple.verse}"</p>
          <p className="text-xs text-ancient-gold/70 text-right mt-1">
            {pool.biblicalPrinciple.reference}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "supply" | "borrow")}>
          <TabsList className="grid grid-cols-2 bg-black/30">
            <TabsTrigger value="supply" className="data-[state=active]:bg-green-600/30">
              Supply
            </TabsTrigger>
            <TabsTrigger value="borrow" className="data-[state=active]:bg-red-600/30">
              Borrow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supply" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Input
                value={supplyAmount}
                onChange={(e) => setSupplyAmount(e.target.value)}
                placeholder={`Amount to supply (${pool.token})`}
                className="bg-black/30"
              />
              <div className="flex gap-2">
                <PixelButton
                  onClick={handleSupply}
                  className="flex-1"
                  size="sm"
                  farcasterStyle
                >
                  Supply {pool.token}
                </PixelButton>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onWithdraw?.(pool.id, pool.mySupplied);
                    toast({
                      title: "Withdrawal Initiated",
                      description: `Withdrawing all supplied ${pool.token}`,
                    });
                  }}
                  disabled={parseFloat(pool.mySupplied) === 0}
                  className="flex-1"
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="borrow" className="space-y-3 mt-4">
            <div className="bg-amber-500/10 p-2 rounded border border-amber-500/30 mb-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs">
                <AlertTriangle size={12} />
                <span>Collateral Factor: {pool.collateralFactor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder={`Amount to borrow (${pool.token})`}
                className="bg-black/30"
              />
              <div className="flex gap-2">
                <PixelButton
                  onClick={handleBorrow}
                  className="flex-1"
                  size="sm"
                  variant="outline"
                  farcasterStyle
                >
                  Borrow {pool.token}
                </PixelButton>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRepay?.(pool.id, pool.myBorrowed);
                    toast({
                      title: "Repayment Initiated",
                      description: `Repaying all borrowed ${pool.token}`,
                    });
                  }}
                  disabled={parseFloat(pool.myBorrowed) === 0}
                  className="flex-1"
                >
                  Repay All
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LendingBorrowingCard;
