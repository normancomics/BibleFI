
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import { SoundType } from "@/components/SoundEffect";

export type CharacterType = 'jesus' | 'solomon' | 'moses' | 'david' | 'noah' | 'paul' | 'coin' | 'abraham' | 'god' | 'joseph' | 'woman-well' | 'caesar' | 'tax-collector';

interface PixelCharacterProps {
  character: CharacterType;
  message?: string;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  soundEffect?: boolean;
  glow?: boolean;
}

const characterConfig = {
  god: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "powerup",
    alt: "God Pixel Art",
    label: "GOD"
  },
  jesus: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "powerup",
    alt: "Jesus Pixel Art",
    label: "JESUS"
  },
  solomon: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "coin",
    alt: "Solomon Pixel Art",
    label: "SOLOMON"
  },
  moses: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "scroll",
    alt: "Moses Pixel Art",
    label: "MOSES"
  },
  david: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "select",
    alt: "King David Pixel Art",
    label: "KING DAVID"
  },
  noah: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "click",
    alt: "Noah Pixel Art",
    label: "NOAH"
  },
  paul: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "success",
    alt: "Paul Pixel Art",
    label: "PAUL"
  },
  coin: {
    src: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png",
    sound: "coin",
    alt: "Coin Pixel Art",
    label: "COIN"
  },
  abraham: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "scroll",
    alt: "Abraham Pixel Art",
    label: "ABRAHAM"
  },
  joseph: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "powerup",
    alt: "Joseph Pixel Art",
    label: "JOSEPH"
  },
  "woman-well": {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "select",
    alt: "Woman at the Well Pixel Art",
    label: "WOMAN AT WELL"
  },
  caesar: {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "coin",
    alt: "Caesar Pixel Art",
    label: "CAESAR"
  },
  "tax-collector": {
    src: "/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png",
    sound: "coin",
    alt: "Tax Collector Pixel Art",
    label: "TAX COLLECTOR"
  }
};

// Helper function to get character position from the sprite sheet
const getCharacterPosition = (character: CharacterType): { x: number, y: number } => {
  const positions: Record<CharacterType, { x: number, y: number }> = {
    god: { x: 0, y: 0 },
    jesus: { x: 1, y: 0 },
    moses: { x: 2, y: 0 },
    abraham: { x: 3, y: 0 },
    joseph: { x: 0, y: 1 },
    solomon: { x: 1, y: 1 },
    david: { x: 2, y: 1 },
    "woman-well": { x: 3, y: 1 },
    caesar: { x: 0, y: 2 },
    "tax-collector": { x: 1, y: 2 },
    coin: { x: 2, y: 2 },
    noah: { x: 2, y: 1 }, // Reusing another character
    paul: { x: 1, y: 2 }  // Reusing another character
  };
  
  return positions[character] || { x: 0, y: 0 };
};

const PixelCharacter: React.FC<PixelCharacterProps> = ({
  character,
  message,
  className = "",
  onClick,
  animate = false,
  size = 'md',
  soundEffect = false,
  glow = false
}) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get character configuration
  const charConfig = characterConfig[character];
  const characterAlt = charConfig?.alt || "Bible Character";
  const characterSound = charConfig?.sound as SoundType || "select";
  const characterLabel = charConfig?.label || character.toUpperCase();
  
  // Set up position for sprite extraction
  const position = getCharacterPosition(character);

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

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform duration-300 ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${sizeClasses[size]} relative ${animationClasses}`}>
        <img
          src="/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png"
          alt={characterAlt}
          className="pixelated w-full h-full"
        />
        
        {isHovered && (
          <div className="absolute bottom-[-20px] left-0 right-0 text-center">
            <span className="bg-black/80 px-2 py-1 text-xs rounded font-pixel text-white">
              {characterLabel}
            </span>
          </div>
        )}
      </div>
      
      {message && (
        <p className="text-sm text-center text-white mt-2">
          {message}
        </p>
      )}
    </div>
  );
};

export default PixelCharacter;
