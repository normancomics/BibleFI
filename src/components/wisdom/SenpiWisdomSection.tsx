
import React, { useState } from "react";
import SenpiAIWisdom from "./SenpiAIWisdom";
import PixelButton from "../PixelButton";
import { useSound } from "@/contexts/SoundContext";

const SenpiWisdomSection: React.FC = () => {
  const { playSound } = useSound();
  const [wisdomLevel, setWisdomLevel] = useState(1);
  
  const handleLevelUp = () => {
    playSound("powerup");
    setWisdomLevel(prev => Math.min(prev + 1, 10));
  };
  
  const wisdomMessages = [
    "The wise have wealth and luxury, but fools spend whatever they get. - Proverbs 21:20",
    "Give, and it will be given to you. - Luke 6:38",
    "The LORD will open the heavens, the storehouse of his bounty. - Deuteronomy 28:12",
    "The blessing of the LORD brings wealth, without painful toil for it. - Proverbs 10:22"
  ];

  return (
    <div className="my-8 bg-black/40 border border-ancient-gold/30 rounded-lg p-6">
      <h2 className="text-2xl font-scroll mb-4 text-ancient-gold">AI-Powered BIBLICAL Wisdom</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-scroll mb-3 text-ancient-gold">Wisdom Level: {wisdomLevel}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="col-span-1 bg-scripture/20 p-4 rounded-lg border border-ancient-gold/30">
            <h4 className="text-lg font-scroll text-ancient-gold mb-2">Biblical Financial Wisdom</h4>
            <p className="text-white/90 font-scroll mb-4">
              {wisdomMessages[wisdomLevel % wisdomMessages.length]}
            </p>
            
            <div className="bg-black/40 p-3 rounded border border-ancient-gold/30">
              <h5 className="font-scroll text-ancient-gold">Wisdom Application:</h5>
              <ul className="list-disc list-inside text-white/90 font-scroll text-sm space-y-1 mt-2">
                <li>Save at least 10% of your income</li>
                <li>Diversify investments across multiple assets</li>
                <li>Avoid debt when possible</li>
                <li>Give generously to those in need</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <PixelButton 
                onClick={handleLevelUp}
                farcasterStyle
              >
                Level Up Your Wisdom
              </PixelButton>
            </div>
          </div>
          
          <div className="col-span-1">
            <SenpiAIWisdom />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenpiWisdomSection;
