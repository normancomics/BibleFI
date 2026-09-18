import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpDown, 
  Coins, 
  TrendingUp, 
  Shield,
  DollarSign,
  PieChart,
  Activity,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SimpleSwapForm from './SimpleSwapForm';
import StakingForm from '../staking/StakingForm';
import RealPortfolioBalance from './RealPortfolioBalance';
import LiveBasePools from './LiveBasePools';

const DefiOpportunitiesDashboard = lazy(() => import('./DefiOpportunitiesDashboard'));
const BwspYieldFlow = lazy(() => import('../bwsp/BwspYieldFlow'));
const WisdomDashboard = lazy(() => import('../bwsp/WisdomDashboard'));

const StreamlinedDefiHub: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('wisdom');

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
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 bg-black/30 h-auto">
          <TabsTrigger value="wisdom" className="data-[state=active]:bg-yellow-600/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Wisdom
          </TabsTrigger>
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
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-secondary/30">
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Opportunities</span>
            <span className="sm:hidden">Opps</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600/30">
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wisdom" className="space-y-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <BwspYieldFlow />
          </Suspense>
          <Suspense fallback={null}>
            <WisdomDashboard />
          </Suspense>
        </TabsContent>

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
              <LiveBasePools />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <DefiOpportunitiesDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Portfolio Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RealPortfolioBalance />
              <p className="text-xs text-muted-foreground">
                These are your real balances on Base, read from the chain. Connect your wallet to see
                them. "Be thou diligent to know the state of thy flocks" — Proverbs 27:23.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StreamlinedDefiHub;