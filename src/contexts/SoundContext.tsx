
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
  
  // A simpler approach for iPad compatibility
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled) {
      console.log(`Sound ${sound} not played: enabled=false`);
      return;
    }
    
    try {
      console.log(`🔊 Attempting to play sound: ${sound}`);
      
      // For iPad/Safari, we need a different approach
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Create audio element
      const audio = new Audio();
      
      // Set attributes before source (important for iOS)
      audio.volume = 0.7;
      audio.muted = false;
      audio.preload = "auto";
      
      // Critical for iOS
      audio.setAttribute("playsinline", "");
      audio.setAttribute("webkit-playsinline", "");
      
      // Then set source
      audio.src = `/sounds/${sound}.mp3`;
      
      // If on iOS, temporarily add to DOM
      if (isIOS) {
        document.body.appendChild(audio);
      }
      
      // Load and play
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ Sound ${sound} played successfully`);
            
            // Clean up if added to DOM
            if (isIOS && document.body.contains(audio)) {
              setTimeout(() => document.body.removeChild(audio), 1000);
            }
          })
          .catch(error => {
            console.warn(`❌ Error playing sound ${sound}:`, error);
            
            // If on iOS and autoplay fails, don't create visible controls here
            // The SoundTestPanel component will handle this case better
          });
      }
    } catch (err) {
      console.error(`Failed to play sound ${sound}:`, err);
    }
  }, [isSoundEnabled]);
  
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
