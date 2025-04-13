
import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [sounds, setSounds] = useState<Record<SoundType, HTMLAudioElement>>({} as Record<SoundType, HTMLAudioElement>);
  
  // Create simple base64 audio data for sound effects (these will just be empty placeholders)
  const createEmptyAudio = () => {
    return new Audio("data:audio/mp3;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMAVEVOQwAAABcAAAB3d3cuc291bmRqYXkuY29tAAAA");
  };
  
  // Initialize sound files
  useEffect(() => {
    // We'll create empty audio objects since we don't have real sound files
    const loadedSounds: Record<SoundType, HTMLAudioElement> = {} as Record<SoundType, HTMLAudioElement>;
    
    const soundTypes: SoundType[] = ["coin", "scroll", "powerup", "select", "click", "error", "success"];
    
    soundTypes.forEach(type => {
      const audio = createEmptyAudio();
      audio.volume = 0.3;
      audio.preload = "auto";
      loadedSounds[type] = audio;
    });
    
    setSounds(loadedSounds);
    
    // Force user interaction flag to true for development
    setUserInteracted(true);
    
    // Setup global interaction handler
    const handleInteraction = () => {
      setUserInteracted(true);
      console.log("User has interacted with the page - sounds can now play");
      
      // Try to play a silent sound to unlock audio on iOS
      const unlockAudio = createEmptyAudio();
      unlockAudio.volume = 0.1;
      unlockAudio.play().catch(e => console.log("Initial sound play failed, this is normal"));
      
      // Remove event listeners after first interaction
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
    
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);
  
  const playSound = (sound: SoundType) => {
    if (!isSoundEnabled) return;
    
    try {
      const audio = sounds[sound];
      if (audio) {
        console.log(`Playing sound: ${sound}`);
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.log("Sound blocked, needs user interaction first. Click anywhere on the page to enable sounds.");
        });
      }
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };
  
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
