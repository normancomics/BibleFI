import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import SoundSystemManager from '@/components/enhanced/SoundSystemManager';
import DailyScripture from '@/components/home/DailyScripture';
import ComprehensiveTithingHub from '@/components/tithe/ComprehensiveTithingHub';
import IntroAnimation from '@/components/home/IntroAnimation';
import { USChurchSeederService } from '@/services/usChurchSeeder';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, TrendingUp, Database, RefreshCw, Church } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [churchCount, setChurchCount] = useState<number>(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem('biblefi_skip_intro') !== 'true';
  });

  useEffect(() => {
    // Check church count on load
    USChurchSeederService.getChurchCount().then(setChurchCount);
  }, []);

  const handleSeedChurches = async () => {
    setIsSeeding(true);
    try {
      const result = await USChurchSeederService.seedUSChurches();
      toast({
        title: "Churches Added!",
        description: `Added ${result.added} churches to the database (${result.errors} errors)`,
      });
      const newCount = await USChurchSeederService.getChurchCount();
      setChurchCount(newCount);
    } catch (error) {
      toast({ title: "Error seeding churches", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  // Show intro animation first
  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  return (
    <SoundSystemManager>
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black">
        <NavBar />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero Section - Tithing First */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-6xl font-bold mb-4 font-scroll"
            >
              <span className="bg-gradient-to-r from-ancient-gold via-yellow-400 to-ancient-gold bg-clip-text text-transparent">
                BibleFi
              </span>
            </motion.h1>
            <p className="text-xl text-white/80 mb-2">
              Biblical DeFi: Tithing First, Prosperity Through Obedience
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                <Church className="w-3 h-3 mr-1" />
                {churchCount} Churches in Database
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSeedChurches}
                disabled={isSeeding}
                className="text-xs"
              >
                <Database className="w-3 h-3 mr-1" />
                {isSeeding ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Adding...</> : 'Add US Churches'}
              </Button>
            </div>
          </motion.div>

          {/* Daily Scripture - Top Priority */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <DailyScripture />
          </motion.div>

          {/* Comprehensive Tithing Hub - Core Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <ComprehensiveTithingHub />
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { path: '/biblical-finance', icon: <BookOpen className="w-8 h-8" />, label: 'Biblical Finance Encyclopedia', gradient: 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' },
              { path: '/defi', icon: <TrendingUp className="w-8 h-8" />, label: 'DeFi Hub', gradient: 'from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700' },
              { path: '/tithe', icon: <Heart className="w-8 h-8" />, label: 'Full Tithing Interface', gradient: 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' },
            ].map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: "easeOut" }}
              >
                <Button
                  onClick={() => navigate(item.path)}
                  className={`h-24 w-full bg-gradient-to-br ${item.gradient}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </SoundSystemManager>
  );
};

export default Index;
