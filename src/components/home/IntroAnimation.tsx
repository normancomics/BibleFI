
import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import PixelCharacter from "@/components/PixelCharacter";
import { CharacterType } from "@/components/PixelCharacter";

interface IntroAnimationProps {
  onComplete: () => void;
}

const biblicalCharacters: CharacterType[] = ["jesus", "solomon", "moses", "david", "abraham", "noah"];

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { playSound } = useSound();
  const [typedText, setTypedText] = useState("");
  const [currentCharacter, setCurrentCharacter] = useState<CharacterType>("jesus");
  const [showCharacters, setShowCharacters] = useState(false);
  const fullText = "BIBLICAL wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.";
  
  // Handle typing animation
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
        
        // Add sound effect every few characters
        if (i % 5 === 0) {
          playSound("select");
        }
      } else {
        clearInterval(typingInterval);
        setShowCharacters(true);
        playSound("scroll");
        
        // Show main content after typing + character showcase finishes
        setTimeout(() => {
          onComplete();
          playSound("powerup");
        }, 3000);
      }
    }, 50);
    
    return () => clearInterval(typingInterval);
  }, [playSound, fullText, onComplete]);
  
  // Cycle through characters during intro
  useEffect(() => {
    if (showCharacters) {
      const characterInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * biblicalCharacters.length);
        setCurrentCharacter(biblicalCharacters[randomIndex]);
        playSound("coin");
      }, 800);
      
      return () => clearInterval(characterInterval);
    }
    
    return undefined;
  }, [showCharacters, playSound]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="mb-8 animate-pulse-glow">
          <img 
            src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" 
            alt="Bible.fi" 
            className="h-32 mx-auto" 
          />
        </div>
        
        <div className="border-2 border-scripture p-6 bg-black/80">
          <p className="text-xl font-pixel text-white">
            {typedText}
            <span className="animate-pulse">|</span>
          </p>
        </div>
        
        {showCharacters && (
          <div className="mt-8 animate-entrance">
            <div className="flex justify-center gap-4">
              <PixelCharacter 
                character={currentCharacter}
                size="lg"
                animate={true}
                soundEffect={false}
              />
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-white/70">Loading Biblical Wisdom...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroAnimation;
