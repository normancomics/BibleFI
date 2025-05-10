
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SoundActivationButtonProps {
  onActivate?: () => void;
}

const SoundActivationButton: React.FC<SoundActivationButtonProps> = ({ onActivate }) => {
  const { setUserInteracted, playSound, isSoundEnabled, toggleSound } = useSound();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Create pulsing animation effect
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 2000);
    
    return () => clearInterval(animationInterval);
  }, []);
  
  const handleClick = () => {
    setUserInteracted(true);
    
    // Play a test sound to unlock audio
    const audio = new Audio('/sounds/powerup.mp3');
    audio.volume = 0.1;
    
    const playPromise = audio.play().catch(e => {
      console.log("Failed to play initial sound:", e);
    });
    
    // Try the playSound function after a short delay
    setTimeout(() => {
      playSound("powerup");
    }, 100);
    
    if (onActivate) {
      onActivate();
    }
  };
  
  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSound();
    // Try to play a sound to test if toggle works
    playSound("click");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <Button 
        onClick={handleClick} 
        className={`bg-scripture text-white p-3 rounded-lg shadow-lg flex items-center transition-transform duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}
        style={{
          boxShadow: isAnimating ? '0 0 15px rgba(155, 135, 245, 0.7)' : '0 0 5px rgba(155, 135, 245, 0.3)'
        }}
        aria-label="Enable Sounds"
      >
        <span className="mr-2 text-2xl">🎮</span> 
        <span>Enable Sound Effects</span>
      </Button>
      
      <button
        onClick={handleToggleSound}
        className="bg-black/70 border border-ancient-gold/50 p-2 rounded-full shadow-lg"
        aria-label={isSoundEnabled ? "Mute Sounds" : "Enable Sounds"}
      >
        {isSoundEnabled ? (
          <Volume2 size={20} className="text-ancient-gold" />
        ) : (
          <VolumeX size={20} className="text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default SoundActivationButton;
