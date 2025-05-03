
import React from "react";
import { useSound } from "@/contexts/SoundContext";

interface SoundActivationButtonProps {
  onActivate: () => void;
}

const SoundActivationButton: React.FC<SoundActivationButtonProps> = ({ onActivate }) => {
  const { setUserInteracted, playSound } = useSound();
  
  const handleClick = () => {
    setUserInteracted(true);
    playSound("powerup");
    onActivate();
  };

  return (
    <button 
      onClick={handleClick} 
      className="fixed bottom-4 right-4 bg-scripture text-white p-3 rounded-lg shadow-lg z-50 flex items-center"
      aria-label="Enable Sounds"
    >
      <span className="mr-2">🔊</span> Enable Bible.Fi Sounds
    </button>
  );
};

export default SoundActivationButton;
