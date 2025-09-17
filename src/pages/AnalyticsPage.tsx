import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RealTimePortfolio from '@/components/analytics/RealTimePortfolio';
import LiveSecurityMonitor from '@/components/security/LiveSecurityMonitor';
import EnhancedBiblicalAdvisor from '@/components/ai/EnhancedBiblicalAdvisor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Shield, Brain, TrendingUp } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Analytics & Intelligence</h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Real-time portfolio tracking, AI-powered biblical wisdom, and military-grade security monitoring
        </p>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="advisor" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Advisor
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-ancient-gold mb-2">Real-Time Portfolio Analytics</h2>
              <p className="text-white/70">Track your biblical DeFi investments with live data and wisdom scoring</p>
            </div>
            <RealTimePortfolio />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-ancient-gold mb-2">Live Security Monitoring</h2>
              <p className="text-white/70">Military-grade protection for your divine assets</p>
            </div>
            <LiveSecurityMonitor />
          </div>
        </TabsContent>

        <TabsContent value="advisor" className="space-y-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-ancient-gold mb-2">AI Biblical Financial Advisor</h2>
              <p className="text-white/70">Get personalized financial guidance rooted in biblical wisdom</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <EnhancedBiblicalAdvisor />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  DeFi Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Value Locked</span>
                    <span className="font-bold text-green-400">$47.2B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">24h Volume</span>
                    <span className="font-bold text-blue-400">$2.8B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Yield Opportunities</span>
                    <span className="font-bold text-purple-400">127 Active</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-ancient-gold/20">
                    <p className="text-xs italic text-white/80">
                      "The plans of the diligent lead to profit as surely as haste leads to poverty."
                    </p>
                    <p className="text-xs text-ancient-gold text-right mt-1">Proverbs 21:5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Wisdom Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Community Avg Score</span>
                    <span className="font-bold text-ancient-gold">78/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Your Score</span>
                    <span className="font-bold text-green-400">85/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top Principle</span>
                    <span className="font-bold text-purple-400">Diversification</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-ancient-gold/20">
                    <p className="text-xs italic text-white/80">
                      "Divide your portion to seven, or even to eight, for you do not know what misfortune may occur."
                    </p>
                    <p className="text-xs text-ancient-gold text-right mt-1">Ecclesiastes 11:2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="font-bold text-green-400">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Security Score</span>
                    <span className="font-bold text-green-400">95/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users</span>
                    <span className="font-bold text-blue-400">12,847</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded border border-ancient-gold/20">
                    <p className="text-xs italic text-white/80">
                      "The Lord is my rock, my fortress and my deliverer."
                    </p>
                    <p className="text-xs text-ancient-gold text-right mt-1">Psalm 18:2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;