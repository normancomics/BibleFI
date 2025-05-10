
import React, { createContext, useContext, useState, useCallback } from "react";
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
  const [audioElements] = useState<{[key: string]: HTMLAudioElement}>({});
  
  // Simple sound player function
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled || !userInteracted) {
      console.log(`Sound ${sound} not played: enabled=${isSoundEnabled}, userInteracted=${userInteracted}`);
      return;
    }
    
    try {
      console.log(`🔊 Playing sound: ${sound}`);
      
      // Reuse audio elements when possible to avoid creating too many
      if (!audioElements[sound]) {
        audioElements[sound] = new Audio(`/sounds/${sound}.mp3`);
        audioElements[sound].volume = 0.5;
      }
      
      const audio = audioElements[sound];
      
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
      
      // Play the sound
      audio.play().catch(error => {
        console.warn(`Error playing sound ${sound}:`, error);
        // Set user interaction to false if there's a NotAllowedError
        if (error.name === 'NotAllowedError') {
          setUserInteracted(false);
          console.warn('Audio permission denied - user must interact with the page first');
        }
      });
    } catch (err) {
      console.error(`Failed to play sound ${sound}:`, err);
    }
  }, [isSoundEnabled, userInteracted, audioElements]);
  
  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);
  
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
