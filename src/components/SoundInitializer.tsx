
import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { Button } from "@/components/ui/button";
import { VolumeOff, Volume2 } from "lucide-react";

// This component helps initialize sounds early in the app lifecycle
// and provides a mobile-friendly way to unlock audio
const SoundInitializer: React.FC = () => {
  const { setUserInteracted, playSound, isSoundEnabled, toggleSound } = useSound();
  const [showUnlockButton, setShowUnlockButton] = useState(true);
  const [unlockAttempts, setUnlockAttempts] = useState(0);
  
  // Function to unlock audio context on mobile devices
  const unlockAudio = () => {
    try {
      console.log("🔊 Attempting to unlock audio context...");
      
      // Create and play multiple silent sounds to maximize chances of unlocking
      const audioElements = [];
      const soundTypes = ["click", "coin", "select"];
      
      soundTypes.forEach(soundType => {
        const audio = new Audio(`/sounds/${soundType}.mp3`);
        audio.volume = 0.01; // Nearly silent
        audio.muted = false; // Ensure not muted
        audio.loop = false;
        audio.load();
        
        // Play with user gesture
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log(`✅ Unlocked audio with ${soundType}`))
            .catch(e => console.log(`❌ Failed to unlock with ${soundType}:`, e));
        }
        
        audioElements.push(audio);
      });
      
      // Set user as interacted
      setUserInteracted(true);
      
      // After a brief delay, try a test sound
      setTimeout(() => {
        playSound("click");
        playSound("coin");
        setShowUnlockButton(false);
      }, 500);
      
      // Increment unlock attempts
      setUnlockAttempts(prev => prev + 1);
    } catch (e) {
      console.error("Error attempting to unlock audio:", e);
    }
  };
  
  useEffect(() => {
    console.log("Sound initializer mounted - awaiting user interaction");
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      console.log("📱 iOS device detected - will require explicit user interaction");
    } else {
      // Still try auto-unlock for non-iOS devices
      const timer = setTimeout(() => {
        unlockAudio();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  if (!showUnlockButton) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={unlockAudio}
        variant="default"
        className="bg-scripture hover:bg-scripture/90 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
        size="lg"
      >
        {isSoundEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeOff className="h-5 w-5" />
        )}
        <span>Tap to Enable Sound</span>
      </Button>
      
      {unlockAttempts > 0 && (
        <div className="text-xs text-white/70 mt-1 text-center">
          Tap again if sound is not working
        </div>
      )}
    </div>
  );
};

export default SoundInitializer;
