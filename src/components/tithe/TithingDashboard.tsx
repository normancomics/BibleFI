
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ActiveStreams from "./ActiveStreams";
import TithingStats from "./TithingStats";
import { Badge } from "@/components/ui/badge";
import PixelButton from "@/components/PixelButton";
import { CalendarRange, History, ListChecks, Wallet } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

interface TithingHistoryItem {
  id: string;
  date: Date;
  church: string;
  amount: string;
  token: string;
  method: 'one-time' | 'stream' | 'automatic';
  status: 'completed' | 'processing' | 'failed';
}

const mockTithingHistory: TithingHistoryItem[] = [
  {
    id: "tithe-1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    church: "First Biblical Church of Cryptoria",
    amount: "50",
    token: "USDC",
    method: 'one-time',
    status: 'completed'
  },
  {
    id: "tithe-2",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    church: "Divine Treasury Assembly",
    amount: "25",
    token: "ETH",
    method: 'one-time',
    status: 'completed'
  },
  {
    id: "tithe-3",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    church: "First Biblical Church of Cryptoria",
    amount: "75",
    token: "USDC",
    method: 'stream',
    status: 'completed'
  }
];

const TithingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { playSound } = useSound();
  const [walletAddress] = useState<string | undefined>("0x1234...5678"); // This would come from wallet connection
  
  const handleManageStream = (streamId: string) => {
    playSound("select");
    console.log(`Managing stream: ${streamId}`);
    // Implementation for managing a stream
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const renderStatusBadge = (status: TithingHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-900/20 text-green-400 border-green-500/50">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/50">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-900/20 text-red-400 border-red-500/50">Failed</Badge>;
      default:
        return null;
    }
  };
  
  const renderMethodBadge = (method: TithingHistoryItem['method']) => {
    switch (method) {
      case 'one-time':
        return <Badge variant="outline" className="bg-slate-900/20">One-time</Badge>;
      case 'stream':
        return <Badge variant="outline" className="bg-purple-900/20">Stream</Badge>;
      case 'automatic':
        return <Badge variant="outline" className="bg-blue-900/20">Automatic</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-scroll text-ancient-gold mb-2">Your Tithing Dashboard</h2>
        <p className="text-white/70">Track, manage and analyze your giving</p>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        playSound("select");
      }}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ListChecks size={16} />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="streams" className="flex items-center gap-2">
            <Wallet size={16} />
            <span className="hidden sm:inline">Active Streams</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TithingStats
              monthlyTotal="375.50"
              yearlyTotal="1,250.00"
              tithePercentage={10}
              mostSupportedChurch="First Biblical Church of Cryptoria"
              churchCount={2}
              longestStreak={14}
              goal={500}
              goalCompleted={375.5}
            />
            
            <Card className="border-2 border-scripture/30 bg-black/20">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
                <CardTitle className="font-scroll text-ancient-gold">Recent Activity</CardTitle>
                <CardDescription className="text-white/70">
                  Your latest tithing transactions
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {mockTithingHistory.slice(0, 3).map((item) => (
                    <div 
                      key={item.id}
                      className="bg-black/50 border border-ancient-gold/20 rounded-md p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-scripture">{item.church}</p>
                        <p className="text-sm text-white/60">{formatDate(item.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-ancient-gold">{item.amount} {item.token}</p>
                        <div className="flex gap-1 mt-1 justify-end">
                          {renderMethodBadge(item.method)}
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-4">
                  <PixelButton 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab("history");
                      playSound("select");
                    }}
                    size="sm"
                  >
                    <CalendarRange size={16} className="mr-2" />
                    View Full History
                  </PixelButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="streams" className="mt-6">
          <ActiveStreams 
            accountAddress={walletAddress}
            onManageStream={handleManageStream}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card className="border-2 border-scripture/30 bg-black/20">
            <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border-b border-ancient-gold/20">
              <CardTitle className="font-scroll text-ancient-gold">Tithing History</CardTitle>
              <CardDescription className="text-white/70">
                A record of all your past giving
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {mockTithingHistory.length > 0 ? (
                <div className="space-y-4">
                  {mockTithingHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-black/50 border border-ancient-gold/20 rounded-md p-4 flex flex-col sm:flex-row justify-between"
                    >
                      <div>
                        <p className="font-medium text-scripture">{item.church}</p>
                        <p className="text-sm text-white/60">{formatDate(item.date)}</p>
                        <div className="flex gap-1 mt-2 sm:hidden">
                          {renderMethodBadge(item.method)}
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>
                      <div className="text-left sm:text-right mt-2 sm:mt-0">
                        <p className="font-medium text-ancient-gold">{item.amount} {item.token}</p>
                        <div className="hidden sm:flex gap-1 mt-2 justify-end">
                          {renderMethodBadge(item.method)}
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any tithing history yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TithingDashboard;
