
import React, { useState } from "react";

interface PixelIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  bounce?: boolean;
  spin?: boolean;
}

const PixelIcon: React.FC<PixelIconProps> = ({ 
  src, 
  alt, 
  size = 32, 
  className = "",
  bounce = false,
  spin = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Determine animation classes
  const animationClass = spin ? "animate-coin-spin" : bounce ? "animate-bounce" : "";
  
  return (
    <img 
      src={src} 
      alt={alt} 
      width={size} 
      height={size} 
      className={`pixel-art ${animationClass} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 ${className}`}
      style={{ 
        imageRendering: "pixelated",
        display: "block",
        filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.3))",
      }}
      onLoad={() => setIsLoaded(true)}
      onError={(e) => {
        console.error(`Failed to load image: ${src}`);
        e.currentTarget.style.backgroundColor = "#f0f0f0";
      }}
    />
  );
};

export default PixelIcon;
