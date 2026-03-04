import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WISDOM_LEVELS, WisdomLevel } from '@/types/wisdomProgression';
import { Crown, Sparkles, BookOpen, Users, Star, Share2 } from 'lucide-react';

interface LevelUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: WisdomLevel;
  previousLevel: WisdomLevel;
  newScore: number;
}

const levelIcons = {
  seeker: BookOpen,
  steward: Sparkles,
  shepherd: Users,
  elder: Star,
  solomon: Crown,
};

const levelColors = {
  seeker: 'from-blue-400 to-blue-600',
  steward: 'from-green-400 to-green-600',
  shepherd: 'from-purple-400 to-purple-600',
  elder: 'from-orange-400 to-orange-600',
  solomon: 'from-ancient-gold to-yellow-500',
};

const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  isOpen,
  onClose,
  newLevel,
  previousLevel,
  newScore,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const levelInfo = WISDOM_LEVELS[newLevel];
  const LevelIcon = levelIcons[newLevel];

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Play level-up sound
      const audio = new Audio('/sounds/powerup.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShare = () => {
    const shareText = `🎉 I just reached ${levelInfo.title} level on BibleFi with ${newScore} wisdom points! "${levelInfo.verse}" - ${levelInfo.reference}`;
    
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-background to-card border-ancient-gold/50 overflow-hidden max-w-md">
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1'][Math.floor(Math.random() * 5)],
                  }}
                  initial={{ top: '-10%', rotate: 0 }}
                  animate={{
                    top: '110%',
                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                    x: (Math.random() - 0.5) * 200,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 text-center py-6 space-y-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
          >
            <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${levelColors[newLevel]} flex items-center justify-center shadow-2xl`}>
              <LevelIcon className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold text-ancient-gold">Level Up!</h2>
            <p className="text-xl font-semibold text-foreground">{levelInfo.title}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-ancient-gold/10 rounded-lg p-4 border border-ancient-gold/30"
          >
            <p className="text-sm text-muted-foreground mb-1">{levelInfo.reference}</p>
            <p className="text-foreground italic">"{levelInfo.verse}"</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-ancient-gold">{newScore}</p>
              <p className="text-xs text-muted-foreground">Wisdom Points</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-semibold text-foreground capitalize">{previousLevel}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex gap-3 justify-center"
          >
            <Button variant="outline" onClick={handleShare} className="border-ancient-gold/30">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={onClose} className="bg-ancient-gold text-background hover:bg-ancient-gold/90">
              Continue Journey
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpCelebration;
