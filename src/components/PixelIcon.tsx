
import React from "react";

interface PixelIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

const PixelIcon: React.FC<PixelIconProps> = ({ 
  src, 
  alt, 
  size = 32, 
  className = "" 
}) => {
  // Add error handling for image loading
  return (
    <img 
      src={src} 
      alt={alt} 
      width={size} 
      height={size} 
      className={`pixel-art ${className}`}
      style={{ 
        imageRendering: "pixelated", 
        display: "block" 
      }}
      onError={(e) => {
        console.error(`Failed to load image: ${src}`);
        // Fallback to a default color
        e.currentTarget.style.backgroundColor = "#f0f0f0";
      }}
    />
  );
};

export default PixelIcon;
