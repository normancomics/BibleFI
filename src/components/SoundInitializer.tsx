
import React, { useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";

// This component helps initialize sounds early in the app lifecycle
const SoundInitializer: React.FC = () => {
  const { setUserInteracted } = useSound();
  
  // Force enable user interaction for development/demo purposes
  useEffect(() => {
    console.log("Sound initializer mounted - enabling sound interaction");
    
    // Create and play a silent sound to unlock audio context
    const unlockAudio = () => {
      setUserInteracted(true);
      
      try {
        // Create and immediately play a very quiet sound
        const audio = new Audio("/sounds/click.mp3");
        audio.volume = 0.01; // Nearly silent
        const promise = audio.play();
        
        if (promise !== undefined) {
          promise
            .then(() => {
              console.log("Audio context unlocked");
              audio.pause();
              audio.currentTime = 0;
            })
            .catch(e => {
              console.log("Initial unlock failed, will try on user interaction");
            });
        }
      } catch (e) {
        console.error("Error unlocking audio:", e);
      }
    };
    
    // Try to unlock audio immediately
    unlockAudio();
    
    // Set up event listeners to unlock audio on any user interaction
    const handleInteraction = () => {
      console.log("User interaction detected");
      setUserInteracted(true);
      unlockAudio();
    };
    
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [setUserInteracted]);
  
  return null; // This component doesn't render anything
};

export default SoundInitializer;
