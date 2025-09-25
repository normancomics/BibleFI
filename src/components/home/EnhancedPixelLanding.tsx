import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSound } from '@/contexts/SoundContext';
import { 
  Coins, 
  Heart, 
  TrendingUp, 
  BookOpen,
  Users,
  Shield,
  Zap,
  Star
} from 'lucide-react';

interface PixelCharacter {
  id: string;
  name: string;
  image: string;
  wisdom: string;
  position: { x: number; y: number };
  animationDelay: number;
}

const EnhancedPixelLanding: React.FC = () => {
  const { playSound } = useSound();
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [showWisdom, setShowWisdom] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const characters: PixelCharacter[] = [
    {
      id: 'solomon',
      name: 'King Solomon',
      image: '/pixel-solomon.png',
      wisdom: '"A wise person saves for the future, but the foolish spend whatever they get." - Proverbs 21:20',
      position: { x: 10, y: 20 },
      animationDelay: 0
    },
    {
      id: 'joseph',
      name: 'Joseph the Treasurer',
      image: '/pixel-joseph-treasurer.png',
      wisdom: '"During the seven years of abundance, Joseph stored up grain for the lean years." - Genesis 41',
      position: { x: 85, y: 15 },
      animationDelay: 0.5
    },
    {
      id: 'david',
      name: 'King David',
      image: '/pixel-shepherd-david.png',
      wisdom: '"The Lord is my shepherd; I shall not want." - Psalm 23:1',
      position: { x: 15, y: 70 },
      animationDelay: 1
    },
    {
      id: 'paul',
      name: 'Apostle Paul',
      image: '/pixel-paul.png',
      wisdom: '"Godliness with contentment is great gain." - 1 Timothy 6:6',
      position: { x: 80, y: 75 },
      animationDelay: 1.5
    }
  ];

  // Create sparkle effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(prev => [
        ...prev.slice(-10), // Keep only last 10 sparkles
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCharacterClick = (character: PixelCharacter) => {
    playSound('click');
    setActiveCharacter(character.id);
    setShowWisdom(true);
  };

  const handleFeatureClick = (feature: string) => {
    playSound('powerup');
    console.log(`Feature clicked: ${feature}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-ancient-purple/20 to-background overflow-hidden">
      {/* Sparkle effects */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2 }}
          >
            <Star className="h-3 w-3 text-ancient-gold animate-pulse" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Background temple clouds */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src="/pixel-clouds-exact.png" 
          alt="Background clouds" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Biblical characters floating around */}
      {characters.map((character) => (
        <motion.div
          key={character.id}
          className="absolute cursor-pointer z-10"
          style={{
            left: `${character.position.x}%`,
            top: `${character.position.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -10, 0]
          }}
          transition={{
            delay: character.animationDelay,
            duration: 0.5,
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          whileHover={{ scale: 1.1 }}
          onClick={() => handleCharacterClick(character)}
        >
          <div className="relative">
            <img 
              src={character.image} 
              alt={character.name}
              className="w-16 h-16 pixelated hover:drop-shadow-lg transition-all duration-300"
            />
            <div className="absolute -top-2 -right-2 bg-ancient-gold rounded-full w-6 h-6 flex items-center justify-center">
              <BookOpen className="h-3 w-3 text-black" />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Main content container */}
      <div className="relative z-20 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="relative inline-block mb-6">
            <motion.img 
              src="/bible-fi-brand-logo-v2.png" 
              alt="Bible.fi Logo"
              className="h-32 w-auto mx-auto pixelated"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            />
            <motion.div
              className="absolute -top-4 -right-4 bg-eboy-green/20 rounded-full p-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-6 w-6 text-eboy-green" />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-ancient-gold to-eboy-green bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Bible.fi
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            Biblical Wisdom Meets DeFi Innovation
          </motion.p>
          
          <motion.p 
            className="text-sm text-muted-foreground/80 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            <img src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png" alt="Base" className="h-4 w-4" />
            Built on Base Chain
            <span className="mx-2">•</span>
            Farcaster Mini-App
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-ancient-gold/20 hover:border-ancient-gold/40 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center" onClick={() => handleFeatureClick('tithing')}>
                <div className="bg-gradient-to-r from-ancient-gold/20 to-yellow-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-ancient-gold" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Digital Tithing</h3>
                <p className="text-sm text-muted-foreground">Stream crypto donations to churches worldwide with Superfluid</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-eboy-green/20 hover:border-eboy-green/40 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center" onClick={() => handleFeatureClick('defi')}>
                <div className="bg-gradient-to-r from-eboy-green/20 to-green-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-eboy-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Biblical DeFi</h3>
                <p className="text-sm text-muted-foreground">Stake, lend, and farm yields with wisdom-guided strategies</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-ancient-purple/20 hover:border-ancient-purple/40 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center" onClick={() => handleFeatureClick('wisdom')}>
                <div className="bg-gradient-to-r from-ancient-purple/20 to-purple-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-ancient-purple" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Wisdom</h3>
                <p className="text-sm text-muted-foreground">Learn biblical financial principles with AI guidance</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.5 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-eboy-purple/20 hover:border-eboy-purple/40 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center" onClick={() => handleFeatureClick('community')}>
                <div className="bg-gradient-to-r from-eboy-purple/20 to-indigo-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-eboy-purple" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Share wisdom and connect with believers on Farcaster</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.5 }}
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-semibold px-8 py-3"
            onClick={() => handleFeatureClick('start')}
          >
            <Coins className="mr-2 h-5 w-5" />
            Start Your Journey
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-eboy-green text-eboy-green hover:bg-eboy-green hover:text-black font-semibold px-8 py-3"
            onClick={() => handleFeatureClick('learn')}
          >
            <Shield className="mr-2 h-5 w-5" />
            Learn Biblical Finance
          </Button>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.5 }}
        >
          <div>
            <div className="text-2xl font-bold text-ancient-gold">1000+</div>
            <div className="text-sm text-muted-foreground">Bible Verses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eboy-green">24/7</div>
            <div className="text-sm text-muted-foreground">DeFi Markets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-ancient-purple">5000+</div>
            <div className="text-sm text-muted-foreground">Global Churches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-eboy-purple">100%</div>
            <div className="text-sm text-muted-foreground">Open Source</div>
          </div>
        </motion.div>
      </div>

      {/* Character Wisdom Modal */}
      <AnimatePresence>
        {showWisdom && activeCharacter && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWisdom(false)}
          >
            <motion.div
              className="bg-card border border-ancient-gold/30 rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: 180 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const character = characters.find(c => c.id === activeCharacter);
                return character ? (
                  <div className="text-center">
                    <img 
                      src={character.image} 
                      alt={character.name}
                      className="w-20 h-20 mx-auto mb-4 pixelated"
                    />
                    <h3 className="text-xl font-bold mb-2 text-ancient-gold">{character.name}</h3>
                    <p className="text-muted-foreground italic mb-4">{character.wisdom}</p>
                    <Button 
                      onClick={() => setShowWisdom(false)}
                      className="bg-ancient-gold hover:bg-ancient-gold/90 text-black"
                    >
                      Continue Learning
                    </Button>
                  </div>
                ) : null;
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedPixelLanding;