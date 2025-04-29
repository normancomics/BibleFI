
import React, { useEffect, useState } from "react";
import { BibleVerse } from "@/data/bibleVerses";
import PixelIcon from "./PixelIcon";

interface ScriptureCardProps {
  verse: BibleVerse;
  className?: string;
}

const ScriptureCard: React.FC<ScriptureCardProps> = ({ verse, className = "" }) => {
  const [playSound, setPlaySound] = useState(false);
  
  // Add effect to play sound when component mounts
  useEffect(() => {
    setPlaySound(true);
  }, []);
  
  // Add null check to prevent rendering if verse is undefined
  if (!verse || !verse.reference) {
    return (
      <div className="scripture-container retro-border pixelated-shadow p-4 animate-pulse">
        <p className="text-foreground text-lg italic font-pixel">Loading scripture wisdom...</p>
      </div>
    );
  }
  
  return (
    <div className={`scripture-container retro-border pixelated-shadow ${className}`}>
      <div className="flex items-center mb-2">
        <PixelIcon 
          src="/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png" 
          alt="Scripture scroll" 
          className="mr-2" 
          bounce={true} 
          glow={true}
          soundEffect={playSound ? "scroll" : undefined}
        />
        <h3 className="font-game text-base text-ancient-gold uppercase tracking-tight">
          {verse.reference}
        </h3>
      </div>
      <p className="text-foreground text-lg leading-relaxed font-pixel bg-black/30 p-2 border-l-4 border-ancient-gold">
        "{verse.text}"
      </p>
      
      <div className="mt-2 flex justify-end">
        <div className="bg-black/50 px-2 py-1 text-xs text-ancient-scroll">
          LEVEL 7 WISDOM
        </div>
      </div>
    </div>
  );
};

export default ScriptureCard;
