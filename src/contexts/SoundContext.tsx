
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
  
  // Auto-enable user interaction after a delay (for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserInteracted(true);
      console.log("Auto-enabling user interaction for sounds");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Initialize sound files and set up global interaction detection
  useEffect(() => {
    // Global user interaction handler - this is key for iOS/Safari
    const handleInteraction = () => {
      console.log("User interaction detected - sounds can now play");
      setUserInteracted(true);
      
      // Attempt to play a silent sound to unlock audio
      try {
        const audio = new Audio();
        audio.volume = 0.01; // Nearly silent
        audio.src = "/sounds/click.mp3";
        
        const playPromise = audio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              console.log("Audio context unlocked successfully");
            })
            .catch(e => console.log("Initial sound unlock attempt - expected error:", e));
        }
      } catch (e) {
        console.error("Error unlocking audio context:", e);
      }
    };
    
    // Listen for various user interactions
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);
  
  // Play sound function with improved reliability
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled) {
      console.log(`Sound ${sound} not played - sounds are disabled`);
      return;
    }
    
    if (!userInteracted) {
      console.log(`Sound ${sound} not played - waiting for user interaction`);
      return;
    }
    
    try {
      console.log(`Playing sound: ${sound}`);
      
      // Create a fresh audio element each time for better compatibility
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.7; // Louder for better audibility
      
      // Try to play the sound
      const playPromise = audio.play();
      
      // Handle play promise rejection (common in Safari/iOS)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error(`Error playing sound ${sound}:`, error);
          
          // Display a user hint if sounds aren't playing
          const soundHintElement = document.getElementById('sound-activation-hint');
          if (soundHintElement) {
            soundHintElement.style.display = 'block';
            setTimeout(() => {
              soundHintElement.style.display = 'none';
            }, 5000);
          }
        });
      }
    } catch (err) {
      console.error(`Error playing sound ${sound}:`, err);
    }
  }, [isSoundEnabled, userInteracted]);
  
  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const newState = !prev;
      console.log(`Sound ${newState ? 'enabled' : 'disabled'}`);
      return newState;
    });
    
    // Play a sound when turning sounds back on
    if (!isSoundEnabled) {
      setTimeout(() => {
        console.log("Playing sound after enabling");
        try {
          const audio = new Audio("/sounds/powerup.mp3");
          audio.volume = 0.7;
          audio.play().catch(e => console.error("Error playing sound after enable:", e));
        } catch (e) {
          console.error("Error creating audio:", e);
        }
      }, 100);
    }
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
      
      {/* Hidden element for sound activation hint */}
      <div 
        id="sound-activation-hint" 
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#8E5DF6',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontSize: '14px',
          animation: 'bounce 2s infinite'
        }}
      >
        Tap anywhere to enable sounds 🔊
      </div>
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
