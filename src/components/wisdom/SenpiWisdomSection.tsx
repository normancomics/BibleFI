
import React from "react";
import SenpiAIWisdom from "./SenpiAIWisdom";
import PixelButton from "../PixelButton";
import { useSound } from "@/contexts/SoundContext";
import PixelCharacter from "../PixelCharacter";

const SenpiWisdomSection: React.FC = () => {
  const { playSound } = useSound();

  const handleCharacterClick = (character: string) => {
    playSound("select");
  };

  return (
    <div className="my-8 bg-black/40 border border-base-blue/30 rounded-lg p-6">
      <h2 className="text-2xl font-scroll mb-4 text-base-blue">AI-Powered BIBLICAL Wisdom</h2>
      
      {/* Character demonstrates wisdom */}
      <div className="mb-6">
        <h3 className="text-xl font-game mb-3 text-white">Meet the BIBLE Characters</h3>
        <p className="mb-4 text-white font-pixel">Tap on any character to hear their wisdom!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <PixelCharacter 
            character="solomon" 
            message="The wise have wealth and luxury, but fools spend whatever they get. - Proverbs 21:20"
            soundEffect={true}
            animate={true}
          />
          
          <PixelCharacter 
            character="jesus" 
            message="Give, and it will be given to you. - Luke 6:38"
            soundEffect={true}
            animate={true}
          />
          
          <PixelCharacter 
            character="coin" 
            message="Honor the LORD with your wealth. - Proverbs 3:9"
            soundEffect={true}
            animate={true}
          />
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -top-6 right-4 z-10">
          <PixelCharacter 
            character="paul" 
            message="For the love of money is a root of all kinds of evil."
            soundEffect={true}
            size="sm"
          />
        </div>
        <SenpiAIWisdom />
      </div>
    </div>
  );
};

export default SenpiWisdomSection;
