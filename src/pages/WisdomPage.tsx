import React from 'react';
import ComprehensiveBiblicalAdvisor from '@/components/wisdom/ComprehensiveBiblicalAdvisor';
import WisdomProgressionSystem from '@/components/wisdom/WisdomProgressionSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy } from 'lucide-react';

const WisdomPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Biblical Wisdom Center
        </h1>
        
        <Tabs defaultValue="progression" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="progression" className="gap-2">
              <Trophy className="w-4 h-4" />
              Wisdom Journey
            </TabsTrigger>
            <TabsTrigger value="advisor" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Biblical Advisor
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="progression">
            <WisdomProgressionSystem />
          </TabsContent>
          
          <TabsContent value="advisor">
            <ComprehensiveBiblicalAdvisor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WisdomPage;
