import React from 'react';
import { Link } from 'react-router-dom';
import { useWisdomProgression } from '@/hooks/useWisdomProgression';
import { WISDOM_LEVELS } from '@/types/wisdomProgression';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Crown, BookOpen, Users, Star, Flame } from 'lucide-react';

const levelIcons = {
  seeker: BookOpen,
  steward: Sparkles,
  shepherd: Users,
  elder: Star,
  solomon: Crown,
};

const WisdomScoreNavbar: React.FC = () => {
  const { progress } = useWisdomProgression();
  const levelInfo = WISDOM_LEVELS[progress.level];
  const LevelIcon = levelIcons[progress.level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/wisdom">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-ancient-gold/20 to-scripture/20 rounded-full border border-ancient-gold/30 hover:border-ancient-gold/60 transition-all cursor-pointer group">
              <LevelIcon className="h-4 w-4 text-ancient-gold group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-ancient-gold">{progress.currentScore}</span>
              {progress.streak > 0 && (
                <div className="flex items-center gap-0.5 text-orange-400">
                  <Flame className="h-3 w-3" />
                  <span className="text-xs font-bold">{progress.streak}</span>
                </div>
              )}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-ancient-gold/30">
          <div className="space-y-1 text-center">
            <p className="font-semibold text-ancient-gold">{levelInfo.title}</p>
            <p className="text-xs text-muted-foreground">{levelInfo.reference}</p>
            <p className="text-xs italic">"{levelInfo.verse}"</p>
            {progress.streak > 0 && (
              <p className="text-xs text-orange-400">🔥 {progress.streak} day streak</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WisdomScoreNavbar;
