
import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { playSound } = useSound();
  const [typedText, setTypedText] = useState("");
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
        
        // Show main content after typing finishes
        setTimeout(() => {
          onComplete();
          playSound("powerup");
        }, 1000);
      }
    }, 50);
    
    return () => clearInterval(typingInterval);
  }, [playSound, fullText, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-6xl font-game text-scripture mb-8 animate-pulse gold-gradient-text">BIBLE.FI</h1>
        <div className="border-2 border-scripture p-6 bg-black/80">
          <p className="text-xl font-pixel text-white">
            {typedText}
            <span className="animate-pulse">|</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
