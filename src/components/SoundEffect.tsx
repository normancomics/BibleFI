
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
    
    // For iOS/iPad, we need to pre-unlock audio
    document.addEventListener('touchstart', function unlockAudio() {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {});
      document.removeEventListener('touchstart', unlockAudio);
    }, { once: true });
  });
};

// Preload sounds when module loads
preloadSounds();

const SoundEffect: React.FC<SoundEffectProps> = ({ 
  sound, 
  play, 
  volume = 0.5, // Higher volume for iPad
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
        audio.muted = false;
        
        // Play with user interaction handling
        console.log(`Attempting to play sound: ${sound} for iPad`);
        
        // For iPad, first load then play
        audio.addEventListener('canplaythrough', () => {
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.log(`Sound ${sound} failed to play:`, err);
              
              // Try to play again on user interaction
              const handleUserInteraction = () => {
                audio.play().catch(e => console.log("Still failed after interaction"));
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('touchstart', handleUserInteraction);
              };
              
              document.addEventListener('click', handleUserInteraction, { once: true });
              document.addEventListener('touchstart', handleUserInteraction, { once: true });
            });
          }
        }, { once: true });
        
        audio.load();
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
