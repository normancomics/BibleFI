import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, Church, Brain, DollarSign } from 'lucide-react';
import { realTimeDataService } from '@/services/realTimeDataService';
import { BiblicalFinanceCrawlerService } from '@/services/biblicalFinanceCrawler';
import { GlobalChurchCrawlerService } from '@/services/globalChurchCrawler';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface LiveStats {
  totalUsers: number;
  activeStreams: number;
  totalTithed: number;
  churchesRegistered: number;
  wisdomScoreAvg: number;
  biblicalVersesAnalyzed: number;
  defiProtocolsIntegrated: number;
  lastUpdated: string;
}

export const LiveDataDashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [churchGrowth, setChurchGrowth] = useState<any[]>([]);
  const [wisdomTrends, setWisdomTrends] = useState<any[]>([]);
  const [crawlProgress, setCrawlProgress] = useState({ biblical: 0, churches: 0 });

  useEffect(() => {
    loadInitialData();
    
    // Setup real-time subscriptions
    const unsubscribe = realTimeDataService.setupRealTimeSubscriptions((newStats) => {
      setStats(newStats);
      toast({
        title: "Live Data Updated",
        description: "Dashboard refreshed with latest data",
        duration: 2000,
      });
    });

    return unsubscribe;
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      const [liveStats, growth, trends] = await Promise.all([
        realTimeDataService.getLiveStats(),
        realTimeDataService.getChurchGrowthData(),
        realTimeDataService.getWisdomTrends()
      ]);

      setStats(liveStats);
      setChurchGrowth(growth);
      setWisdomTrends(trends);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runBiblicalCrawl = async () => {
    try {
      setCrawlProgress(prev => ({ ...prev, biblical: 0 }));
      toast({
        title: "Biblical Crawl Started",
        description: "Analyzing biblical verses for financial wisdom...",
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setCrawlProgress(prev => ({
          ...prev,
          biblical: Math.min(prev.biblical + 10, 90)
        }));
      }, 500);

      const results = await BiblicalFinanceCrawlerService.crawlAllFinancialVerses();
      
      clearInterval(progressInterval);
      setCrawlProgress(prev => ({ ...prev, biblical: 100 }));

      toast({
        title: "Biblical Crawl Complete",
        description: `Analyzed ${results.totalVerses} verses, found ${results.financialVerses} with financial relevance`,
      });

      // Refresh stats
      loadInitialData();
      
    } catch (error) {
      toast({
        title: "Crawl Failed",
        description: "Biblical wisdom crawl encountered an error",
        variant: "destructive",
      });
    }
  };

  const runChurchCrawl = async () => {
    try {
      setCrawlProgress(prev => ({ ...prev, churches: 0 }));
      toast({
        title: "Church Crawl Started",
        description: "Gathering global church data...",
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setCrawlProgress(prev => ({
          ...prev,
          churches: Math.min(prev.churches + 15, 90)
        }));
      }, 800);

      const results = await GlobalChurchCrawlerService.crawlGlobalChurches();
      
      clearInterval(progressInterval);
      setCrawlProgress(prev => ({ ...prev, churches: 100 }));

      toast({
        title: "Church Crawl Complete",
        description: `Processed ${results.totalChurches} churches across ${results.countriesCount} countries`,
      });

      // Refresh stats
      loadInitialData();
      
    } catch (error) {
      toast({
        title: "Crawl Failed",
        description: "Church data crawl encountered an error",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Live Data Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights into Bible.fi ecosystem</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="secondary">
            Last updated: {stats ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Never'}
          </Badge>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active platform users</p>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churches Registered</CardTitle>
            <Church className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.churchesRegistered}</div>
            <p className="text-xs text-muted-foreground">Global church network</p>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biblical Verses Analyzed</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.biblicalVersesAnalyzed}</div>
            <p className="text-xs text-muted-foreground">Financial wisdom extracted</p>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tithed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalTithed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Digital donations processed</p>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeStreams}</div>
            <p className="text-xs text-muted-foreground">Superfluid tithe streams</p>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wisdom Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.wisdomScoreAvg}/100</div>
            <p className="text-xs text-muted-foreground">Community wisdom rating</p>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DeFi Protocols</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.defiProtocolsIntegrated}</div>
            <p className="text-xs text-muted-foreground">Integrated platforms</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Crawlers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Crawlers</CardTitle>
          <CardDescription>Run live data collection and analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Biblical Wisdom Crawler</h3>
                <Button onClick={runBiblicalCrawl} size="sm">
                  Run Crawl
                </Button>
              </div>
              <Progress value={crawlProgress.biblical} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Analyzes biblical verses for financial wisdom and DeFi relevance
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Global Church Crawler</h3>
                <Button onClick={runChurchCrawl} size="sm">
                  Run Crawl
                </Button>
              </div>
              <Progress value={crawlProgress.churches} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Collects global church data including crypto payment support
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Church Growth</TabsTrigger>
          <TabsTrigger value="wisdom">Wisdom Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Church Registration Growth</CardTitle>
              <CardDescription>Monthly church registration and crypto adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={churchGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="churches" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6}
                    name="Total Churches"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cryptoEnabled" 
                    stackId="2"
                    stroke="hsl(var(--secondary))" 
                    fill="hsl(var(--secondary))" 
                    fillOpacity={0.6}
                    name="Crypto Enabled"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wisdom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wisdom Score Trends</CardTitle>
              <CardDescription>Daily average wisdom scores across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wisdomTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="averageScore" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Average Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveDataDashboard;