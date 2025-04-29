
import React from "react";
import { Card } from "@/components/ui/card";
import PixelButton from "./PixelButton";
import { getRandomVerse } from "@/data/bibleVerses";
import { Share2, ZapIcon } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

const FarcasterFrame: React.FC = () => {
  const verse = getRandomVerse();
  const { playSound } = useSound();
  
  return (
    <Card className="warpcast-frame p-4 my-4">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-base-blue rounded-full mr-2 animate-pulse"></div>
        <h3 className="text-xl font-game text-glow">Warpcast Your Wisdom</h3>
      </div>
      
      <div className="bg-black/60 border border-pixel-purple p-3 rounded mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-ancient-scroll">{verse.reference}</p>
          <div className="flex items-center">
            <ZapIcon size={14} className="text-yellow-400 mr-1" />
            <span className="text-yellow-400 text-xs">42</span>
          </div>
        </div>
        <p className="italic text-white/90">"{verse.text}"</p>
      </div>
      
      <PixelButton 
        className="w-full flex items-center justify-center base-button"
        onClick={() => playSound("coin")}
      >
        <Share2 size={16} className="mr-2" />
        Cast to Warpcast
      </PixelButton>
      
      <div className="mt-4 text-xs text-center text-white/60">
        <p>Powered by Base Chain</p>
      </div>
    </Card>
  );
};

export default FarcasterFrame;
