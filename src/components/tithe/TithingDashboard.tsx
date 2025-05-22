
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActiveStreams from "./ActiveStreams";
import TithingStats from "./TithingStats";
import TithingHistory from "./TithingHistory";
import RecentActivity from "./RecentActivity";
import { ListChecks, Wallet, History } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { TithingHistoryItem } from "@/types/tithing";

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
            
            <RecentActivity 
              historyItems={mockTithingHistory} 
              onViewHistory={() => setActiveTab("history")} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="streams" className="mt-6">
          <ActiveStreams 
            accountAddress={walletAddress}
            onManageStream={handleManageStream}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <TithingHistory historyItems={mockTithingHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TithingDashboard;
