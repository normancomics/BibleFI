
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";

export type CharacterType = "jesus" | "moses" | "solomon" | "god" | "joseph" | "abraham" | "widow" | "taxcollector" | "caesar" | "paul" | "david";

interface BibleCharacterProps {
  character: CharacterType;
  message: string;
  className?: string;
  animated?: boolean;
  soundEffect?: boolean;
  size?: number;
  showWisdomLevel?: boolean;
}

const characterMap = {
  jesus: {
    name: "Jesus",
    color: "bg-pixel-blue",
    wisdomLevel: 100,
    soundEffect: "powerup"
  },
  moses: {
    name: "Moses",
    color: "bg-pixel-cyan",
    wisdomLevel: 90,
    soundEffect: "scroll"
  },
  solomon: {
    name: "Solomon",
    color: "bg-pixel-yellow",
    wisdomLevel: 95,
    soundEffect: "success"
  },
  god: {
    name: "God",
    color: "bg-pixel-purple",
    wisdomLevel: 100,
    soundEffect: "powerup"
  },
  joseph: {
    name: "Joseph",
    color: "bg-pixel-green",
    wisdomLevel: 85,
    soundEffect: "coin"
  },
  abraham: {
    name: "Abraham",
    color: "bg-pixel-orange",
    wisdomLevel: 92,
    soundEffect: "scroll"
  },
  widow: {
    name: "Widow",
    color: "bg-pixel-pink",
    wisdomLevel: 80,
    soundEffect: "coin"
  },
  taxcollector: {
    name: "Tax Collector",
    color: "bg-pixel-red",
    wisdomLevel: 75,
    soundEffect: "coin"
  },
  caesar: {
    name: "Caesar",
    color: "bg-pixel-blue",
    wisdomLevel: 70,
    soundEffect: "coin"
  },
  paul: {
    name: "Paul",
    color: "bg-pixel-cyan",
    wisdomLevel: 88,
    soundEffect: "scroll"
  },
  david: {
    name: "David",
    color: "bg-pixel-green",
    wisdomLevel: 85,
    soundEffect: "success"
  }
};

const BibleCharacter: React.FC<BibleCharacterProps> = ({ 
  character, 
  message,
  className = "",
  animated = true,
  soundEffect = false,
  size = 16,
  showWisdomLevel = false
}) => {
  const { name, color, wisdomLevel, soundEffect: characterSound } = characterMap[character];
  const { playSound, userInteracted } = useSound();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (soundEffect && userInteracted && !hasPlayed) {
      playSound(characterSound);
      setHasPlayed(true);
    }
  }, [soundEffect, userInteracted, characterSound, playSound, hasPlayed]);

  const handleCharacterClick = () => {
    setIsAnimating(true);
    if (userInteracted) {
      playSound(characterSound);
    }
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex-shrink-0 mr-3">
        <div 
          className={`${color} w-${size} h-${size} rounded-md ${animated ? 'animate-pulse' : ''} ${isAnimating ? 'animate-bounce' : ''} flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-110`}
          onClick={handleCharacterClick}
        >
          {name.charAt(0)}
        </div>
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
