
import React from "react";
import PixelIcon from "./PixelIcon";

export type CharacterType = "jesus" | "moses" | "solomon" | "god" | "joseph" | "abraham" | "widow" | "taxcollector" | "caesar";

interface BibleCharacterProps {
  character: CharacterType;
  message: string;
  className?: string;
}

const characterMap = {
  jesus: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png",
    alt: "Pixel Jesus",
    name: "Jesus"
  },
  moses: {
    src: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png",
    alt: "Pixel Moses",
    name: "Moses"
  },
  solomon: {
    src: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png",
    alt: "Pixel Solomon",
    name: "Solomon"
  },
  god: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png",
    alt: "Pixel God",
    name: "God"
  },
  joseph: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png",
    alt: "Pixel Joseph",
    name: "Joseph"
  },
  abraham: {
    src: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png",
    alt: "Pixel Abraham",
    name: "Abraham"
  },
  widow: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png",
    alt: "Pixel Widow",
    name: "Widow"
  },
  taxcollector: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png",
    alt: "Pixel Tax Collector",
    name: "Tax Collector"
  },
  caesar: {
    src: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png",
    alt: "Pixel Caesar",
    name: "Caesar"
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
        <PixelIcon src={src} alt={alt} size={64} soundEffect="select" bounce={true} glow={true} />
      </div>
      <div className="bg-white border-2 border-scripture p-3 rounded-lg relative speech-bubble">
        <p className="font-bold text-scripture mb-1">{name} says:</p>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default BibleCharacter;
