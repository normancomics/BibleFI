
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
  
  // Initialize sound files
  useEffect(() => {
    const soundMap: Record<SoundType, string> = {
      coin: "/sounds/coin.mp3",
      scroll: "/sounds/scroll.mp3",
      powerup: "/sounds/powerup.mp3",
      select: "/sounds/select.mp3",
      click: "/sounds/click.mp3",
      error: "/sounds/error.mp3",
      success: "/sounds/success.mp3"
    };
    
    // Preload sounds
    const loadedSounds: Record<SoundType, HTMLAudioElement> = {} as Record<SoundType, HTMLAudioElement>;
    
    Object.entries(soundMap).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.volume = 0.3;
      audio.preload = "auto";
      loadedSounds[key as SoundType] = audio;
    });
    
    setSounds(loadedSounds);
    
    // Setup global interaction handler
    const handleInteraction = () => {
      setUserInteracted(true);
      console.log("User has interacted with the page - sounds can now play");
      // Try to play a silent sound to unlock audio on iOS
      const unlockAudio = new Audio("/sounds/click.mp3");
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
    if (!isSoundEnabled || !userInteracted) return;
    
    try {
      const audio = sounds[sound];
      if (audio) {
        console.log(`Playing sound: ${sound}`);
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.log("Sound blocked, needs user interaction first");
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
