
import React, { useEffect, useRef } from "react";

export type SoundType = "coin" | "scroll" | "powerup" | "select" | "click" | "error" | "success";

interface SoundEffectProps {
  src: string;
  play: boolean;
  volume?: number;
  onEnded?: () => void;
}

const SoundEffect: React.FC<SoundEffectProps> = ({ src, play, volume = 0.5, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Clean up any existing audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (play) {
      // Create a new audio element
      const audio = new Audio(src);
      audio.volume = volume;
      audio.muted = false; // Ensure not muted
      audioRef.current = audio;
      
      // For iOS compatibility, load and then play
      audio.load();
      
      // Add event listeners
      if (onEnded) {
        audio.addEventListener('ended', onEnded);
      }
      
      // Error handling
      audio.addEventListener('error', (e) => {
        console.error(`Error playing sound ${src}:`, e);
      });
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Sound ${src} played successfully`);
          })
          .catch(error => {
            console.error(`Failed to play ${src}:`, error);
          });
      }
      
      // Clean up function
      return () => {
        audio.pause();
        if (onEnded) {
          audio.removeEventListener('ended', onEnded);
        }
        audio.removeEventListener('error', () => {});
      };
    }
  }, [play, src, volume, onEnded]);
  
  return null;
};

export default SoundEffect;
