
import React, { useState, useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import SoundEffect from "./SoundEffect";

interface PixelIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  bounce?: boolean;
  spin?: boolean;
  glow?: boolean;
  glitch?: boolean;
  soundEffect?: "coin" | "scroll" | "powerup" | "select";
}

const PixelIcon: React.FC<PixelIconProps> = ({ 
  src, 
  alt, 
  size = 32, 
  className = "",
  bounce = false,
  spin = false,
  glow = false,
  glitch = false,
  soundEffect
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  const { playSound: playSoundEffect, userInteracted } = useSound();
  
  // Play sound effect when the component mounts
  useEffect(() => {
    if (soundEffect && userInteracted) {
      console.log(`PixelIcon triggering sound effect: ${soundEffect}`);
      playSoundEffect(soundEffect);
      setPlaySound(true);
    }
  }, [soundEffect, userInteracted, playSoundEffect]);
  
  // Determine animation classes
  let animationClass = "";
  if (spin) animationClass = "animate-coin-spin";
  else if (bounce) animationClass = "animate-bounce";
  else if (glitch) animationClass = "animate-pixel-shift";
  
  // Determine glow effect
  const glowClass = glow ? "animate-pulse-glow" : "";
  
  return (
    <div className="relative inline-block">
      {soundEffect && (
        <SoundEffect 
          sound={soundEffect} 
          play={playSound} 
        />
      )}
      <img 
        src={src} 
        alt={alt} 
        width={size} 
        height={size} 
        className={`pixel-art ${animationClass} ${glowClass} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 ${className}`}
        style={{ 
          imageRendering: "pixelated",
          display: "block",
          filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.8))",
        }}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          console.error(`Failed to load image: ${src}`);
          e.currentTarget.style.backgroundColor = "#f0f0f0";
        }}
      />
      {glow && (
        <div 
          className="absolute inset-0 z-[-1] blur-md opacity-50 animate-pulse-glow"
          style={{
            background: `rgba(255, 68, 255, 0.5)`,
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
      )}
    </div>
  );
};

export default PixelIcon;
