import React from 'react';
import NavBar from '@/components/NavBar';
import SoundSystemManager from '@/components/enhanced/SoundSystemManager';
import BiblicalDeFiSwap from '@/components/defi/BiblicalDeFiSwap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Shield, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const EnhancedDefiPage: React.FC = () => {
  return (
    <SoundSystemManager>
      <div className="min-h-screen bg-background">
        <NavBar />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="absolute left-4 top-24 flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-eboy-green to-ancient-gold bg-clip-text text-transparent mb-4">
              Biblical DeFi Hub
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience decentralized finance through the lens of biblical wisdom. 
              Every transaction guided by timeless principles of stewardship and generosity.
            </p>
          </motion.div>

          {/* Main DeFi Features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Swap Interface */}
            <div className="lg:col-span-2">
              <BiblicalDeFiSwap />
            </div>

            {/* Sidebar Features */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-ancient-purple/10 to-eboy-purple/10 border-ancient-purple/30">
                <CardHeader>
                  <CardTitle className="text-ancient-purple flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Wisdom
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eboy-green">+4.2%</div>
                    <div className="text-sm text-muted-foreground">24h Portfolio</div>
                  </div>
                  
                  <div className="p-3 bg-card rounded-lg">
                    <div className="text-xs font-medium mb-1">Today's Verse:</div>
                    <div className="text-xs italic text-muted-foreground">
                      "The plans of the diligent lead to profit as surely as haste leads to poverty." 
                      - Proverbs 21:5
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-ancient-gold" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/staking'}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Yield Staking
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/tithe'}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Digital Tithing
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/wisdom'}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    AI Wisdom
                  </Button>
                </CardContent>
              </Card>

              {/* Biblical Finance Education */}
              <Card className="bg-gradient-to-br from-ancient-gold/10 to-yellow-600/10 border-ancient-gold/30">
                <CardHeader>
                  <CardTitle className="text-ancient-gold">Learn & Grow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover how biblical principles can guide your DeFi journey
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-ancient-gold hover:bg-ancient-gold/90 text-black"
                    onClick={() => window.location.href = '/wisdom'}
                  >
                    Explore Wisdom
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-muted-foreground"
          >
            <p>Built with biblical wisdom on Base Chain • Powered by Superfluid & Uniswap</p>
          </motion.div>
        </main>
      </div>
    </SoundSystemManager>
  );
};

export default EnhancedDefiPage;