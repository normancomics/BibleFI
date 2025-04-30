
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";

interface WisdomJourneyProps {
  wisdomLevel: number;
  maxWisdomLevel: number;
  unlockedPrinciples: string[];
  onGainWisdom: () => void;
}

const WisdomJourney: React.FC<WisdomJourneyProps> = ({
  wisdomLevel,
  maxWisdomLevel,
  unlockedPrinciples,
  onGainWisdom,
}) => {
  const { playSound } = useSound();

  return (
    <div className="mt-8 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-game text-sm">YOUR WISDOM JOURNEY</h3>
        <span className="font-pixel text-ancient-gold">
          Level {wisdomLevel}/{maxWisdomLevel}
        </span>
      </div>
      <Progress value={(wisdomLevel / maxWisdomLevel) * 100} className="h-2 bg-black/30" />
      <div className="mt-2 flex justify-between">
        <div className="flex items-center">
          <Award size={16} className="text-ancient-gold mr-1" />
          <span className="text-xs">{unlockedPrinciples.length} principles unlocked</span>
        </div>
        <PixelButton 
          size="sm" 
          onClick={() => {
            playSound("powerup");
            onGainWisdom();
          }} 
          disabled={wisdomLevel >= maxWisdomLevel}
        >
          Gain Wisdom
        </PixelButton>
      </div>
    </div>
  );
};

export default WisdomJourney;
