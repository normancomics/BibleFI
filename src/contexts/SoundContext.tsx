
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
  
  // Detect iOS/Safari
  const isIOS = typeof navigator !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  
  const isSafari = typeof navigator !== 'undefined' && 
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Simple sound player function
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled) {
      console.log(`Sound ${sound} not played: enabled=false`);
      return;
    }
    
    try {
      console.log(`🔊 Attempting to play sound: ${sound}`);
      
      // Create audio element
      const audio = new Audio(`/sounds/${sound}.mp3`);
      
      // Set volume
      audio.volume = 0.7;
      
      // Critical for iOS
      audio.setAttribute("playsinline", "");
      audio.setAttribute("webkit-playsinline", "");
      
      // For Safari, add to DOM temporarily
      if (isIOS || isSafari) {
        document.body.appendChild(audio);
      }
      
      // Load and play
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ Sound ${sound} played successfully`);
            
            // Remove from DOM after playing (iOS/Safari)
            if ((isIOS || isSafari) && document.body.contains(audio)) {
              setTimeout(() => document.body.removeChild(audio), 1000);
            }
          })
          .catch(error => {
            console.warn(`❌ Error playing sound ${sound}:`, error);
            // The iOSAudioUnlocker component will handle this case
          });
      }
    } catch (err) {
      console.error(`Failed to play sound ${sound}:`, err);
    }
  }, [isSoundEnabled, isIOS, isSafari]);
  
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
