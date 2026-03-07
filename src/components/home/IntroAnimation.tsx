import React, { useEffect, useState, useCallback } from "react";
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
  const [phase, setPhase] = useState<'line1' | 'line2' | 'scene'>('line1');
  const [fadeOut, setFadeOut] = useState(false);

  const line1 = "Loading Biblical-Wisdom...";
  const line2 = "Activating Biblical Wisdom Synthesis Protocol...";

  // Skip intro for returning users
  useEffect(() => {
    if (localStorage.getItem("biblefi_intro_seen")) {
      onComplete();
    }
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem("biblefi_intro_seen", "1");
    setFadeOut(true);
    setTimeout(() => onComplete(), 400);
  }, [onComplete]);

  useEffect(() => {
    const currentLine = phase === 'line1' ? line1 : phase === 'line2' ? line2 : '';
    if (phase === 'scene') return;

    let i = 0;
    setTypedText('');
    const typingInterval = setInterval(() => {
      if (i < currentLine.length) {
        setTypedText(currentLine.substring(0, i + 1));
        i++;
        if (i % 6 === 0) playSound("select");
      } else {
        clearInterval(typingInterval);
        if (phase === 'line1') {
          setTimeout(() => setPhase('line2'), 400);
        } else {
          setTimeout(() => {
            setPhase('scene');
            playSound("powerup");
            setTimeout(() => handleSkip(), 2000);
          }, 500);
        }
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, [phase, playSound, handleSkip]);

  const scene = biblicalScenes[Math.floor(Math.random() * biblicalScenes.length)];

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-purple-900/90 to-purple-800/70 transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSkip()}
    >
      <div className="text-center max-w-3xl mx-auto p-8">
        {phase === 'scene' ? (
          <div className="mb-12 animate-entrance">
            <div className="text-5xl md:text-7xl font-scroll font-bold mb-4">
              <GlowingText color="yellow">BibleFi</GlowingText>
            </div>
            <div className="text-xl font-scroll font-bold text-ancient-gold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8), 0 0 40px rgb(168 85 247 / 0.6)' }}>
              Biblical Wisdom Synthesis Protocol — Active
            </div>
          </div>
        ) : (
          <div className="mb-8 animate-pulse-glow">
            <div className="text-5xl md:text-6xl font-scroll font-bold mb-2">
              <GlowingText color="yellow">BibleFi</GlowingText>
            </div>
          </div>
        )}

        <div className="border-2 border-ancient-gold/50 p-6 bg-purple-900/30 min-h-[200px] flex flex-col items-center justify-center rounded-lg">
          {phase === 'scene' ? (
            <div className="space-y-4 animate-fade-in">
              <p className="text-lg md:text-xl font-scroll font-bold text-foreground leading-relaxed" style={{ textShadow: '0 0 12px rgba(255, 255, 255, 0.4)' }}>
                {scene?.kjv}
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-ancient-gold/20 border border-ancient-gold/40 text-ancient-gold">
                {scene?.reference}
              </span>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <StrongsTooltip words={scene?.strongs || []} language="hebrew" label="Hebrew" labelColor="#60A5FA" labelBorderColor="rgba(96, 165, 250, 0.3)" labelBgColor="rgba(96, 165, 250, 0.08)" labelGlow="rgba(96, 165, 250, 0.5)" />
                  <span className="text-base font-medium" dir="rtl" style={{ color: '#93C5FD', textShadow: '0 0 10px rgba(96, 165, 250, 0.6)', fontFamily: "'Noto Serif Hebrew', serif" }}>
                    {scene?.hebrew}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <StrongsTooltip words={scene?.strongs || []} language="greek" label="Greek" labelColor="#34D399" labelBorderColor="rgba(52, 211, 153, 0.3)" labelBgColor="rgba(52, 211, 153, 0.08)" labelGlow="rgba(52, 211, 153, 0.5)" />
                  <span className="text-base font-medium" style={{ color: '#6EE7B7', textShadow: '0 0 10px rgba(52, 211, 153, 0.6)', fontFamily: "'Noto Serif', Georgia, serif" }}>
                    {scene?.greek}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {phase === 'line2' && (
                <p className="text-lg font-scroll font-bold text-ancient-gold/60">
                  ✓ {line1}
                </p>
              )}
              <p className="text-xl font-scroll font-extrabold text-ancient-gold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8)' }}>
                {typedText}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-muted-foreground/40 animate-pulse">Tap anywhere to skip</p>
      </div>
    </div>
  );
};

export default IntroAnimation;
