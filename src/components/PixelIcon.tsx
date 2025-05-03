
import React, { useState } from "react";
import SoundEffect from "./SoundEffect";
import { useSound } from "@/contexts/SoundContext";

interface PixelIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  spin?: boolean;
  glow?: boolean;
  onClick?: () => void;
  playSound?: boolean;
  soundType?: "coin" | "scroll" | "powerup" | "select" | "click" | "error" | "success";
}

const PixelIcon: React.FC<PixelIconProps> = ({
  src,
  alt,
  size = 24,
  className = "",
  spin = false,
  glow = false,
  onClick,
  playSound = false,
  soundType = "coin"
}) => {
  const { isSoundEnabled } = useSound();
  const [playSoundEffect, setPlaySoundEffect] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    if (playSound && isSoundEnabled) {
      setPlaySoundEffect(true);
      setTimeout(() => setPlaySoundEffect(false), 300);
    }
  };
  
  const iconClasses = [
    className,
    "pixelated",
    spin ? "animate-spin" : "",
    glow ? "drop-shadow-glow" : "",
  ].filter(Boolean).join(" ");
  
  return (
    <div className="relative" onClick={handleClick}>
      <img 
        src={src} 
        alt={alt} 
        width={size} 
        height={size} 
        className={iconClasses}
      />
      
      {/* Pass src correctly to SoundEffect */}
      {playSoundEffect && (
        <SoundEffect
          src={`/sounds/${soundType}.mp3`}
          play={playSoundEffect}
          volume={0.5}
          onEnded={() => setPlaySoundEffect(false)}
        />
      )}
    </div>
  );
};

export default PixelIcon;
