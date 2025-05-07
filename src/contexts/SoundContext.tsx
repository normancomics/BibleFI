
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SoundType } from "@/components/SoundEffect";

interface SoundContextType {
  playSound: (sound: SoundType) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  userInteracted: boolean;
  setUserInteracted: (value: boolean) => void;
}

const SoundContext = createContext<SoundContextType>({
  playSound: () => {},
  isSoundEnabled: true,
  toggleSound: () => {},
  userInteracted: false,
  setUserInteracted: () => {},
});

interface SoundProviderProps {
  children: React.ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);
  
  // Pre-load audio files
  useEffect(() => {
    const soundTypes: SoundType[] = ["coin", "click", "error", "scroll", "select", "powerup", "success"];
    let loadedSounds = 0;
    
    soundTypes.forEach(sound => {
      const audio = new Audio();
      audio.src = `/sounds/${sound}.mp3`;
      
      // Handle load event
      audio.oncanplaythrough = () => {
        loadedSounds++;
        if (loadedSounds === soundTypes.length) {
          setSoundsLoaded(true);
          console.log("✅ All sounds preloaded successfully");
        }
      };
      
      // Handle errors
      audio.onerror = (e) => {
        console.error(`Failed to load sound: ${sound}`, e);
      };
      
      // Start loading
      audio.load();
    });
    
    // Force user interaction after a short delay (for testing)
    const timer = setTimeout(() => {
      setUserInteracted(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Play sound function
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled) {
      return;
    }
    
    try {
      console.log(`Attempting to play sound: ${sound}`);
      
      // Create a fresh audio element each time for better compatibility
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.5;
      
      // Play the sound without waiting for it to load
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`Sound ${sound} played successfully`);
        }).catch(error => {
          console.warn(`Error playing sound ${sound}:`, error);
          
          // Auto-enable user interaction if needed
          if (!userInteracted) {
            setUserInteracted(true);
          }
        });
      }
    } catch (err) {
      console.error(`Failed to create audio for ${sound}:`, err);
    }
  }, [isSoundEnabled, userInteracted]);
  
  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };
  
  return (
    <SoundContext.Provider 
      value={{ 
        playSound, 
        isSoundEnabled, 
        toggleSound,
        userInteracted,
        setUserInteracted
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
