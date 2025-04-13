
import React from "react";
import PixelIcon from "./PixelIcon";

export type CharacterType = "jesus" | "moses" | "solomon" | "david" | "noah" | "paul";

interface PixelCharacterProps {
  character: CharacterType;
  message?: string;
  size?: number;
  className?: string;
  withSpeech?: boolean;
  soundEffect?: boolean;
}

const characterMap = {
  jesus: {
    src: "/lovable-uploads/76f7f2f3-54bc-44d8-bd6d-ea0302f88e5e.png",
    alt: "Pixel Jesus",
    name: "JESUS",
    sound: "powerup"
  },
  moses: {
    src: "/lovable-uploads/76f7f2f3-54bc-44d8-bd6d-ea0302f88e5e.png",
    alt: "Pixel Moses",
    name: "MOSES",
    sound: "scroll"
  },
  solomon: {
    src: "/lovable-uploads/76f7f2f3-54bc-44d8-bd6d-ea0302f88e5e.png",
    alt: "Pixel Solomon",
    name: "SOLOMON",
    sound: "coin"
  },
  david: {
    src: "/lovable-uploads/76f7f2f3-54bc-44d8-bd6d-ea0302f88e5e.png",
    alt: "Pixel David",
    name: "DAVID",
    sound: "select"
  },
  noah: {
    src: "/lovable-uploads/76f7f2f3-54bc-44d8-bd6d-ea0302f88e5e.png",
    alt: "Pixel Noah",
    name: "NOAH",
    sound: "powerup"
  },
  paul: {
    src: "/lovable-uploads/76f7f2f3-54bc-44d8-bd6d-ea0302f88e5e.png",
    alt: "Pixel Paul",
    name: "PAUL",
    sound: "scroll"
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
  const { src, alt, name, sound } = characterMap[character];

  return (
    <div className={`flex items-start ${className}`}>
      <div className="relative">
        <PixelIcon 
          src={src} 
          alt={alt} 
          size={size} 
          glow={true}
          soundEffect={soundEffect ? sound as any : undefined}
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
