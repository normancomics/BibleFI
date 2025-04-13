
import React, { useState, useEffect } from "react";

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
  const [playedSound, setPlayedSound] = useState(false);
  
  // Sound effect mapping
  const soundMap = {
    coin: "/sounds/coin.mp3",
    scroll: "/sounds/scroll.mp3",
    powerup: "/sounds/powerup.mp3",
    select: "/sounds/select.mp3"
  };
  
  // Play sound effect when the component mounts
  useEffect(() => {
    if (soundEffect && !playedSound) {
      const sound = new Audio(soundMap[soundEffect]);
      sound.volume = 0.3; // Lower volume to be less intrusive
      sound.play().catch(e => console.error("Error playing sound:", e));
      setPlayedSound(true);
    }
  }, [soundEffect, playedSound]);
  
  // Determine animation classes
  let animationClass = "";
  if (spin) animationClass = "animate-coin-spin";
  else if (bounce) animationClass = "animate-bounce";
  else if (glitch) animationClass = "animate-pixel-shift";
  
  // Determine glow effect
  const glowClass = glow ? "animate-pulse-glow" : "";
  
  return (
    <div className="relative inline-block">
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
