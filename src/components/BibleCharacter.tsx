
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import PixelCharacter, { CharacterType } from "@/components/PixelCharacter";

interface BibleCharacterProps {
  character: CharacterType;
  message: string;
  className?: string;
  animated?: boolean;
  soundEffect?: boolean;
  showWisdomLevel?: boolean;
}

interface CharacterInfo {
  name: string;
  wisdomLevel: number;
  soundEffect: string;
}

const characterMap: Record<CharacterType, CharacterInfo> = {
  jesus: {
    name: "Jesus",
    wisdomLevel: 100,
    soundEffect: "powerup"
  },
  moses: {
    name: "Moses",
    wisdomLevel: 90,
    soundEffect: "scroll"
  },
  solomon: {
    name: "Solomon",
    wisdomLevel: 95,
    soundEffect: "success"
  },
  david: {
    name: "David",
    wisdomLevel: 85,
    soundEffect: "success"
  },
  noah: {
    name: "Noah",
    wisdomLevel: 88,
    soundEffect: "click"
  },
  paul: {
    name: "Paul",
    wisdomLevel: 88,
    soundEffect: "scroll"
  },
  coin: {
    name: "Coin",
    wisdomLevel: 70,
    soundEffect: "coin"
  },
  abraham: {
    name: "Abraham",
    wisdomLevel: 92,
    soundEffect: "scroll"
  }
};

const BibleCharacter: React.FC<BibleCharacterProps> = ({ 
  character, 
  message,
  className = "",
  animated = true,
  soundEffect = false,
  showWisdomLevel = false
}) => {
  const { name, wisdomLevel } = characterMap[character];
  const { playSound, userInteracted } = useSound();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (soundEffect && userInteracted && !hasPlayed) {
      playSound("select");
      setHasPlayed(true);
    }
  }, [soundEffect, userInteracted, playSound, hasPlayed]);

  const handleCharacterClick = () => {
    setIsAnimating(true);
    if (userInteracted) {
      playSound("select");
    }
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex-shrink-0 mr-3">
        <PixelCharacter 
          character={character}
          size="sm"
          animate={animated || isAnimating}
          onClick={handleCharacterClick}
          soundEffect={soundEffect}
        />
        {showWisdomLevel && (
          <div className="mt-1 text-xs text-center">
            <div className="bg-black/30 rounded-full h-1.5 w-full mt-1 overflow-hidden">
              <div 
                className="bg-ancient-gold h-full rounded-full" 
                style={{ width: `${wisdomLevel}%` }}
              ></div>
            </div>
            <span className="text-xs text-ancient-gold">Wisdom {wisdomLevel}</span>
          </div>
        )}
      </div>
      <div className="bg-white border-2 border-scripture p-3 rounded-lg relative speech-bubble">
        <p className="font-bold text-scripture mb-1">{name} says:</p>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default BibleCharacter;
