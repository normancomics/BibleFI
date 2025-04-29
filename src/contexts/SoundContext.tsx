
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

// Create audio elements with iPad compatibility in mind
const createAudio = (src: string): HTMLAudioElement => {
  const audio = new Audio(src);
  audio.volume = 0.5; // Slightly louder for iPad
  audio.preload = "auto";
  return audio;
};

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);
  
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
    
    // Pre-load all sounds
    Promise.all(
      Object.values(loadedSounds).map(audio => {
        return new Promise((resolve) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.load();
        });
      })
    ).then(() => {
      console.log("All sounds preloaded successfully");
      setSoundsLoaded(true);
    });
    
    // Setup global interaction handler - special focus on iPad compatibility
    const handleInteraction = () => {
      setUserInteracted(true);
      console.log("User has interacted with the page - sounds can now play");
      
      // Try to play all sounds with minimal volume to unlock audio on iOS/iPad
      Object.values(loadedSounds).forEach(audio => {
        const originalVolume = audio.volume;
        audio.volume = 0.01;
        const playPromise = audio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = originalVolume;
            })
            .catch(e => console.log("Initial sound unlock attempt - this is expected"));
        }
      });
      
      // Remove event listeners after first interaction
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
    
    // Add touch interaction handlers - important for iPad
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);
  
  const playSound = useCallback((sound: SoundType) => {
    if (!isSoundEnabled || !userInteracted) return;
    
    try {
      // Create a fresh audio element each time for better iPad compatibility
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.5; // Louder for iPad
      audio.muted = false;
      
      console.log(`Playing sound: ${sound} for iPad`);
      
      // For iPad, we need to first load then play
      audio.addEventListener('canplaythrough', () => {
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch(err => {
            console.error("Sound still blocked on iPad:", err);
            // Try once more with user gesture
            const forceSoundButton = document.getElementById('force-sound-button');
            if (forceSoundButton) {
              forceSoundButton.style.display = 'block';
              forceSoundButton.onclick = () => {
                audio.play().catch(e => console.error("Final attempt failed:", e));
              };
            }
          });
        }
      }, { once: true });
      
      audio.load();
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
      
      {/* Special sound unlock button for iPad */}
      <button 
        id="force-sound-button"
        onClick={() => {
          setUserInteracted(true);
          playSound("click");
          document.getElementById('force-sound-button')?.setAttribute('style', 'display: none;');
        }} 
        className="fixed bottom-4 right-4 bg-scripture text-white p-3 rounded-lg shadow-lg z-50 flex items-center animate-pulse"
        style={{display: userInteracted ? 'none' : 'flex'}}
        aria-label="Enable Sounds"
      >
        <span className="mr-2">🔊</span> Tap For Sounds (iPad)
      </button>
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
