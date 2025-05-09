
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
      
      // For iOS/Safari compatibility, use a simpler approach
      try {
        const audio = new Audio(src);
        audio.volume = volume;
        
        // Set important attributes for iOS
        audio.setAttribute("playsinline", "");
        audio.setAttribute("webkit-playsinline", "");
        
        // Start loading the audio
        audio.load();
        
        // Add event listeners
        if (onEnded) {
          audio.addEventListener('ended', onEnded);
        }
        
        // Handle errors
        audio.addEventListener('error', (e) => {
          console.error(`Error with sound ${src}:`, e);
        });
        
        // Play the sound
        audio.play()
          .then(() => {
            console.log(`✅ Sound ${src} played successfully`);
          })
          .catch(error => {
            console.error(`Failed to play ${src}:`, error);
          });
          
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
