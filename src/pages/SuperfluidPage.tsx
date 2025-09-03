import React from 'react';
import NavBar from '@/components/NavBar';
import SuperfluidStreamDashboard from '@/components/superfluid/SuperfluidStreamDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, DollarSign } from 'lucide-react';

const SuperfluidPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-scroll text-ancient-gold mb-4">
            Superfluid Stream Management
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Manage your continuous money streams for tithing, staking, and DeFi activities. 
            Built on Superfluid protocol for seamless Base chain integration.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Flow</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$150</div>
              <p className="text-xs text-muted-foreground">
                Automated giving & earning
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base Chain</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">
                L2 efficiency & low fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <SuperfluidStreamDashboard />
        
        {/* Biblical Context */}
        <Card className="mt-8 bg-gradient-to-r from-ancient-gold/10 to-transparent border-ancient-gold/30">
          <CardHeader>
            <CardTitle className="text-ancient-gold">Biblical Wisdom on Continuous Giving</CardTitle>
            <CardDescription className="text-white/70">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 mb-4">
              Superfluid streams enable the biblical principle of continuous, joyful giving. By automating your tithing and charitable contributions, you ensure consistent stewardship while participating in DeFi opportunities.
            </p>
            <div className="text-sm text-ancient-gold/70">
              — 2 Corinthians 9:7
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SuperfluidPage;