
import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { GlowingText } from "@/components/ui/tailwind-extensions";
import { biblicalScenes } from "./biblicalScenesData";
import StrongsTooltip from "./StrongsTooltip";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { playSound } = useSound();
  const [typedText, setTypedText] = useState("");
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showMainTitle, setShowMainTitle] = useState(false);
  const fullText = "Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.";
  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
        if (i % 5 === 0) playSound("select");
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowMainTitle(true);
          playSound("powerup");
          const sceneInterval = setInterval(() => {
            setCurrentSceneIndex(prev => {
              const nextIndex = prev + 1;
              if (nextIndex >= biblicalScenes.length) {
                clearInterval(sceneInterval);
                setTimeout(() => onComplete(), 3000);
                return prev;
              }
              playSound(biblicalScenes[nextIndex].sound as any);
              return nextIndex;
            });
          }, 5000);
        }, 1000);
      }
    }, 80);
    return () => clearInterval(typingInterval);
  }, [playSound, fullText, onComplete]);

  const currentScene = biblicalScenes[currentSceneIndex];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-purple-900/90 to-purple-800/70">
      <div className="text-center max-w-3xl mx-auto p-8">
        {showMainTitle ? (
          <div className="mb-12 animate-entrance">
            <div className="text-5xl md:text-7xl font-scroll font-bold mb-4">
              <GlowingText color="yellow">Bible.fi</GlowingText>
            </div>
            <div className="text-xl font-scroll font-bold text-ancient-gold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8), 0 0 40px rgb(168 85 247 / 0.6)' }}>
              Biblical Wisdom for Financial Stewardship
            </div>
          </div>
        ) : (
          <div className="mb-8 animate-pulse-glow">
            <div className="text-5xl md:text-6xl font-scroll font-bold mb-2">
              <GlowingText color="yellow">Bible.fi</GlowingText>
            </div>
          </div>
        )}
        
        <div className="border-2 border-ancient-gold/50 p-6 bg-purple-900/30 min-h-[280px] flex flex-col items-center justify-center rounded-lg">
          {showMainTitle ? (
            <div className="space-y-5 animate-fade-in" key={currentScene?.id}>
              {/* KJV Scripture */}
              <p className="text-lg md:text-xl font-scroll font-bold text-white leading-relaxed" style={{ textShadow: '0 0 12px rgba(255, 255, 255, 0.4), 0 0 24px rgba(168, 85, 247, 0.5)' }}>
                {currentScene?.kjv}
              </p>
              
              {/* Reference */}
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-ancient-gold/20 border border-ancient-gold/40 text-ancient-gold" style={{ textShadow: '0 0 8px rgba(212, 175, 55, 0.6)' }}>
                {currentScene?.reference}
              </span>

              {/* Divider */}
              <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-ancient-gold/50 to-transparent" />

              {/* Original Languages */}
              <div className="space-y-3 pt-1">
                {/* Hebrew */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <StrongsTooltip
                    words={currentScene?.strongs || []}
                    language="hebrew"
                    label="Hebrew"
                    labelColor="#60A5FA"
                    labelBorderColor="rgba(96, 165, 250, 0.3)"
                    labelBgColor="rgba(96, 165, 250, 0.08)"
                    labelGlow="rgba(96, 165, 250, 0.5)"
                  />
                  <span 
                    className="text-base md:text-lg font-medium" 
                    dir="rtl"
                    style={{ 
                      color: '#93C5FD',
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.6), 0 0 20px rgba(96, 165, 250, 0.3), 0 0 40px rgba(96, 165, 250, 0.15)',
                      fontFamily: "'Noto Serif Hebrew', 'Times New Roman', serif"
                    }}
                  >
                    {currentScene?.hebrew}
                  </span>
                </div>

                {/* Greek */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <StrongsTooltip
                    words={currentScene?.strongs || []}
                    language="greek"
                    label="Greek"
                    labelColor="#34D399"
                    labelBorderColor="rgba(52, 211, 153, 0.3)"
                    labelBgColor="rgba(52, 211, 153, 0.08)"
                    labelGlow="rgba(52, 211, 153, 0.5)"
                  />
                  <span 
                    className="text-base md:text-lg font-medium"
                    style={{ 
                      color: '#6EE7B7',
                      textShadow: '0 0 10px rgba(52, 211, 153, 0.6), 0 0 20px rgba(52, 211, 153, 0.3), 0 0 40px rgba(52, 211, 153, 0.15)',
                      fontFamily: "'Noto Serif', Georgia, serif"
                    }}
                  >
                    {currentScene?.greek}
                  </span>
                </div>

                {/* Aramaic */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <StrongsTooltip
                    words={currentScene?.strongs || []}
                    language="aramaic"
                    label="Aramaic"
                    labelColor="#FBBF24"
                    labelBorderColor="rgba(251, 191, 36, 0.3)"
                    labelBgColor="rgba(251, 191, 36, 0.08)"
                    labelGlow="rgba(251, 191, 36, 0.5)"
                  />
                  <span 
                    className="text-base md:text-lg font-medium"
                    dir="rtl"
                    style={{ 
                      color: '#FCD34D',
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.15)',
                      fontFamily: "'Noto Serif Hebrew', 'Times New Roman', serif"
                    }}
                  >
                    {currentScene?.aramaic}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xl font-scroll font-extrabold text-ancient-gold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8), 0 0 40px rgb(168 85 247 / 0.6)', WebkitTextStroke: '0.5px rgba(212, 175, 55, 0.3)' }}>
              {typedText}
              <span className="animate-pulse">|</span>
            </p>
          )}
        </div>
        
        {showMainTitle && (
          <div className="mt-8">
            <div className="mt-4">
              <p className="text-sm text-ancient-gold font-scroll font-bold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8), 0 0 40px rgb(168 85 247 / 0.6)' }}>Loading Biblical Wisdom...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroAnimation;
