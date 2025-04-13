
import React, { useEffect } from "react";

export type SoundType = "coin" | "scroll" | "powerup" | "select" | "click" | "error" | "success";

interface SoundEffectProps {
  sound: SoundType;
  play: boolean;
  volume?: number;
  loop?: boolean;
}

const soundMap: Record<SoundType, string> = {
  coin: "/sounds/coin.mp3",
  scroll: "/sounds/scroll.mp3",
  powerup: "/sounds/powerup.mp3",
  select: "/sounds/select.mp3",
  click: "/sounds/click.mp3",
  error: "/sounds/error.mp3",
  success: "/sounds/success.mp3"
};

const SoundEffect: React.FC<SoundEffectProps> = ({ 
  sound, 
  play, 
  volume = 0.3,
  loop = false
}) => {
  useEffect(() => {
    if (play) {
      const audio = new Audio(soundMap[sound]);
      audio.volume = volume;
      audio.loop = loop;
      
      audio.play().catch(err => {
        console.error(`Failed to play sound ${sound}:`, err);
      });
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [play, sound, volume, loop]);

  return null; // This is a non-visual component
};

export default SoundEffect;
