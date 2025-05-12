
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
    src: "/pixel-solomon.png", // Temporary character image
    sound: "powerup",
    alt: "God Pixel Art",
    label: "GOD"
  },
  jesus: {
    src: "/pixel-jesus.png",
    sound: "powerup",
    alt: "Jesus Pixel Art",
    label: "JESUS"
  },
  solomon: {
    src: "/pixel-solomon.png",
    sound: "coin",
    alt: "Solomon Pixel Art",
    label: "SOLOMON"
  },
  moses: {
    src: "/pixel-moses.png",
    sound: "scroll",
    alt: "Moses Pixel Art",
    label: "MOSES"
  },
  david: {
    src: "/pixel-david.png",
    sound: "select",
    alt: "King David Pixel Art",
    label: "KING DAVID"
  },
  noah: {
    src: "/pixel-noah.png",
    sound: "click",
    alt: "Noah Pixel Art",
    label: "NOAH"
  },
  paul: {
    src: "/pixel-paul.png",
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
    src: "/pixel-solomon.png", // Temporary character image
    sound: "scroll",
    alt: "Abraham Pixel Art",
    label: "ABRAHAM"
  },
  joseph: {
    src: "/pixel-solomon.png", // Temporary character image
    sound: "powerup",
    alt: "Joseph Pixel Art",
    label: "JOSEPH"
  },
  "woman-well": {
    src: "/pixel-solomon.png", // Temporary character image
    sound: "select",
    alt: "Woman at the Well Pixel Art",
    label: "WOMAN AT WELL"
  },
  caesar: {
    src: "/pixel-solomon.png", // Temporary character image
    sound: "coin",
    alt: "Caesar Pixel Art",
    label: "CAESAR"
  },
  "tax-collector": {
    src: "/pixel-solomon.png", // Temporary character image
    sound: "coin",
    alt: "Tax Collector Pixel Art",
    label: "TAX COLLECTOR"
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
  glow = false
}) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get character configuration
  const charConfig = characterConfig[character];
  const characterSrc = charConfig?.src || "/pixel-solomon.png";
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

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform duration-300 ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${sizeClasses[size]} relative ${animationClasses}`}>
        <img
          src={characterSrc}
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
        <p className="text-sm text-center text-white mt-2 font-scroll">
          {message}
        </p>
      )}
    </div>
  );
};

export default PixelCharacter;
