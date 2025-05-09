
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
      console.log(`Attempting to play sound: ${src}`);
      
      try {
        // Create a new audio element
        const audio = new Audio();
        
        // Set up audio properties before setting source (important for iOS)
        audio.autoplay = false; // Don't autoplay initially
        audio.controls = false;
        audio.volume = volume;
        audio.muted = false;
        audio.preload = "auto";
        
        // Critical attributes for iOS
        audio.setAttribute("playsinline", "");
        audio.setAttribute("webkit-playsinline", "");
        
        // Set source after configuring
        audio.src = src;
        
        // Store reference
        audioRef.current = audio;
        
        // Add to DOM temporarily (crucial for iOS Safari)
        document.body.appendChild(audio);
        
        // Force load
        audio.load();
        
        // Add event listeners
        if (onEnded) {
          audio.addEventListener('ended', onEnded);
        }
        
        audio.addEventListener('error', (e) => {
          console.error(`Error with sound ${src}:`, e);
        });
        
        // Now try to play
        audio.play()
          .then(() => {
            console.log(`✅ Sound ${src} played successfully`);
          })
          .catch(error => {
            console.error(`Failed to play ${src}:`, error);
            
            // iOS Safari fallback - create visible controls
            console.log("Attempting visible controls fallback...");
            const fallbackAudio = document.createElement('audio');
            fallbackAudio.controls = true; // Make controls visible
            fallbackAudio.src = src;
            fallbackAudio.volume = volume;
            fallbackAudio.style.position = 'fixed';
            fallbackAudio.style.bottom = '10px';
            fallbackAudio.style.left = '10px';
            fallbackAudio.style.zIndex = '9999';
            
            document.body.appendChild(fallbackAudio);
            
            // Auto-remove after a while
            setTimeout(() => {
              if (document.body.contains(fallbackAudio)) {
                document.body.removeChild(fallbackAudio);
              }
            }, 5000);
          });
      } catch (err) {
        console.error("Error creating audio:", err);
      }
      
      // Clean up function
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          
          if (onEnded) {
            audioRef.current.removeEventListener('ended', onEnded);
          }
          
          // Remove from DOM
          if (document.body.contains(audioRef.current)) {
            document.body.removeChild(audioRef.current);
          }
          
          audioRef.current = null;
        }
      };
    }
  }, [play, src, volume, onEnded]);
  
  return null;
};

export default SoundEffect;
