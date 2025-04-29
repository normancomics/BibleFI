
import React from "react";

export type CharacterType = "jesus" | "moses" | "solomon" | "god" | "joseph" | "abraham" | "widow" | "taxcollector" | "caesar";

interface BibleCharacterProps {
  character: CharacterType;
  message: string;
  className?: string;
}

const characterMap = {
  jesus: {
    name: "Jesus",
    color: "bg-pixel-blue"
  },
  moses: {
    name: "Moses",
    color: "bg-pixel-cyan"
  },
  solomon: {
    name: "Solomon",
    color: "bg-pixel-yellow"
  },
  god: {
    name: "God",
    color: "bg-pixel-purple"
  },
  joseph: {
    name: "Joseph",
    color: "bg-pixel-green"
  },
  abraham: {
    name: "Abraham",
    color: "bg-pixel-orange"
  },
  widow: {
    name: "Widow",
    color: "bg-pixel-pink"
  },
  taxcollector: {
    name: "Tax Collector",
    color: "bg-pixel-red"
  },
  caesar: {
    name: "Caesar",
    color: "bg-pixel-blue"
  }
};

const BibleCharacter: React.FC<BibleCharacterProps> = ({ 
  character, 
  message,
  className = "" 
}) => {
  const { name, color } = characterMap[character];

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex-shrink-0 mr-3">
        <div className={`${color} w-16 h-16 rounded-md animate-pulse flex items-center justify-center text-white font-bold`}>
          {name.charAt(0)}
        </div>
      </div>
      <div className="bg-white border-2 border-scripture p-3 rounded-lg relative speech-bubble">
        <p className="font-bold text-scripture mb-1">{name} says:</p>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default BibleCharacter;
