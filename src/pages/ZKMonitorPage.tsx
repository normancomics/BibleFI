import React from 'react';
import { ZKTitheMonitor } from '@/components/tithe/ZKTitheMonitor';
import { WisdomZKProof } from '@/components/wisdom/WisdomZKProof';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Trophy } from 'lucide-react';

const ZKMonitorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-950/20 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="tithe" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-purple-950/30">
            <TabsTrigger 
              value="tithe"
              className="data-[state=active]:bg-ancient-gold data-[state=active]:text-black"
            >
              <Shield className="w-4 h-4 mr-2" />
              ZK Tithe Monitor
            </TabsTrigger>
            <TabsTrigger 
              value="wisdom"
              className="data-[state=active]:bg-ancient-gold data-[state=active]:text-black"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Wisdom Proofs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tithe" className="space-y-6">
            <ZKTitheMonitor />
          </TabsContent>

          <TabsContent value="wisdom" className="space-y-6">
            <WisdomZKProof />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ZKMonitorPage;
