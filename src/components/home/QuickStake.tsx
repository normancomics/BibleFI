import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const stakingPools = [
  { id: "usdc", name: "USDC", apy: "8.5%", verse: "Proverbs 21:5" },
  { id: "eth", name: "ETH", apy: "12.3%", verse: "Ecclesiastes 11:2" },
  { id: "dai", name: "DAI", apy: "7.8%", verse: "Matthew 25:27" },
];

const QuickStake: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState("usdc");
  const { toast } = useToast();

  const currentPool = stakingPools.find(pool => pool.id === selectedPool);

  const handleStake = () => {
    if (!amount) {
      toast({
        title: "Enter Amount",
        description: "Please enter an amount to stake",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Staking Initiated",
      description: `Staking ${amount} ${currentPool?.name} at ${currentPool?.apy} APY`,
    });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Quick Stake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pool Selection */}
        <div className="space-y-2">
          <label className="text-sm text-gray-500">Staking Pool</label>
          <Select value={selectedPool} onValueChange={setSelectedPool}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stakingPools.map((pool) => (
                <SelectItem key={pool.id} value={pool.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{pool.name}</span>
                    <span className="text-green-600 font-medium">{pool.apy}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-500">Amount</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Pool Details */}
        {currentPool && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Expected APY</span>
              <span className="text-sm font-semibold text-green-600">{currentPool.apy}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Biblical Principle</span>
              <span className="text-xs text-gray-500">{currentPool.verse}</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleStake}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Stake Tokens
        </Button>

        <p className="text-xs text-gray-500 text-center">
          "The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5
        </p>
      </CardContent>
    </Card>
  );
};

export default QuickStake;