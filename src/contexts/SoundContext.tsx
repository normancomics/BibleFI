
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

// Create and preload audio elements to work around browser restrictions
const createAudio = (src: string): HTMLAudioElement => {
  const audio = new Audio(src);
  audio.volume = 0.3;
  audio.preload = "auto";
  return audio;
};

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [sounds, setSounds] = useState<Record<SoundType, HTMLAudioElement>>({} as Record<SoundType, HTMLAudioElement>);
  
  // Initialize sound files
  useEffect(() => {
    // Create audio objects with real sound file paths
    const loadedSounds: Record<SoundType, HTMLAudioElement> = {
      coin: createAudio("/sounds/coin.mp3"),
      scroll: createAudio("/sounds/scroll.mp3"),
      powerup: createAudio("/sounds/powerup.mp3"),
      select: createAudio("/sounds/select.mp3"),
      click: createAudio("/sounds/click.mp3"),
      error: createAudio("/sounds/error.mp3"),
      success: createAudio("/sounds/success.mp3")
    };
    
    setSounds(loadedSounds);
    
    // Setup global interaction handler
    const handleInteraction = () => {
      setUserInteracted(true);
      console.log("User has interacted with the page - sounds can now play");
      
      // Try to play a silent sound to unlock audio on iOS
      const unlockAudio = createAudio("/sounds/click.mp3");
      unlockAudio.volume = 0.1;
      unlockAudio.play().catch(e => console.log("Initial sound play failed, this is normal"));
      
      // Remove event listeners after first interaction
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
    
    // Add touch interaction handlers
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);
  
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled) return;
    
    try {
      // Create a fresh audio element each time to avoid playback issues
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.3;
      
      console.log(`Playing sound: ${sound}`);
      
      // Try to play the sound
      const playPromise = audio.play();
      
      if (playPromise) {
        playPromise.catch(err => {
          console.log("Sound blocked, needs user interaction first. Click anywhere on the page to enable sounds.");
          
          // If sound fails, and we don't have userInteracted flag set, we'll set it to try again
          if (!userInteracted) {
            // We'll mark this as false to avoid recursive loop
            setUserInteracted(true);
          }
        });
      }
    } catch (err) {
      console.error("Error playing sound:", err);
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
      {/* Always-visible sound activation button */}
      {!userInteracted && (
        <button 
          onClick={() => setUserInteracted(true)} 
          className="fixed bottom-4 right-4 bg-scripture text-white p-3 rounded-lg shadow-lg z-50 flex items-center animate-pulse"
          aria-label="Enable Sounds"
        >
          <span className="mr-2">🔊</span> Tap for Sounds
        </button>
      )}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
