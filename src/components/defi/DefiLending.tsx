
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LendingBorrowingCard from './LendingBorrowingCard';
import PortfolioAnalytics from './PortfolioAnalytics';
import { RefreshCw, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";

const DefiLending: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isLoading, setIsLoading] = useState(false);

  // Mock lending pools data
  const lendingPools = [
    {
      id: "1",
      token: "USDC",
      supplyAPY: "4.2%",
      borrowAPY: "6.8%",
      totalSupplied: "2.1M",
      totalBorrowed: "1.4M",
      mySupplied: "500.00",
      myBorrowed: "0.00",
      collateralFactor: "80%",
      liquidationThreshold: "85%",
      biblicalPrinciple: {
        verse: "If you lend money to any of my people with you who is poor, you shall not be like a moneylender to him, and you shall not exact interest from him.",
        reference: "Exodus 22:25",
        principle: "Ethical Lending Without Exploitation"
      }
    },
    {
      id: "2", 
      token: "ETH",
      supplyAPY: "3.8%",
      borrowAPY: "7.2%",
      totalSupplied: "1.8M",
      totalBorrowed: "1.1M",
      mySupplied: "0.00",
      myBorrowed: "0.25",
      collateralFactor: "75%",
      liquidationThreshold: "80%",
      biblicalPrinciple: {
        verse: "The rich rules over the poor, and the borrower is the slave of the lender.",
        reference: "Proverbs 22:7",
        principle: "Understanding the Responsibility of Borrowing"
      }
    }
  ];

  // Mock portfolio analytics data
  const portfolioData = {
    totalValue: "2,847.92",
    dailyChange: "+1.8%",
    weeklyChange: "-0.5%",
    monthlyChange: "+12.3%",
    allocation: {
      tokens: 45,
      liquidity: 25,
      staking: 20,
      lending: 10
    },
    riskScore: 42,
    diversificationScore: 78
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    playSound("powerup");
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Lending Pools Refreshed",
        description: "Latest rates and positions updated.",
      });
    }, 1500);
  };

  const handleSupply = (poolId: string, amount: string) => {
    console.log(`Supplying ${amount} to pool ${poolId}`);
    // Implementation would connect to actual lending protocols
  };

  const handleWithdraw = (poolId: string, amount: string) => {
    console.log(`Withdrawing ${amount} from pool ${poolId}`);
    // Implementation would connect to actual lending protocols
  };

  const handleBorrow = (poolId: string, amount: string) => {
    console.log(`Borrowing ${amount} from pool ${poolId}`);
    // Implementation would connect to actual lending protocols
  };

  const handleRepay = (poolId: string, amount: string) => {
    console.log(`Repaying ${amount} to pool ${poolId}`);
    // Implementation would connect to actual lending protocols
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-ancient-gold/30 bg-gradient-to-br from-green-900/20 to-black/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-scroll flex items-center gap-2">
            <Banknote className="text-green-400" />
            Biblical Lending & Borrowing
          </CardTitle>
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
          <p className="text-white/80">
            Supply assets to earn interest or borrow against your collateral, guided by biblical principles of fair lending.
          </p>
        </CardContent>
      </Card>

      {/* Portfolio Analytics */}
      <PortfolioAnalytics data={portfolioData} />

      {/* Lending Pools */}
      <div className="space-y-4">
        <h3 className="text-xl font-scroll text-ancient-gold">Lending Pools</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {lendingPools.map((pool) => (
            <LendingBorrowingCard
              key={pool.id}
              pool={pool}
              onSupply={handleSupply}
              onWithdraw={handleWithdraw}
              onBorrow={handleBorrow}
              onRepay={handleRepay}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefiLending;
