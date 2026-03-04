
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpDown, 
  Heart, 
  Brain, 
  TrendingUp,
  Wallet,
  Shield
} from 'lucide-react';
import ProductionWalletConnect from '@/components/wallet/ProductionWalletConnect';
import StreamlinedDefiHub from '@/components/defi/StreamlinedDefiHub';
import NavBar from '@/components/NavBar';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <NavBar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              BibleFi
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Where Biblical wisdom meets cutting-edge DeFi technology
          </p>
          <div className="flex justify-center gap-2 text-sm text-gray-400">
            <span>Built on</span>
            <img src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" alt="Base" className="h-5 w-5" />
            <span>Base Chain</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Section */}
          <div className="lg:col-span-1">
            <ProductionWalletConnect />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/defi')}
                className="h-20 flex flex-col items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30"
                variant="outline"
              >
                <ArrowUpDown className="w-6 h-6 mb-1" />
                <span className="text-xs">Swap</span>
              </Button>
              
              <Button
                onClick={() => navigate('/tithe')}
                className="h-20 flex flex-col items-center justify-center bg-green-600/20 hover:bg-green-600/30 border-green-500/30"
                variant="outline"
              >
                <Heart className="w-6 h-6 mb-1" />
                <span className="text-xs">Tithe</span>
              </Button>
              
              <Button
                onClick={() => navigate('/wisdom')}
                className="h-20 flex flex-col items-center justify-center bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30"
                variant="outline"
              >
                <Brain className="w-6 h-6 mb-1" />
                <span className="text-xs">Wisdom</span>
              </Button>
              
              <Button
                onClick={() => navigate('/staking')}
                className="h-20 flex flex-col items-center justify-center bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/30"
                variant="outline"
              >
                <TrendingUp className="w-6 h-6 mb-1" />
                <span className="text-xs">Stake</span>
              </Button>
            </div>
          </div>
        </div>

        {/* DeFi Hub */}
        <StreamlinedDefiHub />

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Secure & Audited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Military-grade security with comprehensive smart contract audits
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Biblical Wisdom
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered financial guidance based on Biblical principles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-400" />
                Faith-Centered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seamless tithing and church support through crypto streams
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
