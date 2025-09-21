import React from 'react';
import NavBar from '@/components/NavBar';
import EnhancedWalletConnect from '@/components/wallet/EnhancedWalletConnect';
import RealPortfolioBalance from '@/components/defi/RealPortfolioBalance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, TrendingUp, History, Settings } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

const WalletPage: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Wallet Management</h1>
          <p className="text-muted-foreground">
            Connect your wallet and manage your biblical DeFi portfolio
          </p>
        </div>

        <Tabs defaultValue="connect" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="connect" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Connect
            </TabsTrigger>
            <TabsTrigger value="portfolio" disabled={!isConnected}>
              <TrendingUp className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="history" disabled={!isConnected}>
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={!isConnected}>
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-6">
            <div className="max-w-md mx-auto">
              <EnhancedWalletConnect />
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {isConnected ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RealPortfolioBalance />
                <Card>
                  <CardHeader>
                    <CardTitle>Token Holdings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-ancient-gold rounded-full flex items-center justify-center text-black font-bold text-sm">
                            B
                          </div>
                          <div>
                            <div className="font-medium">BIBLE</div>
                            <div className="text-sm text-muted-foreground">Bible Token</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">1,250</div>
                          <div className="text-sm text-muted-foreground">$125.00</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            E
                          </div>
                          <div>
                            <div className="font-medium">ETH</div>
                            <div className="text-sm text-muted-foreground">Ethereum</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">0.15</div>
                          <div className="text-sm text-muted-foreground">$375.00</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            U
                          </div>
                          <div>
                            <div className="font-medium">USDC</div>
                            <div className="text-sm text-muted-foreground">USD Coin</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">500</div>
                          <div className="text-sm text-muted-foreground">$500.00</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Please connect your wallet to view portfolio
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border border-border/50 rounded-lg">
                      <div>
                        <div className="font-medium">Staked BIBLE</div>
                        <div className="text-sm text-muted-foreground">2 hours ago</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">+500 BIBLE</div>
                        <div className="text-sm text-muted-foreground">Staking Rewards</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border border-border/50 rounded-lg">
                      <div>
                        <div className="font-medium">Tithed to Church</div>
                        <div className="text-sm text-muted-foreground">1 day ago</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-400">-100 USDC</div>
                        <div className="text-sm text-muted-foreground">Digital Tithe</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border border-border/50 rounded-lg">
                      <div>
                        <div className="font-medium">Swapped ETH → BIBLE</div>
                        <div className="text-sm text-muted-foreground">3 days ago</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-ancient-gold">+750 BIBLE</div>
                        <div className="text-sm text-muted-foreground">DeFi Swap</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground">
                Please connect your wallet to view history
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {isConnected ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>ZK Privacy Mode</span>
                      <div className="w-12 h-6 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hide Balances</span>
                      <div className="w-12 h-6 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Anonymous Staking</span>
                      <div className="w-12 h-6 bg-green-600 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Transaction Alerts</span>
                      <div className="w-12 h-6 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Reward Notifications</span>
                      <div className="w-12 h-6 bg-green-600 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Weekly Summaries</span>
                      <div className="w-12 h-6 bg-gray-600 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Please connect your wallet to access settings
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;