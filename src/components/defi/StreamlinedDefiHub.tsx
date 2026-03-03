import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpDown, 
  Coins, 
  TrendingUp, 
  Shield,
  DollarSign,
  PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SimpleSwapForm from './SimpleSwapForm';
import StakingForm from '../staking/StakingForm';
import RealPortfolioBalance from './RealPortfolioBalance';

const StreamlinedDefiHub: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('swap');

  const handleSuccessfulAction = (action: string, amount?: string, token?: string) => {
    toast({
      title: "Transaction Successful",
      description: `${action} completed${amount && token ? ` - ${amount} ${token}` : ''}`,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Portfolio Overview */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BibleFi DeFi Hub
            </span>
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Biblical wisdom meets modern DeFi
          </p>
        </CardHeader>
        <CardContent>
          <RealPortfolioBalance />
        </CardContent>
      </Card>

      {/* Main DeFi Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 bg-black/30">
          <TabsTrigger value="swap" className="data-[state=active]:bg-blue-600/30">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Swap
          </TabsTrigger>
          <TabsTrigger value="stake" className="data-[state=active]:bg-green-600/30">
            <Coins className="w-4 h-4 mr-2" />
            Stake
          </TabsTrigger>
          <TabsTrigger value="pools" className="data-[state=active]:bg-purple-600/30">
            <TrendingUp className="w-4 h-4 mr-2" />
            Pools
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600/30">
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Token Swap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleSwapForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Staking Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StakingForm 
                isFormVisible={true}
                onStakeSubmit={(amount, token) => 
                  handleSuccessfulAction('Stake', amount, token)
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pools" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Liquidity Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">ETH/USDC Pool</h3>
                    <span className="text-green-400">12.5% APY</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Stable yield with low impermanent loss risk
                  </p>
                  <Button size="sm" className="w-full">Add Liquidity</Button>
                </div>
                
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">WBTC/ETH Pool</h3>
                    <span className="text-green-400">18.7% APY</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Higher yield for correlated assets
                  </p>
                  <Button size="sm" className="w-full">Add Liquidity</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Portfolio Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <h3 className="font-medium">Total Value</h3>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
                
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <h3 className="font-medium">24h Change</h3>
                  <p className="text-2xl font-bold text-green-400">+0.00%</p>
                </div>
                
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <h3 className="font-medium">Risk Score</h3>
                  <p className="text-2xl font-bold">Low</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StreamlinedDefiHub;