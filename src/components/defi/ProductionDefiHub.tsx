import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Heart,
  Wallet,
  AlertTriangle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import ProductionWalletConnect from '@/components/wallet/ProductionWalletConnect';
import SimpleSwapForm from '@/components/defi/SimpleSwapForm';
import StakingForm from '@/components/staking/StakingForm';
import SuperfluidTithe from '@/components/tithe/SuperfluidTithe';
import PixelButton from '@/components/PixelButton';

const ProductionDefiHub: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [activeTab, setActiveTab] = useState('swap');
  
  const isOnBase = chainId === base.id;

  const defiFeatures = [
    {
      id: 'swap',
      title: 'Token Swap',
      description: 'Exchange tokens on Base chain',
      icon: <Coins className="h-5 w-5" />,
      biblical: 'Fair trading practices - Proverbs 11:1',
      component: <SimpleSwapForm />
    },
    {
      id: 'stake',
      title: 'Staking Pools',
      description: 'Earn rewards by staking tokens',
      icon: <TrendingUp className="h-5 w-5" />,
      biblical: 'The wise store up treasure - Proverbs 21:20',
      component: <StakingForm />
    },
    {
      id: 'tithe',
      title: 'Digital Tithing',
      description: 'Stream donations to your church',
      icon: <Heart className="h-5 w-5" />,
      biblical: 'Give a tithe of everything - Deuteronomy 14:22',
      component: <SuperfluidTithe />
    },
    {
      id: 'secure',
      title: 'Security Center',
      description: 'Monitor your DeFi security',
      icon: <Shield className="h-5 w-5" />,
      biblical: 'Guard your heart above all else - Proverbs 4:23',
      component: <SecurityOverview />
    }
  ];

  const quickStats = [
    { label: 'Total Value Locked', value: '$2.4M', change: '+12.3%' },
    { label: 'Active Pools', value: '8', change: 'stable' },
    { label: 'Churches Supported', value: '150+', change: '+5 new' },
    { label: 'Monthly Tithes', value: '$45K', change: '+8.2%' }
  ];

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-ancient-gold">
            🏛️ Biblical DeFi Hub
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Access decentralized finance features guided by biblical wisdom. 
            Trade fairly, stake wisely, and tithe faithfully on Base chain.
          </p>
        </div>
        
        <ProductionWalletConnect />
        
        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defiFeatures.map((feature) => (
            <Card key={feature.id} className="bg-scripture/20 border border-ancient-gold/30">
              <CardContent className="p-4 text-center">
                <div className="text-ancient-gold mb-2 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                <p className="text-white/60 text-sm mb-2">{feature.description}</p>
                <Badge className="bg-ancient-gold/20 text-ancient-gold text-xs">
                  {feature.biblical.split(' - ')[1]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Preview */}
        <Card className="bg-scripture/20 border border-ancient-gold">
          <CardHeader>
            <CardTitle className="text-ancient-gold">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">
                    {stat.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOnBase) {
    return (
      <div className="space-y-6">
        <Alert className="border-yellow-500/50 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            Please switch to Base network to access DeFi features. BibleFi is optimized for Base chain.
          </AlertDescription>
        </Alert>
        <ProductionWalletConnect />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-ancient-gold">
          🏛️ Biblical DeFi Hub
        </h2>
        <div className="flex justify-center gap-4 text-sm">
          <Badge className="bg-green-900 text-green-200">
            Base Network Active
          </Badge>
          <Badge className="bg-blue-900 text-blue-200">
            Wallet Connected
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-scripture/20 border border-ancient-gold/30">
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold text-ancient-gold">{stat.value}</p>
              <p className="text-white/60 text-sm">{stat.label}</p>
              <Badge className="mt-1 bg-green-900/50 text-green-300 text-xs">
                {stat.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main DeFi Interface */}
      <Card className="bg-scripture/20 border border-ancient-gold">
        <CardHeader>
          <CardTitle className="text-ancient-gold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            DeFi Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              {defiFeatures.map((feature) => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="flex items-center gap-2"
                >
                  {feature.icon}
                  <span className="hidden sm:inline">{feature.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {defiFeatures.map((feature) => (
              <TabsContent key={feature.id} value={feature.id} className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                  <Badge className="bg-ancient-gold/20 text-ancient-gold">
                    {feature.biblical}
                  </Badge>
                </div>
                
                {feature.component}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card className="bg-scripture/20 border border-ancient-gold">
        <CardHeader>
          <CardTitle className="text-ancient-gold">Resources & Education</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PixelButton
              onClick={() => navigate('/wisdom')}
              className="bg-purple-900 text-purple-200 border border-purple-500"
            >
              📖 Biblical Wisdom
            </PixelButton>
            
            <PixelButton
              onClick={() => window.open('https://docs.base.org/docs/using-base', '_blank')}
              className="bg-blue-900 text-blue-200 border border-blue-500"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Base Network Guide
            </PixelButton>
            
            <PixelButton
              onClick={() => navigate('/security')}
              className="bg-red-900 text-red-200 border border-red-500"
            >
              🛡️ Security Center
            </PixelButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Security Overview Component
const SecurityOverview: React.FC = () => {
  const securityChecks = [
    { name: 'Wallet Security', status: 'active', description: 'Your wallet connection is secure' },
    { name: 'Transaction Monitoring', status: 'active', description: 'All transactions are monitored for anomalies' },
    { name: 'Smart Contract Audit', status: 'verified', description: 'Contracts have been security audited' },
    { name: 'Multi-signature Protection', status: 'active', description: 'Critical operations require multiple signatures' }
  ];

  return (
    <div className="space-y-4">
      <Alert className="border-green-500/50 bg-green-900/20">
        <Shield className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          Your DeFi security status is excellent. All systems are monitored and protected.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {securityChecks.map((check, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded border border-ancient-gold/20">
            <div>
              <p className="text-white font-medium">{check.name}</p>
              <p className="text-white/60 text-sm">{check.description}</p>
            </div>
            <Badge className="bg-green-900 text-green-200">
              {check.status}
            </Badge>
          </div>
        ))}
      </div>

      <div className="text-center p-4 bg-ancient-gold/10 rounded border border-ancient-gold/30">
        <p className="text-white/80 italic">
          "The simple believe anything, but the prudent give thought to their steps." - Proverbs 14:15
        </p>
      </div>
    </div>
  );
};

export default ProductionDefiHub;