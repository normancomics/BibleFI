
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
      console.log(`Attempting to play sound: ${src}`);
      
      try {
        const audio = new Audio(src);
        audio.volume = volume;
        
        // Add event listeners
        if (onEnded) {
          audio.addEventListener('ended', onEnded);
        }
        
        // Handle errors
        audio.addEventListener('error', (e) => {
          console.error(`Error with sound ${src}:`, e);
        });
        
        // Play the sound
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`✅ Sound ${src} played successfully`);
            })
            .catch(error => {
              console.error(`Failed to play ${src}:`, error);
            });
        }
          
        // Cleanup function
        return () => {
          audio.pause();
          if (onEnded) {
            audio.removeEventListener('ended', onEnded);
          }
          audio.removeEventListener('error', () => {});
        };
      } catch (err) {
        console.error("Error creating audio:", err);
      }
    }
  }, [play, src, volume, onEnded]);
  
  return null;
};

export default SoundEffect;
