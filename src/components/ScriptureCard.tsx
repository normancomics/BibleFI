
import React from "react";
import { BibleVerse } from "@/data/bibleVerses";
import PixelIcon from "./PixelIcon";

interface ScriptureCardProps {
  verse: BibleVerse;
  className?: string;
}

const ScriptureCard: React.FC<ScriptureCardProps> = ({ verse, className = "" }) => {
  return (
    <div className={`scripture-container ${className}`}>
      <div className="flex items-center mb-2">
        <PixelIcon src="/scroll-pixel.png" alt="Scripture scroll" className="mr-2" />
        <h3 className="font-scroll text-lg">{verse.reference}</h3>
      </div>
      <p className="text-foreground text-lg leading-relaxed">{verse.text}</p>
    </div>
  );
};

export default ScriptureCard;
