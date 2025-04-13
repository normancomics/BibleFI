
import React from "react";
import PixelIcon from "./PixelIcon";

export type CharacterType = "jesus" | "moses" | "solomon";

interface BibleCharacterProps {
  character: CharacterType;
  message: string;
  className?: string;
}

const characterMap = {
  jesus: {
    src: "/jesus-pixel.png",
    alt: "Pixel Jesus",
    name: "Jesus"
  },
  moses: {
    src: "/moses-pixel.png",
    alt: "Pixel Moses",
    name: "Moses"
  },
  solomon: {
    src: "/solomon-pixel.png",
    alt: "Pixel Solomon",
    name: "Solomon"
  }
};

const BibleCharacter: React.FC<BibleCharacterProps> = ({ 
  character, 
  message,
  className = "" 
}) => {
  const { src, alt, name } = characterMap[character];

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex-shrink-0 mr-3">
        <PixelIcon src={src} alt={alt} size={64} />
      </div>
      <div className="bg-white border-2 border-scripture p-3 rounded-lg relative speech-bubble">
        <p className="font-bold text-scripture mb-1">{name} says:</p>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default BibleCharacter;
