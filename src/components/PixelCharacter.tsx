import React, { useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { SoundType } from "@/components/SoundEffect"; // Import the SoundType

interface PixelCharacterProps {
  character: 'jesus' | 'solomon' | 'moses' | 'david' | 'noah' | 'paul' | 'coin';
  message?: string;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const characterConfig = {
  jesus: {
    src: "/lovable-uploads/4999a976-37a9-44f1-9959-37e31a99939f.png",
    sound: "powerup",
    alt: "Jesus Pixel Art",
  },
  solomon: {
    src: "/lovable-uploads/4e94966c-9c89-499d-b195-5821a9693992.png",
    sound: "coin",
    alt: "Solomon Pixel Art",
  },
  moses: {
    src: "/lovable-uploads/589b204c-0ffb-4c59-949f-fca9896ca59a.png",
    sound: "scroll",
    alt: "Moses Pixel Art",
  },
  david: {
    src: "/lovable-uploads/1c4f4967-9a95-485c-b937-3a989791995f.png",
    sound: "select",
    alt: "David Pixel Art",
  },
  noah: {
    src: "/lovable-uploads/93098951-4491-4441-a84e-f3f6195c92c9.png",
    sound: "click",
    alt: "Noah Pixel Art",
  },
  paul: {
    src: "/lovable-uploads/d194954b-1971-4432-a59f-367a84b0e591.png",
    sound: "success",
    alt: "Paul Pixel Art",
  },
  coin: {
    src: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png",
    sound: "coin",
    alt: "Coin Pixel Art",
  },
};

const PixelCharacter: React.FC<PixelCharacterProps> = ({
  character,
  message,
  className = "",
  onClick,
  animate = false,
  size = 'md',
}) => {
  const { playSound } = useSound();
  const [isHovered, setIsHovered] = useState(false);

  const charConfig = characterConfig[character];
  const characterSrc = charConfig?.src;
  const characterAlt = charConfig?.alt;
  const characterSound = charConfig?.sound as SoundType;

  const handleClick = () => {
    playSound(characterSound);
    if (onClick) {
      onClick();
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={characterSrc}
        alt={characterAlt}
        className={`pixelated mb-2 ${sizeClasses[size]} ${animate ? 'animate-pulse' : ''}`}
      />
      {message && (
        <p className="text-sm text-center text-white">
          {message}
        </p>
      )}
    </div>
  );
};

export default PixelCharacter;
