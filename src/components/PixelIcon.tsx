
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
  return (
    <img 
      src={src} 
      alt={alt} 
      width={size} 
      height={size} 
      className={`pixel-art ${className}`} 
    />
  );
};

export default PixelIcon;
