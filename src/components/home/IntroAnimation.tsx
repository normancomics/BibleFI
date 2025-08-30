
import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { GlowingText } from "@/components/ui/tailwind-extensions";

interface IntroAnimationProps {
  onComplete: () => void;
}

const biblicalScenes = [
  {
    id: "scene1",
    text: "In the beginning, God created wealth and resources for mankind to steward wisely.",
    sound: "powerup"
  },
  {
    id: "scene2",
    text: "The Lord provides wisdom to those who seek it faithfully.",
    sound: "scroll"
  },
  {
    id: "scene3", 
    text: "A faithful person will be richly blessed, but one eager to get rich will not go unpunished.",
    sound: "select"
  },
  {
    id: "scene4",
    text: "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.",
    sound: "coin"
  }
];

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { playSound } = useSound();
  const [typedText, setTypedText] = useState("");
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showMainTitle, setShowMainTitle] = useState(false);
  const fullText = "Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.";
  
  // Handle typing animation for the initial text
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
        
        // Start scene transitions after typing finishes
        setTimeout(() => {
          setShowMainTitle(true);
          playSound("powerup");
          
          // Scene transition loop - slowed down
          const sceneInterval = setInterval(() => {
            setCurrentSceneIndex(prev => {
              const nextIndex = prev + 1;
              if (nextIndex >= biblicalScenes.length) {
                clearInterval(sceneInterval);
                
                // Complete intro after all scenes - extended time
                setTimeout(() => {
                  onComplete();
                }, 3000);
                return prev;
              }
              
              // Play scene sound
              playSound(biblicalScenes[nextIndex].sound as any);
              return nextIndex;
            });
          }, 5000); // Increased from 3000 to 5000ms
          
        }, 1000);
      }
    }, 80); // Slowed down typing from 50ms to 80ms
    
    return () => clearInterval(typingInterval);
  }, [playSound, fullText, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-purple-900/90 to-purple-800/70">
      <div className="text-center max-w-3xl mx-auto p-8">
        {showMainTitle ? (
          <div className="mb-12 animate-entrance">
            <div className="text-5xl md:text-7xl font-scroll font-bold mb-4">
              <GlowingText color="gold">Bible.fi</GlowingText>
            </div>
            <div className="text-xl font-scroll text-ancient-gold">
              Biblical Wisdom for Financial Stewardship
            </div>
          </div>
        ) : (
          <div className="mb-8 animate-pulse-glow">
            <div className="text-5xl md:text-6xl font-scroll font-bold mb-2">
              <GlowingText color="gold">Bible.fi</GlowingText>
            </div>
          </div>
        )}
        
        <div className="border-2 border-ancient-gold/50 p-6 bg-purple-900/30 min-h-[120px] flex items-center justify-center">
          {showMainTitle ? (
            <p className="text-xl font-scroll text-white animate-fade-in">
              {biblicalScenes[currentSceneIndex]?.text}
            </p>
          ) : (
            <p className="text-xl font-scroll text-white">
              {typedText}
              <span className="animate-pulse">|</span>
            </p>
          )}
        </div>
        
        {showMainTitle && (
          <div className="mt-8">
            <div className="mt-4">
              <p className="text-sm text-ancient-gold font-scroll">Loading Biblical Wisdom...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroAnimation;
