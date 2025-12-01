import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Heart, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

/**
 * Automated Tithing Calculator
 * References Malachi 3:10 and calculates 10% of all DeFi earnings
 */
const AutomatedTithingCalculator: React.FC = () => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  
  // Get wallet balance
  const { data: ethBalance } = useBalance({
    address: address,
  });

  const [defiEarnings, setDefiEarnings] = useState({
    staking: 0,
    lending: 0,
    yieldFarming: 0,
    trading: 0,
  });

  const [customAmount, setCustomAmount] = useState('');
  const [calculatedTithe, setCalculatedTithe] = useState(0);

  // Calculate total earnings
  const totalEarnings = Object.values(defiEarnings).reduce((sum, val) => sum + val, 0);
  
  // Calculate 10% tithe (Malachi 3:10)
  const titheAmount = totalEarnings * 0.10;

  useEffect(() => {
    setCalculatedTithe(titheAmount);
  }, [titheAmount]);

  const handleCustomCalculation = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid earning amount",
        variant: "destructive",
      });
      return;
    }

    const tithe = amount * 0.10;
    setCalculatedTithe(tithe);
    
    toast({
      title: "Tithe Calculated",
      description: `10% of $${amount.toFixed(2)} = $${tithe.toFixed(2)}`,
    });
  };

  const handleSetupTithe = () => {
    if (calculatedTithe === 0) {
      toast({
        title: "No Amount to Tithe",
        description: "Please calculate your tithe first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Setting Up Tithe",
      description: `Preparing to tithe $${calculatedTithe.toFixed(2)}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border-green-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="w-6 h-6 text-green-400" />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Automated Tithing Calculator
              </span>
            </CardTitle>
            <Badge variant="outline" className="border-green-500 text-green-400">
              Malachi 3:10
            </Badge>
          </div>
          
          <div className="mt-4 p-4 bg-scripture/40 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div className="text-sm text-white/90">
                <p className="font-semibold mb-2">Malachi 3:10 (KJV)</p>
                <p className="italic">
                  "Bring ye all the tithes into the storehouse, that there may be meat in mine house, 
                  and prove me now herewith, saith the LORD of hosts, if I will not open you the windows 
                  of heaven, and pour you out a blessing, that there shall not be room enough to receive it."
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Wallet Balance Display */}
          {isConnected && ethBalance && (
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Current Wallet Balance:</span>
                <span className="text-xl font-bold text-blue-400">
                  {parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)} {ethBalance.symbol}
                </span>
              </div>
            </div>
          )}

          {/* DeFi Earnings Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Your DeFi Earnings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staking">Staking Rewards ($)</Label>
                <Input
                  id="staking"
                  type="number"
                  placeholder="0.00"
                  value={defiEarnings.staking || ''}
                  onChange={(e) => setDefiEarnings({...defiEarnings, staking: parseFloat(e.target.value) || 0})}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lending">Lending Interest ($)</Label>
                <Input
                  id="lending"
                  type="number"
                  placeholder="0.00"
                  value={defiEarnings.lending || ''}
                  onChange={(e) => setDefiEarnings({...defiEarnings, lending: parseFloat(e.target.value) || 0})}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yieldFarming">Yield Farming ($)</Label>
                <Input
                  id="yieldFarming"
                  type="number"
                  placeholder="0.00"
                  value={defiEarnings.yieldFarming || ''}
                  onChange={(e) => setDefiEarnings({...defiEarnings, yieldFarming: parseFloat(e.target.value) || 0})}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trading">Trading Profits ($)</Label>
                <Input
                  id="trading"
                  type="number"
                  placeholder="0.00"
                  value={defiEarnings.trading || ''}
                  onChange={(e) => setDefiEarnings({...defiEarnings, trading: parseFloat(e.target.value) || 0})}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Quick Custom Calculation */}
          <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg space-y-3">
            <Label htmlFor="custom">Quick Calculate From Total Earnings</Label>
            <div className="flex gap-2">
              <Input
                id="custom"
                type="number"
                placeholder="Enter total earnings"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="bg-background/50"
              />
              <Button onClick={handleCustomCalculation} variant="outline">
                Calculate
              </Button>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-green-900/40 to-blue-900/40 border-2 border-green-500/50 rounded-lg">
              <div className="text-center space-y-2">
                <p className="text-white/70">Total DeFi Earnings</p>
                <p className="text-3xl font-bold text-white">
                  ${totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-900/40 to-green-900/40 border-2 border-green-400/70 rounded-lg">
              <div className="text-center space-y-2">
                <p className="text-green-400 font-semibold">Your Biblical Tithe (10%)</p>
                <p className="text-4xl font-bold text-green-400">
                  ${calculatedTithe.toFixed(2)}
                </p>
                <p className="text-xs text-white/60 mt-2">
                  Calculated according to Malachi 3:10
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleSetupTithe}
            disabled={calculatedTithe === 0 || !isConnected}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Heart className="w-5 h-5 mr-2" />
            {!isConnected ? 'Connect Wallet to Continue' : `Set Up $${calculatedTithe.toFixed(2)} Tithe`}
          </Button>

          {/* Biblical Principle */}
          <div className="text-center text-xs text-white/60 space-y-1">
            <p>✨ Honor the LORD with your wealth and the firstfruits of all your produce</p>
            <p className="text-green-400/70">— Proverbs 3:9-10</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedTithingCalculator;
