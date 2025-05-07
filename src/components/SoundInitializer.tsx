
import React, { useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";

// This component helps initialize sounds early in the app lifecycle
const SoundInitializer: React.FC = () => {
  const { setUserInteracted, playSound } = useSound();
  
  useEffect(() => {
    console.log("Sound initializer mounted - enabling sound interaction");
    
    // Force enable user interaction for development
    setUserInteracted(true);
    
    // Play a silent sound to unlock audio context
    const unlockAudio = () => {
      try {
        const audio = new Audio();
        audio.src = "/sounds/click.mp3";
        audio.volume = 0.01; // Nearly silent
        audio.load();
        
        // Once loaded, try to play
        audio.oncanplaythrough = () => {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.log("Initial unlock attempt (expected to fail on some browsers):", e);
            });
          }
        };
      } catch (e) {
        console.error("Error unlocking audio:", e);
      }
    };
    
    // Try to unlock audio
    unlockAudio();
    
    // After a short delay, try playing a test sound
    const timer = setTimeout(() => {
      console.log("Attempting to play test sound...");
      playSound("click");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [setUserInteracted, playSound]);
  
  return null; // This component doesn't render anything
};

export default SoundInitializer;
