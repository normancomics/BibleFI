import React from 'react';
import NavBar from '@/components/NavBar';
import ComprehensiveTithingHub from '@/components/tithe/ComprehensiveTithingHub';
import { AnonymousTithe } from '@/components/tithe/AnonymousTithe';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Heart, Globe } from 'lucide-react';

const TithePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ancient-gold mb-2">Digital Tithing</h1>
          <p className="text-white/80">
            "Bring ye all the tithes into the storehouse" — Malachi 3:10
          </p>
        </div>
        
        <Tabs defaultValue="comprehensive" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto mb-8">
            <TabsTrigger value="comprehensive" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global Tithing
            </TabsTrigger>
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Quick Tithe
            </TabsTrigger>
            <TabsTrigger value="anonymous" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Anonymous (ZK)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprehensive">
            <ComprehensiveTithingHub />
          </TabsContent>

          <TabsContent value="standard">
            <ComprehensiveTithingHub />
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
