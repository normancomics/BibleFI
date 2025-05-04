
import React, { useState, useEffect } from "react";
import PixelIcon from "@/components/PixelIcon";
import PixelButton from "@/components/PixelButton";
import { ExternalLink } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import { CharacterType } from "@/components/PixelCharacter";
import PixelCharacter from "@/components/PixelCharacter";

// Bible character data with wisdom quotes
const bibleCharacters = [
  {
    character: "solomon" as CharacterType,
    message: "Wisdom is more precious than rubies, and all the things you may desire cannot compare with her. - Proverbs 8:11"
  },
  {
    character: "jesus" as CharacterType,
    message: "Do not store up for yourselves treasures on earth, where moths and vermin destroy, but store up treasures in heaven. - Matthew 6:19-20"
  },
  {
    character: "moses" as CharacterType,
    message: "Remember the LORD your God, for it is he who gives you the ability to produce wealth. - Deuteronomy 8:18"
  },
  {
    character: "david" as CharacterType,
    message: "The earth is the LORD's, and everything in it, the world, and all who live in it. - Psalm 24:1"
  }
];

const HomeHeader: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  
  // Rotate through Bible characters
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacterIndex((prevIndex) => 
        prevIndex === bibleCharacters.length - 1 ? 0 : prevIndex + 1
      );
      playSound("scroll");
    }, 10000); // Change character every 10 seconds
    
    return () => clearInterval(interval);
  }, [playSound]);
  
  const handleOpenFarcaster = () => {
    playSound("select");
    toast({
      title: "Farcaster Integration",
      description: "Opening Bible.fi mini-app in Farcaster...",
    });
    
    // For now, we'll just open the Frame HTML page
    window.open("/frame.html", "_blank");
  };
  
  const currentCharacter = bibleCharacters[currentCharacterIndex];
  
  return (
    <section className="text-center mb-12 animate-fade-in">
      <div className="mb-8 animate-float">
        <img 
          src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
          alt="Bible.fi" 
          className="h-32 mx-auto animate-pulse-glow"
        />
      </div>
      
      <p className="text-xl max-w-2xl mx-auto mb-3 animate-entrance">
        Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
      </p>
      
      <div className="flex justify-center items-center mt-2 mb-4">
        <span className="text-sm mr-2">Made on</span>
        <PixelIcon 
          src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png"
          alt="Base Chain Logo" 
          size={20}
          className="inline-block"
        />
        <span className="text-sm ml-1 text-base-blue font-medium">Base Chain</span>
      </div>
      
      <div className="mt-4 mb-6">
        <PixelButton 
          onClick={handleOpenFarcaster}
          className="inline-flex items-center px-4 py-2 animate-bounce-subtle"
        >
          <ExternalLink size={16} className="mr-2" />
          Open in Farcaster
        </PixelButton>
      </div>
      
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="w-full md:w-1/3">
            <PixelCharacter 
              character={currentCharacter.character}
              size="lg"
              animate={true}
              soundEffect={true}
              onClick={() => playSound(currentCharacter.character === "solomon" ? "coin" : "scroll")}
            />
          </div>
          
          <div className="w-full md:w-2/3 character-bubble animate-entrance">
            <p className="italic text-white/90">{currentCharacter.message}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4">
        <img 
          src="/lovable-uploads/ca9f581b-878d-44af-bc2a-b8529637c411.png" 
          alt="Bible Characters" 
          className="h-24 mx-auto pixelated opacity-70 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </section>
  );
};

export default HomeHeader;
