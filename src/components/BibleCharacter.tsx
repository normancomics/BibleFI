
import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";

// Define the available character types
export type CharacterType = 
  | "jesus" 
  | "moses" 
  | "solomon" 
  | "david" 
  | "paul" 
  | "noah" 
  | "abraham"
  | "god"
  | "joseph"
  | "woman-well"
  | "caesar"
  | "tax-collector";

// Character info structure
interface CharacterInfo {
  name: string;
  wisdomLevel: number;
  soundEffect: string;
}

// Character data for all character types
const characterData: Record<CharacterType, CharacterInfo> = {
  jesus: {
    name: "Jesus",
    wisdomLevel: 100,
    soundEffect: "powerup"
  },
  moses: {
    name: "Moses",
    wisdomLevel: 95,
    soundEffect: "select"
  },
  solomon: {
    name: "Solomon",
    wisdomLevel: 99,
    soundEffect: "coin"
  },
  david: {
    name: "King David",
    wisdomLevel: 90,
    soundEffect: "scroll"
  },
  paul: {
    name: "Paul",
    wisdomLevel: 92,
    soundEffect: "success"
  },
  noah: {
    name: "Noah",
    wisdomLevel: 85,
    soundEffect: "select"
  },
  abraham: {
    name: "Abraham",
    wisdomLevel: 88,
    soundEffect: "coin"
  },
  god: {
    name: "God",
    wisdomLevel: 100,
    soundEffect: "powerup"
  },
  joseph: {
    name: "Joseph",
    wisdomLevel: 87,
    soundEffect: "select"
  },
  "woman-well": {
    name: "Woman at the Well",
    wisdomLevel: 75,
    soundEffect: "scroll"
  },
  caesar: {
    name: "Caesar",
    wisdomLevel: 70,
    soundEffect: "coin"
  },
  "tax-collector": {
    name: "Tax Collector",
    wisdomLevel: 65,
    soundEffect: "click"
  }
};

interface BibleCharacterProps {
  character: CharacterType;
  showName?: boolean;
  showWisdom?: boolean;
  className?: string;
  onClick?: () => void;
}

const BibleCharacter: React.FC<BibleCharacterProps> = ({
  character,
  showName = true,
  showWisdom = false,
  className = "",
  onClick
}) => {
  const { playSound } = useSound();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const characterInfo = characterData[character];
  const imagePath = `/pixel-${character}.png`;
  
  useEffect(() => {
    let animationTimeout: NodeJS.Timeout;
    
    if (isAnimating) {
      animationTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
    
    return () => {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, [isAnimating]);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    setIsAnimating(true);
    playSound(characterInfo.soundEffect as any);
  };
  
  return (
    <div 
      className={`flex flex-col items-center ${className}`}
      onClick={handleClick}
    >
      <div 
        className={`relative transition-transform duration-300 ${
          isAnimating ? 'scale-110 rotate-3' : ''
        } ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      >
        <img 
          src={imagePath} 
          alt={characterInfo.name} 
          className="pixelated w-16 h-16 object-contain"
        />
        
        {showWisdom && (
          <div className="absolute -top-2 -right-2 bg-ancient-gold/90 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {characterInfo.wisdomLevel}
          </div>
        )}
      </div>
      
      {showName && (
        <p className="mt-1 text-xs font-medium text-white/80">{characterInfo.name}</p>
      )}
    </div>
  );
};

export default BibleCharacter;
