
import React, { useState } from "react";
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

export interface BibleCharacterProps {
  character: CharacterType;
  message?: string;
  showName?: boolean;
  showWisdom?: boolean;
  showWisdomLevel?: boolean;
  className?: string;
  onClick?: () => void;
}

const BibleCharacter: React.FC<BibleCharacterProps> = ({
  character,
  message,
  showName = true,
  showWisdom = false,
  showWisdomLevel = false,
  className = "",
  onClick
}) => {
  const { playSound } = useSound();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const characterInfo = characterData[character];
  const imagePath = `/pixel-${character}.png`;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    setIsAnimating(true);
    playSound(characterInfo.soundEffect as any);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };
  
  return (
    <div 
      className={`flex flex-col items-center ${className}`}
      onClick={handleClick}
    >
      <div className={`relative ${onClick ? 'cursor-pointer' : ''}`}>
        <img 
          src={imagePath} 
          alt={characterInfo.name} 
          className="pixelated w-16 h-16 object-contain"
        />
        
        {showWisdomLevel && (
          <div className="absolute -top-2 -right-2 bg-ancient-gold/90 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {characterInfo.wisdomLevel}
          </div>
        )}
      </div>
      
      {showName && (
        <p className="mt-1 text-xs font-medium text-white/80">{characterInfo.name}</p>
      )}
      
      {message && (
        <div className="mt-3 max-w-sm bg-black/80 border border-scripture/50 p-2 rounded-md">
          <p className="text-sm text-white/90">{message}</p>
        </div>
      )}
    </div>
  );
};

export default BibleCharacter;
