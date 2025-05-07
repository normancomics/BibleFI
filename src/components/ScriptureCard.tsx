
import React, { useEffect, useState } from "react";
import { BibleVerse } from "@/data/bibleVerses";
import { useSound } from "@/contexts/SoundContext";

interface ScriptureCardProps {
  verse: BibleVerse;
  className?: string;
}

const ScriptureCard: React.FC<ScriptureCardProps> = ({ verse, className = "" }) => {
  const [playSound, setPlaySound] = useState(false);
  const { userInteracted, playSound: playSoundEffect } = useSound();
  
  // Add effect to play sound when component mounts
  useEffect(() => {
    if (userInteracted) {
      setPlaySound(true);
      playSoundEffect("scroll");
    }
  }, [userInteracted, playSoundEffect]);
  
  // Add null check to prevent rendering if verse is undefined
  if (!verse || !verse.reference) {
    return (
      <div className="scripture-container border border-scripture p-4 animate-pulse bg-black/20 backdrop-blur">
        <p className="text-foreground text-lg italic font-scroll">Loading scripture wisdom...</p>
      </div>
    );
  }
  
  return (
    <div className={`scripture-container border border-ancient-gold bg-black/30 backdrop-blur ${className}`}>
      <div className="flex items-center mb-2 bg-scripture/10 p-2">
        <div className="w-8 h-8 bg-ancient-scroll rounded-md mr-2 flex items-center justify-center">
          <span className="text-scripture-dark font-scroll">§</span>
        </div>
        <h3 className="font-scroll text-base text-ancient-gold uppercase tracking-tight">
          {verse.reference}
        </h3>
      </div>
      <p className="text-foreground text-lg leading-relaxed font-scroll italic bg-black/30 p-4 border-l-4 border-ancient-gold">
        "{verse.text}"
      </p>
      
      <div className="mt-2 flex justify-end">
        <div className="bg-black/50 px-2 py-1 text-xs text-ancient-scroll font-scroll">
          DIVINE WISDOM
        </div>
      </div>
    </div>
  );
};

export default ScriptureCard;
