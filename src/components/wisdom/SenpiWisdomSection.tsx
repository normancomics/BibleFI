
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
    <div className="my-8">
      <h2 className="text-2xl font-scroll mb-4 text-glow">AI-Powered BIBLICAL Wisdom</h2>
      
      {/* Character demonstrates wisdom */}
      <div className="mb-6">
        <h3 className="text-xl font-game mb-3 text-pixel-yellow">Meet the BIBLE Characters</h3>
        <p className="mb-4 text-white">Tap on any character to hear their wisdom!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <PixelCharacter 
            character="solomon" 
            message="The wise have wealth and luxury, but fools spend whatever they get. - Proverbs 21:20"
            soundEffect={true}
          />
          
          <PixelCharacter 
            character="jesus" 
            message="Give, and it will be given to you. - Luke 6:38"
            soundEffect={true}
          />
          
          <PixelCharacter 
            character="coin" 
            message="Honor the LORD with your wealth. - Proverbs 3:9"
            soundEffect={true}
          />
        </div>
      </div>
      
      <SenpiAIWisdom />
    </div>
  );
};

export default SenpiWisdomSection;
