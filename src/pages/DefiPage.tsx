
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import DefiSwap from "@/components/defi/DefiSwap";
import { useSound } from "@/contexts/SoundContext";
import { AnimatedSpriteBackground, GlowingText } from "@/components/ui/tailwind-extensions";
import PixelCharacter from "@/components/PixelCharacter";

const DefiPage: React.FC = () => {
  const { playSound } = useSound();
  
  useEffect(() => {
    // Play sound when component mounts
    playSound("coin");
  }, [playSound]);
  
  return (
    <div className="min-h-screen">
      <AnimatedSpriteBackground opacity={0.05} />
      <NavBar />
      
      <main className="container mx-auto px-4 py-8 animate-entrance">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-pixel mb-2">
            <GlowingText color="gold">Biblical DeFi</GlowingText>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Apply Biblical wisdom to your financial decisions with 0x Protocol DeFi swaps on Base Chain
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
          <PixelCharacter 
            character="solomon" 
            size="md" 
            soundEffect={true} 
          />
          <div className="character-bubble max-w-sm">
            <p className="text-sm italic">
              "Divide your portion to seven, or even to eight, for you do not know what disaster may happen on earth."
            </p>
            <p className="text-right text-xs mt-1 text-ancient-gold">— Ecclesiastes 11:2</p>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <DefiSwap />
        </div>
        
        <div className="mt-12 text-center text-sm text-white/60">
          <p>All transactions powered by 0x Protocol on Base Chain</p>
          <div className="flex items-center justify-center mt-2 gap-3">
            <img src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" alt="Bible.fi" className="h-6" />
            <span>×</span>
            <img src="https://0x.org/favicon-32x32.png" alt="0x Protocol" className="h-6" />
            <span>×</span>
            <img src="https://base.org/favicon-32x32.png" alt="Base Chain" className="h-6" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DefiPage;
