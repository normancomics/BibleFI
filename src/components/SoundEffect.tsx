
import React, { useEffect } from "react";

export type SoundType = "coin" | "scroll" | "powerup" | "select" | "click" | "error" | "success";

interface SoundEffectProps {
  src: string;
  play: boolean;
  volume?: number;
  onEnded?: () => void;
}

const SoundEffect: React.FC<SoundEffectProps> = ({ src, play, volume = 0.5, onEnded }) => {
  useEffect(() => {
    if (play) {
      const audio = new Audio(src);
      audio.volume = volume;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio is playing
          })
          .catch(error => {
            console.error("Error playing sound:", error);
          });
      }
      
      if (onEnded) {
        audio.addEventListener('ended', onEnded);
      }
      
      return () => {
        audio.pause();
        if (onEnded) {
          audio.removeEventListener('ended', onEnded);
        }
      };
    }
  }, [play, src, volume, onEnded]);
  
  return null;
};

export default SoundEffect;
