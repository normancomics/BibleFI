import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";

interface SoundSystemManagerProps {
  children: React.ReactNode;
}

// Enhanced sound effects with different tones and patterns
const soundPatterns = {
  welcome: ["powerup", "success", "coin"],
  navigation: ["select", "click"],
  action: ["coin", "success"],
  error: ["error"],
  achievement: ["powerup", "success", "coin"],
  ambient: ["scroll"] // For background ambience
};

const SoundSystemManager: React.FC<SoundSystemManagerProps> = ({ children }) => {
  const { playSound, isSoundEnabled } = useSound();
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const [soundQueue, setSoundQueue] = useState<string[]>([]);

  // Play sound with cooldown to prevent spam
  const playEnhancedSound = (soundType: keyof typeof soundPatterns, index: number = 0) => {
    const now = Date.now();
    if (now - lastPlayedTime < 100) return; // 100ms cooldown

    const sounds = soundPatterns[soundType];
    if (sounds && sounds[index]) {
      playSound(sounds[index] as any);
      setLastPlayedTime(now);
    }
  };

  // Play sound sequence for special events
  const playSoundSequence = (sounds: string[], interval: number = 200) => {
    sounds.forEach((sound, index) => {
      setTimeout(() => {
        playSound(sound as any);
      }, index * interval);
    });
  };

  // Enhanced sound effects for specific events
  const playWelcomeSequence = () => {
    if (isSoundEnabled) {
      playSoundSequence(["powerup", "coin", "success"], 300);
    }
  };

  const playAchievementSound = () => {
    if (isSoundEnabled) {
      playSoundSequence(["success", "powerup", "coin", "success"], 150);
    }
  };

  const playTransactionSuccess = () => {
    if (isSoundEnabled) {
      playSoundSequence(["coin", "coin", "success"], 100);
    }
  };

  // Ambient background sounds (very subtle)
  useEffect(() => {
    if (!isSoundEnabled) return;

    const ambientInterval = setInterval(() => {
      // Very subtle ambient sounds every 30-60 seconds
      if (Math.random() < 0.1) { // 10% chance every interval
        playSound("scroll");
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(ambientInterval);
  }, [isSoundEnabled, playSound]);

  // Provide enhanced sound functions to child components
  const enhancedSoundContext = {
    playEnhancedSound,
    playSoundSequence,
    playWelcomeSequence,
    playAchievementSound,
    playTransactionSuccess,
    playNavigationSound: () => playEnhancedSound("navigation", Math.floor(Math.random() * 2)),
    playActionSound: () => playEnhancedSound("action", Math.floor(Math.random() * 2)),
    playErrorSound: () => playEnhancedSound("error", 0),
  };

  return (
    <div data-sound-context={JSON.stringify(enhancedSoundContext)}>
      {children}
    </div>
  );
};

// Hook to use enhanced sound system
export const useEnhancedSound = () => {
  const { playSound, isSoundEnabled } = useSound();
  
  return {
    playSound,
    isSoundEnabled,
    playNavigationSound: () => playSound(Math.random() > 0.5 ? "select" : "click"),
    playActionSound: () => playSound(Math.random() > 0.5 ? "coin" : "success"),
    playErrorSound: () => playSound("error"),
    playAchievementSound: () => {
      ["success", "powerup", "coin"].forEach((sound, index) => {
        setTimeout(() => playSound(sound as any), index * 150);
      });
    },
    playTransactionSuccess: () => {
      ["coin", "coin", "success"].forEach((sound, index) => {
        setTimeout(() => playSound(sound as any), index * 100);
      });
    }
  };
};

export default SoundSystemManager;