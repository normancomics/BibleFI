import React from 'react';
import NavBar from '@/components/NavBar';
import SoundSystemManager from '@/components/enhanced/SoundSystemManager';
import DailyScripture from '@/components/home/DailyScripture';
import AutomatedTithingCalculator from '@/components/tithe/AutomatedTithingCalculator';
import LiveChurchSearch from '@/components/tithe/LiveChurchSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Search, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <SoundSystemManager>
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black">
        <NavBar />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero Section - Tithing First */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-scroll">
              <span className="bg-gradient-to-r from-ancient-gold via-yellow-400 to-ancient-gold bg-clip-text text-transparent">
                Bible.fi
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-2">
              Biblical DeFi: Tithing First, Prosperity Through Obedience
            </p>
            <p className="text-sm text-green-400 italic">
              "Bring ye all the tithes into the storehouse" — Malachi 3:10 (KJV)
            </p>
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

          {/* Tithing Calculator - Core Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <AutomatedTithingCalculator />
          </motion.div>

          {/* Church Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="bg-royal-purple/30 border-ancient-gold/50">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Search className="w-12 h-12 text-ancient-gold mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-ancient-gold mb-2">
                    Find Your Church
                  </h2>
                  <p className="text-white/70">
                    Search our global database of Christian churches accepting cryptocurrency donations
                  </p>
                </div>
                <LiveChurchSearch onChurchSelect={(church) => {
                  console.log('Selected church:', church);
                }} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Button
              onClick={() => navigate('/biblical-finance')}
              className="h-24 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="w-8 h-8" />
                <span className="text-sm">Biblical Finance Encyclopedia</span>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/defi')}
              className="h-24 bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="w-8 h-8" />
                <span className="text-sm">DeFi Hub</span>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/tithe')}
              className="h-24 bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <div className="flex flex-col items-center gap-2">
                <Heart className="w-8 h-8" />
                <span className="text-sm">Digital Tithing</span>
              </div>
            </Button>
          </motion.div>
        </main>
      </div>
    </SoundSystemManager>
  );
};

export default Index;
