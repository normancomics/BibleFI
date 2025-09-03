
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import { SoundType } from "@/components/SoundEffect";

export type CharacterType = 'jesus' | 'solomon' | 'moses' | 'david' | 'noah' | 'paul' | 'coin' | 'abraham' | 'god' | 'joseph' | 'woman-well' | 'caesar' | 'tax-collector' | 'proverbs-scholar' | 'joseph-treasurer' | 'nehemiah' | 'ezra' | 'boaz' | 'lydia';

interface PixelCharacterProps {
  character: CharacterType;
  message?: string | null;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  soundEffect?: boolean;
  glow?: boolean;
  arcadeStyle?: boolean;
}

const characterConfig = {
  god: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "powerup",
    alt: "God Character",
    label: "GOD"
  },
  jesus: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "powerup",
    alt: "Jesus Character",
    label: "JESUS"
  },
  solomon: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "coin",
    alt: "Solomon Character",
    label: "SOLOMON"
  },
  moses: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "scroll",
    alt: "Moses Character",
    label: "MOSES"
  },
  david: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "select",
    alt: "King David Character",
    label: "KING DAVID"
  },
  noah: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "click",
    alt: "Noah Character",
    label: "NOAH"
  },
  paul: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "success",
    alt: "Paul Character",
    label: "PAUL"
  },
  coin: {
    src: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png",
    sound: "coin",
    alt: "Coin Asset",
    label: "COIN"
  },
  abraham: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "scroll",
    alt: "Abraham Character",
    label: "ABRAHAM"
  },
  joseph: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "powerup",
    alt: "Joseph Character",
    label: "JOSEPH"
  },
  shepherd: {
    src: "/pixel-shepherd-david.png",
    sound: "powerup",
    alt: "Shepherd David Character",
    label: "SHEPHERD"
  },
  "woman-well": {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "select",
    alt: "Woman at the Well Character",
    label: "WOMAN AT WELL"
  },
  caesar: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "coin",
    alt: "Caesar Character",
    label: "CAESAR"
  },
  "tax-collector": {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "coin",
    alt: "Tax Collector Character",
    label: "TAX COLLECTOR"
  },
  "proverbs-scholar": {
    src: "/pixel-proverbs-scholar.png",
    sound: "scroll",
    alt: "Proverbs Scholar Character",
    label: "WISDOM SCHOLAR"
  },
  "joseph-treasurer": {
    src: "/pixel-joseph-treasurer.png",
    sound: "coin",
    alt: "Joseph the Treasurer Character",
    label: "JOSEPH'S WISDOM"
  },
  nehemiah: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "powerup",
    alt: "Nehemiah Character",
    label: "NEHEMIAH"
  },
  ezra: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "scroll",
    alt: "Ezra Character",
    label: "EZRA"
  },
  boaz: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "coin",
    alt: "Boaz Character",
    label: "BOAZ"
  },
  lydia: {
    src: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    sound: "success",
    alt: "Lydia Character",
    label: "LYDIA"
  }
};

const PixelCharacter: React.FC<PixelCharacterProps> = ({
  character,
  message,
  className = "",
  onClick,
  animate = false,
  size = 'md',
  soundEffect = false,
  glow = false,
  arcadeStyle = false
}) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get character configuration
  const charConfig = characterConfig[character];
  const characterSrc = charConfig?.src || "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png";
  const characterAlt = charConfig?.alt || "Bible Character";
  const characterSound = charConfig?.sound as SoundType || "select";
  const characterLabel = charConfig?.label || character.toUpperCase();

  // Animation effect
  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setIsAnimating(prev => !prev);
      }, 500);
      
      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [animate]);

  const handleClick = () => {
    if (soundEffect) {
      playSound(characterSound);
    }
    if (onClick) {
      onClick();
    }
    
    // Trigger animation on click
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  // Animation classes
  const animationClasses = [
    animate ? 'animate-float' : '',
    isAnimating ? 'scale-110' : '',
    glow ? 'drop-shadow-glow' : '',
    isHovered ? 'scale-105' : ''
  ].filter(Boolean).join(' ');

  // Base Chain style container - clean, minimalist blue style
  const containerStyle = arcadeStyle 
    ? 'bg-black/30 border border-base-blue rounded-lg' 
    : '';

  return (
    <div
      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-transform duration-300 ${containerStyle} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${sizeClasses[size]} relative ${animationClasses}`}>
        <img
          src={characterSrc}
          alt={characterAlt}
          className="w-full h-full"
        />
        
        {/* Character name label - updated to match Base Chain style */}
        {(isHovered || arcadeStyle) && (
          <div className={`absolute ${arcadeStyle ? 'top-[-20px]' : 'bottom-[-20px]'} left-0 right-0 text-center`}>
            <span className="bg-black/70 text-base-blue px-2 py-1 text-xs rounded font-pixel">
              {characterLabel}
            </span>
          </div>
        )}
      </div>
      
      {/* Character message/wisdom - updated to match Base Chain style */}
      {message && (
        <div className={`mt-2 ${arcadeStyle ? 'bg-black/70 border border-base-blue p-2 rounded' : ''}`}>
          <p className="text-sm text-center font-pixel text-white">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default PixelCharacter;
