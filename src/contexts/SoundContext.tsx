
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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
  const audioElements = useRef<{[key: string]: HTMLAudioElement}>({});
  
  // Pre-load audio files for better performance
  useEffect(() => {
    const soundTypes: SoundType[] = ["coin", "click", "error", "scroll", "select", "powerup", "success"];
    
    soundTypes.forEach(sound => {
      const audio = new Audio();
      audio.src = `/sounds/${sound}.mp3`;
      audio.preload = "auto"; // Preload the audio file
      audioElements.current[sound] = audio;
    });
    
    // Force interaction and unlock audio
    const unlockAudio = () => {
      setUserInteracted(true);
      
      // Try to play and immediately pause all sounds to unlock them
      Object.values(audioElements.current).forEach(audio => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              console.log("Audio unlocked successfully");
            })
            .catch(e => console.log("Unlock attempt - expected error:", e));
        }
      });
    };

    // Listen for various user interactions to unlock audio
    const handleUserInteraction = () => unlockAudio();
    
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    
    // Auto-unlock for testing purposes
    const forceUnlockTimer = setTimeout(() => {
      console.log("Auto-enabling user interaction for sounds");
      setUserInteracted(true);
      unlockAudio();
    }, 1000);
    
    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      clearTimeout(forceUnlockTimer);
    };
  }, []);
  
  // Play sound function with improved reliability
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled) {
      console.log(`Sound ${sound} disabled - sounds are turned off`);
      return;
    }
    
    try {
      console.log(`Attempting to play sound: ${sound}`);
      
      // Create a fresh audio element each time for better browser compatibility
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.8; 
      
      // Try to play the sound
      const playPromise = audio.play();
      
      // Handle play promise rejection
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`Sound ${sound} played successfully`);
        }).catch(error => {
          console.error(`Error playing sound ${sound}:`, error);
          
          // If user hasn't interacted, force interaction mode
          if (!userInteracted) {
            setUserInteracted(true);
          }
        });
      }
    } catch (err) {
      console.error(`Error creating audio for ${sound}:`, err);
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
      
      {/* Sound activation notification */}
      {!userInteracted && (
        <div 
          className="fixed bottom-4 right-4 bg-scripture text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce-subtle"
          onClick={() => setUserInteracted(true)}
        >
          Click anywhere to enable sounds 🔊
        </div>
      )}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
