
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  playSound: (soundName: string) => void;
  userInteracted: boolean;
  setUserInteracted: (interacted: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

interface SoundProviderProps {
  children: React.ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  const playSound = (soundName: string) => {
    if (!isEnabled || !userInteracted) {
      console.info(`Sound ${soundName} not played: enabled=${isEnabled}, userInteracted=${userInteracted}`);
      return;
    }

    try {
      // Create simple beep sounds using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sounds
      const frequencies: { [key: string]: number } = {
        select: 800,
        coin: 1200,
        scroll: 600,
        powerup: 1500,
        success: 1000,
        error: 400
      };

      oscillator.frequency.setValueAtTime(frequencies[soundName] || 800, audioContext.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      console.info(`🔊 Playing sound: ${soundName}`);
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  };

  // Enable user interaction tracking
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  return (
    <SoundContext.Provider value={{ isEnabled, setIsEnabled, playSound, userInteracted, setUserInteracted }}>
      {children}
    </SoundContext.Provider>
  );
};

// Default export for backward compatibility
const SoundInitializer: React.FC = () => {
  return null; // This component is no longer needed
};

export default SoundInitializer;
