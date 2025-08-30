
import React from 'react';
import NavBar from '@/components/NavBar';
import BibleTokenDashboard from '@/components/token/BibleTokenDashboard';
import BiblicalWalletConnect from '@/components/wallet/BiblicalWalletConnect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, ExternalLink, TrendingUp, Shield, Award } from 'lucide-react';

const TokenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            $BIBLE Token Ecosystem
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg">
            The first biblical DeFi token on Base Chain. Earn wisdom rewards through faithful stewardship, 
            community participation, and biblical financial principles.
          </p>
        </div>

        {/* Token Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Coins className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">$0.0045</p>
                  <p className="text-sm text-muted-foreground">Token Price</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">1,000,000</p>
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">85%</p>
                  <p className="text-sm text-muted-foreground">Locked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-foreground">2,450</p>
                  <p className="text-sm text-muted-foreground">Holders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <BibleTokenDashboard />
          </div>
          
          {/* Wallet Connection Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <BiblicalWalletConnect 
                  onConnect={(walletId, address) => {
                    console.log('Wallet connected:', walletId, address);
                  }}
                />
              </CardContent>
            </Card>

            {/* Token Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Token Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="default">
                  <Coins className="mr-2 h-4 w-4" />
                  Buy $BIBLE
                </Button>
                <Button className="w-full" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Stake Tokens
                </Button>
                <Button className="w-full" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on BaseScan
                </Button>
              </CardContent>
            </Card>

            {/* Tokenomics */}
            <Card>
              <CardHeader>
                <CardTitle>Tokenomics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Wisdom Rewards</span>
                  <Badge variant="secondary">30%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Community Treasury</span>
                  <Badge variant="secondary">25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Liquidity Pool</span>
                  <Badge variant="secondary">25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Team (Locked)</span>
                  <Badge variant="secondary">15%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Marketing</span>
                  <Badge variant="secondary">5%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TokenPage;
