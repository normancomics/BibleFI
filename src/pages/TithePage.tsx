import React from 'react';
import ProductionTithingInterface from '@/components/tithe/ProductionTithingInterface';
import { AnonymousTithe } from '@/components/tithe/AnonymousTithe';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Heart } from 'lucide-react';

const TithePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Standard Tithing
            </TabsTrigger>
            <TabsTrigger value="anonymous" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Anonymous (ZK)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standard">
            <ProductionTithingInterface />
          </TabsContent>

          <TabsContent value="anonymous">
            <div className="max-w-2xl mx-auto">
              <AnonymousTithe />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TithePage;
