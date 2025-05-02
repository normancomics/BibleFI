
import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Award, Sparkles, Star, BookOpen, Brain } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";

interface WisdomJourneyProps {
  wisdomLevel: number;
  maxWisdomLevel: number;
  unlockedPrinciples: string[];
  onGainWisdom: () => void;
}

// Define wisdom journey levels and their rewards
const wisdomLevels = [
  { level: 1, title: "Beginner", quote: "The fear of the LORD is the beginning of wisdom - Proverbs 9:10", reward: "Access to basic financial principles" },
  { level: 2, title: "Apprentice", quote: "Give instruction to a wise man and he will be still wiser - Proverbs 9:9", reward: "Unlock intermediate financial teachings" },
  { level: 3, title: "Disciple", quote: "The heart of the discerning acquires knowledge - Proverbs 18:15", reward: "Access to advanced stewardship principles" },
  { level: 4, title: "Steward", quote: "Whoever can be trusted with very little can also be trusted with much - Luke 16:10", reward: "Unlock investment strategy guides" },
  { level: 5, title: "Sage", quote: "The wise have wealth and luxury - Proverbs 21:20", reward: "Access to all biblical financial wisdom" }
];

const WisdomJourney: React.FC<WisdomJourneyProps> = ({
  wisdomLevel,
  maxWisdomLevel,
  unlockedPrinciples,
  onGainWisdom,
}) => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [showLevelDetails, setShowLevelDetails] = useState(false);
  
  const currentLevelInfo = wisdomLevels[wisdomLevel - 1];
  const nextLevelInfo = wisdomLevel < maxWisdomLevel ? wisdomLevels[wisdomLevel] : null;

  const handleGainWisdom = () => {
    playSound("powerup");
    onGainWisdom();
    
    if (nextLevelInfo) {
      toast({
        title: `Wisdom Level ${wisdomLevel + 1} Unlocked!`,
        description: `You've reached ${nextLevelInfo.title} status and unlocked new teachings.`,
      });
    } else {
      toast({
        title: "Maximum Wisdom Achieved!",
        description: "You've mastered all the biblical financial principles.",
      });
    }
  };

  return (
    <div className="mt-8 max-w-md mx-auto">
      <div className="relative px-4 py-2 mb-4 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold">
        <div className="absolute inset-0 bg-black/10 opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
        <div className="absolute -left-1 -top-1 w-2 h-2 border-t border-l border-ancient-gold"></div>
        <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-ancient-gold"></div>
        <div className="absolute -left-1 -bottom-1 w-2 h-2 border-b border-l border-ancient-gold"></div>
        <div className="absolute -right-1 -bottom-1 w-2 h-2 border-b border-r border-ancient-gold"></div>
        <h3 className="text-xl font-scroll text-white drop-shadow-[0_0_5px_rgba(255,215,0,0.5)] flex items-center relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(255,215,0,0.7)' }}>
          <BookOpen size={20} className="text-ancient-gold mr-2" /> 
          Your Wisdom Journey
        </h3>
      </div>

      <div onClick={() => setShowLevelDetails(!showLevelDetails)} className="cursor-pointer">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Star size={16} className="text-ancient-gold mr-1" />
            <span className="font-pixel">{currentLevelInfo.title}</span>
          </div>
          <span className="font-pixel text-ancient-gold">
            Level {wisdomLevel}/{maxWisdomLevel}
          </span>
        </div>
        <Progress 
          value={(wisdomLevel / maxWisdomLevel) * 100} 
          className="h-2 bg-black/30" 
        />
      </div>
      
      {showLevelDetails && (
        <div className="mt-2 mb-4 p-3 bg-black/10 rounded-md border border-dashed border-scripture/30 text-sm">
          <div className="mb-2">
            <p className="italic text-xs mb-2">"{currentLevelInfo.quote}"</p>
            <div className="flex items-start">
              <Brain size={16} className="mr-2 flex-shrink-0 mt-1 text-scripture" />
              <div>
                <strong>Current Reward:</strong> {currentLevelInfo.reward}
              </div>
            </div>
          </div>
          
          {nextLevelInfo && (
            <div className="mt-3 pt-3 border-t border-dashed border-scripture/20">
              <div className="flex items-center mb-1">
                <Sparkles size={16} className="mr-1 text-ancient-gold" />
                <span className="font-pixel text-xs">Next Level: {nextLevelInfo.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Continue your journey to unlock: {nextLevelInfo.reward}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex justify-between">
        <div className="flex items-center">
          <Award size={16} className="text-ancient-gold mr-1" />
          <span className="text-xs">{unlockedPrinciples.length} principles unlocked</span>
        </div>
        <PixelButton 
          size="sm" 
          onClick={handleGainWisdom} 
          disabled={wisdomLevel >= maxWisdomLevel}
        >
          Gain Wisdom
        </PixelButton>
      </div>
    </div>
  );
};

export default WisdomJourney;
