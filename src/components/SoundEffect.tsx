
import React, { useEffect, useRef } from "react";

export type SoundType = "coin" | "scroll" | "powerup" | "select" | "click" | "error" | "success";

interface SoundEffectProps {
  sound: SoundType;
  play: boolean;
  volume?: number;
  loop?: boolean;
}

// Map of sound effects to their file paths
const soundMap: Record<SoundType, string> = {
  coin: "/sounds/coin.mp3",
  scroll: "/sounds/scroll.mp3",
  powerup: "/sounds/powerup.mp3",
  select: "/sounds/select.mp3",
  click: "/sounds/click.mp3",
  error: "/sounds/error.mp3",
  success: "/sounds/success.mp3"
};

// Create simple audio elements for each sound to ensure they're loaded
const preloadSounds = () => {
  Object.entries(soundMap).forEach(([type, path]) => {
    const audio = new Audio();
    audio.src = path;
    audio.preload = "auto";
  });
};

// Preload sounds when module loads
preloadSounds();

const SoundEffect: React.FC<SoundEffectProps> = ({ 
  sound, 
  play, 
  volume = 0.3,
  loop = false
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (play) {
      try {
        // Create a new audio instance each time for reliable playback
        const audio = new Audio(soundMap[sound]);
        audioRef.current = audio;
        
        // Set properties
        audio.volume = volume;
        audio.loop = loop;
        
        // Play with user interaction handling
        console.log(`Attempting to play sound: ${sound}`);
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.log(`Sound ${sound} failed to play:`, err);
            // We'll try a fallback approach for iOS/Safari
            document.addEventListener('click', function playOnce() {
              audio.play().catch(e => console.log("Fallback play failed"));
              document.removeEventListener('click', playOnce);
            }, { once: true });
          });
        }
      } catch (err) {
        console.error("Error playing sound:", err);
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [play, sound, volume, loop]);

  return null; // Non-visual component
};

export default SoundEffect;
