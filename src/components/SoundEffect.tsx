
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
    try {
      const audio = new Audio();
      audio.src = path;
      audio.preload = "auto";
      
      // For iOS/Safari, we need to pre-unlock audio
      const unlockAudio = () => {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          console.log(`Preloaded sound: ${type}`);
        }).catch(e => {
          console.log(`Failed to preload sound: ${type}`, e);
        });
      };
      
      // Try to unlock on user interaction
      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('keydown', unlockAudio, { once: true });
    } catch (err) {
      console.error(`Error preloading sound: ${type}`, err);
    }
  });
};

// Preload sounds when module loads
preloadSounds();

const SoundEffect: React.FC<SoundEffectProps> = ({ 
  sound, 
  play, 
  volume = 0.7, // Higher volume for better audibility
  loop = false
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Clean up previous audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (play) {
      try {
        console.log(`Attempting to play sound: ${sound}`);
        
        // Create a new audio instance each time for reliable playback
        const audio = new Audio();
        audio.src = soundMap[sound];
        audioRef.current = audio;
        
        // Set properties
        audio.volume = volume;
        audio.loop = loop;
        audio.muted = false;
        
        // First load then play to improve reliability
        audio.addEventListener('canplaythrough', () => {
          console.log(`Sound ${sound} loaded, attempting to play...`);
          
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error(`Sound ${sound} failed to play:`, err);
              
              // Try to play again on user interaction
              const handleUserInteraction = () => {
                console.log(`Attempting to play ${sound} after user interaction`);
                audio.play().catch(e => console.error("Still failed after interaction:", e));
                
                // Remove event listeners once we attempt to play
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('touchstart', handleUserInteraction);
                document.removeEventListener('keydown', handleUserInteraction);
              };
              
              document.addEventListener('click', handleUserInteraction, { once: true });
              document.addEventListener('touchstart', handleUserInteraction, { once: true });
              document.addEventListener('keydown', handleUserInteraction, { once: true });
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

  // This is a non-visual component
  return null;
};

export default SoundEffect;
