
import React, { useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";

// This component now silently initializes sound without any UI elements
const SoundInitializer: React.FC = () => {
  const { setUserInteracted } = useSound();
  
  useEffect(() => {
    // Force enable user interaction for all devices automatically
    setUserInteracted(true);
    
    // Create empty audio elements to help unlock audio silently
    const soundTypes = ["click", "coin", "select"];
    
    soundTypes.forEach(type => {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.1;
      audio.muted = false;
      audio.load();
    });
  }, [setUserInteracted]);
  
  return null; // No UI elements
};

export default SoundInitializer;
