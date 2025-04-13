
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

// Cache audio instances to prevent multiple loads
const audioCache: Record<string, HTMLAudioElement> = {};

const SoundEffect: React.FC<SoundEffectProps> = ({ 
  sound, 
  play, 
  volume = 0.3,
  loop = false
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (play) {
      // Create or get from cache
      if (!audioCache[sound]) {
        audioCache[sound] = new Audio(soundMap[sound]);
      }
      
      const audio = audioCache[sound];
      audioRef.current = audio;
      
      // Set properties
      audio.volume = volume;
      audio.loop = loop;
      
      // Reset if it was playing
      audio.currentTime = 0;
      
      // Play with user interaction handling
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log(`Sound ${sound} blocked by browser. This is normal before user interaction.`);
          // We don't show errors since this is expected before user interaction
        });
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
