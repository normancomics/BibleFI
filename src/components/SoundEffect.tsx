
import React, { useEffect, useRef } from "react";

export type SoundType = "coin" | "scroll" | "powerup" | "select" | "click" | "error" | "success";

interface SoundEffectProps {
  sound: SoundType;
  play: boolean;
  volume?: number;
  loop?: boolean;
}

// Create simple base64 audio data for sound effects (these will just be empty placeholders)
const createEmptyAudioSrc = () => {
  return "data:audio/mp3;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMAVEVOQwAAABcAAAB3d3cuc291bmRqYXkuY29tAAAA";
};

const soundMap: Record<SoundType, string> = {
  coin: createEmptyAudioSrc(),
  scroll: createEmptyAudioSrc(),
  powerup: createEmptyAudioSrc(),
  select: createEmptyAudioSrc(),
  click: createEmptyAudioSrc(),
  error: createEmptyAudioSrc(),
  success: createEmptyAudioSrc()
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
