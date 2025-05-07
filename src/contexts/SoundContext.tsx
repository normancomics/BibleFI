
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
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);
  
  // Initialize Web Audio API for better iOS compatibility
  useEffect(() => {
    // Only create AudioContext after user interaction to avoid warnings
    if (userInteracted && !audioContext) {
      try {
        // Use AudioContext for better cross-browser support
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const newContext = new AudioContextClass();
          setAudioContext(newContext);
          console.log("🎵 Audio Context created successfully");
          
          // Resume the audio context (needed for iOS)
          if (newContext.state === 'suspended') {
            newContext.resume().then(() => {
              console.log("🎵 Audio Context resumed");
            });
          }
        }
      } catch (e) {
        console.error("Failed to create AudioContext:", e);
      }
    }
  }, [userInteracted]);
  
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
  }, []);
  
  // Play sound function with improved iOS support
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled || !userInteracted) {
      console.log(`Sound ${sound} not played: enabled=${isSoundEnabled}, userInteracted=${userInteracted}`);
      return;
    }
    
    try {
      console.log(`🎵 Attempting to play sound: ${sound}`);
      
      // Create a fresh audio element each time for better compatibility
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.5;
      audio.muted = false; // Ensure not muted
      
      // For iOS Safari, we need to play in direct response to a user action
      // We'll use both the audio element and AudioContext if available
      if (audioContext && audioContext.state === "running") {
        console.log("Using AudioContext for playback");
        const source = audioContext.createMediaElementSource(audio);
        source.connect(audioContext.destination);
      }
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`✅ Sound ${sound} played successfully`);
        }).catch(error => {
          console.warn(`❌ Error playing sound ${sound}:`, error);
        });
      }
    } catch (err) {
      console.error(`Failed to create audio for ${sound}:`, err);
    }
  }, [isSoundEnabled, userInteracted, audioContext]);
  
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
