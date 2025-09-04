
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
      <div className={`relative ${onClick ? 'cursor-pointer' : ''} ${isAnimating ? 'animate-eboy-glitch' : 'animate-character-idle'}`}>
        <img 
          src={imagePath} 
          alt={characterInfo.name} 
          className="w-16 h-16 object-contain pixelated pixel-sprite eboy-glow transition-all duration-200 hover:scale-110"
        />
        
        {showWisdomLevel && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-eboy-yellow to-ancient-gold text-foreground text-xs font-bold eboy-text rounded-full w-6 h-6 flex items-center justify-center border border-foreground/20 animate-pulse">
            {characterInfo.wisdomLevel}
          </div>
        )}
        
        {/* Character glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-eboy-green/20 to-transparent rounded-full blur-md animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {showName && (
        <p className="mt-1 text-xs font-medium text-white/80">{characterInfo.name}</p>
      )}
      
      {message && (
        <div className="mt-3 max-w-sm isometric-card bg-gradient-to-br from-iso-wall-light to-iso-wall-dark border-2 border-eboy-green p-3 animate-entrance">
          <p className="text-sm text-foreground font-scroll leading-relaxed">{message}</p>
          {/* Speech bubble pointer */}
          <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-eboy-green" />
        </div>
      )}
    </div>
  );
};

export default BibleCharacter;
