
import React from "react";
import PixelIcon from "./PixelIcon";
import { useSound } from "@/contexts/SoundContext";

export type CharacterType = "jesus" | "moses" | "solomon" | "david" | "noah" | "paul" | "god" | "joseph" | "abraham" | "widow" | "taxcollector" | "caesar" | "coin";

interface PixelCharacterProps {
  character: CharacterType;
  message?: string;
  size?: number;
  className?: string;
  withSpeech?: boolean;
  soundEffect?: boolean;
}

// Updated character mappings with more accurate descriptions and sound effects
const characterMap = {
  jesus: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel Jesus",
    name: "JESUS",
    sound: "powerup"
  },
  moses: {
    src: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png", // Using available upload
    alt: "Pixel Moses",
    name: "MOSES",
    sound: "scroll"
  },
  solomon: {
    src: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png", // Using available upload
    alt: "Pixel Solomon",
    name: "SOLOMON",
    sound: "coin"
  },
  david: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel David",
    name: "DAVID",
    sound: "select"
  },
  noah: {
    src: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png", // Using available upload
    alt: "Pixel Noah",
    name: "NOAH",
    sound: "powerup"
  },
  paul: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel Paul",
    name: "PAUL",
    sound: "scroll"
  },
  god: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel God",
    name: "GOD",
    sound: "powerup"
  },
  joseph: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel Joseph",
    name: "JOSEPH",
    sound: "select"
  },
  abraham: {
    src: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png", // Using available upload
    alt: "Pixel Abraham",
    name: "ABRAHAM",
    sound: "scroll"
  },
  widow: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel Widow",
    name: "WIDOW",
    sound: "coin"
  },
  taxcollector: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel Tax Collector",
    name: "TAX COLLECTOR",
    sound: "coin"
  },
  caesar: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png", // Using available upload
    alt: "Pixel Caesar",
    name: "CAESAR",
    sound: "coin"
  },
  coin: {
    src: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png", // Coin image
    alt: "Pixel Coin",
    name: "COIN",
    sound: "coin"
  }
};

const PixelCharacter: React.FC<PixelCharacterProps> = ({ 
  character, 
  message,
  size = 48,
  className = "",
  withSpeech = true,
  soundEffect = false
}) => {
  const { playSound } = useSound();
  const { src, alt, name, sound } = characterMap[character];
  
  // Play sound when component mounts if soundEffect is true
  React.useEffect(() => {
    if (soundEffect && sound) {
      playSound(sound as SoundType);
    }
  }, [soundEffect, sound, playSound]);

  return (
    <div className={`flex items-start ${className}`}>
      <div className="relative" onClick={() => playSound(sound as SoundType)}>
        <PixelIcon 
          src={src} 
          alt={alt} 
          size={size} 
          glow={true}
          bounce={true}
          className="cursor-pointer hover:scale-110 transition-transform"
        />
        <div className="absolute -top-2 -right-2 bg-black/70 text-pixel-green px-2 py-0.5 text-xs border border-pixel-green font-game">
          {name}
        </div>
      </div>
      
      {withSpeech && message && (
        <div className="ml-3 bg-black/80 border-2 border-pixel-cyan p-3 rounded relative speech-bubble">
          <div className="mb-1 font-pixel text-pixel-cyan">WISDOM.EXE:</div>
          <p className="font-pixel text-white">{message}</p>
        </div>
      )}
    </div>
  );
};

export default PixelCharacter;
