
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Banknote, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DefiLending: React.FC = () => {
  const [lendAmount, setLendAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const { toast } = useToast();

  const lendingPools = [
    { asset: 'USDC', apy: '4.2%', liquidity: '$2.4M', collateral: 'Not Required' },
    { asset: 'DAI', apy: '3.8%', liquidity: '$1.8M', collateral: 'Not Required' },
    { asset: 'ETH', apy: '2.1%', liquidity: '$8.9M', collateral: 'Not Required' }
  ];

  const borrowingOptions = [
    { asset: 'USDC', rate: '6.5%', ltv: '75%', collateral: 'ETH' },
    { asset: 'DAI', rate: '5.9%', ltv: '70%', collateral: 'ETH/USDC' },
    { asset: 'ETH', rate: '4.2%', ltv: '80%', collateral: 'USDC/DAI' }
  ];

  const handleLend = () => {
    if (!lendAmount) return;
    toast({
      title: "Lending Position Created",
      description: `Successfully lent ${lendAmount} USDC at 4.2% APY`,
    });
    setLendAmount('');
  };

  const handleBorrow = () => {
    if (!borrowAmount) return;
    toast({
      title: "Borrowing Position Created",
      description: `Successfully borrowed ${borrowAmount} USDC at 6.5% rate`,
    });
    setBorrowAmount('');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lend">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lend">Lend</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lend" className="space-y-4">
          <Card className="border-scripture/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="text-ancient-gold" />
                Lending Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lendingPools.map((pool, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-scripture/20 rounded-full flex items-center justify-center font-bold">
                        {pool.asset}
                      </div>
                      <div>
                        <div className="font-medium">{pool.asset} Lending</div>
                        <div className="text-sm text-white/60">Liquidity: {pool.liquidity}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">{pool.apy}</div>
                      <div className="text-xs text-white/60">Annual Yield</div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 space-y-4">
                  <Input
                    type="number"
                    placeholder="Amount to lend"
                    value={lendAmount}
                    onChange={(e) => setLendAmount(e.target.value)}
                  />
                  <Button onClick={handleLend} className="w-full bg-green-600 hover:bg-green-700">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Start Lending
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="borrow" className="space-y-4">
          <Card className="border-scripture/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-ancient-gold" />
                Borrowing Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Biblical Wisdom</span>
                </div>
                <p className="text-sm text-amber-200/80">
                  "The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7
                  <br />Borrow responsibly and within your means.
                </p>
              </div>
              
              <div className="space-y-4">
                {borrowingOptions.map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-scripture/20 rounded-full flex items-center justify-center font-bold">
                        {option.asset}
                      </div>
                      <div>
                        <div className="font-medium">Borrow {option.asset}</div>
                        <div className="text-sm text-white/60">Collateral: {option.collateral}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold">{option.rate}</div>
                      <div className="text-xs text-white/60">LTV: {option.ltv}</div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 space-y-4">
                  <Input
                    type="number"
                    placeholder="Amount to borrow"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                  />
                  <Button onClick={handleBorrow} className="w-full bg-orange-600 hover:bg-orange-700">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Borrow (Use Caution)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DefiLending;
