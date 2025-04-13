
import React from "react";
import { BibleVerse } from "@/data/bibleVerses";
import PixelIcon from "./PixelIcon";

interface ScriptureCardProps {
  verse: BibleVerse;
  className?: string;
}

const ScriptureCard: React.FC<ScriptureCardProps> = ({ verse, className = "" }) => {
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
        <PixelIcon src="/scroll-pixel.png" alt="Scripture scroll" className="mr-2 bounce-slow" bounce={true} />
        <h3 className="font-scroll text-lg text-scripture-dark">{verse.reference}</h3>
      </div>
      <p className="text-foreground text-lg leading-relaxed font-pixel">"{verse.text}"</p>
    </div>
  );
};

export default ScriptureCard;
