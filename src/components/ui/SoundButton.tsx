
import React from 'react';
import { useSound } from "@/contexts/SoundContext";
import { SoundType } from "@/components/SoundEffect";

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  soundEffect?: SoundType;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'outline' | 'secondary';
}

/**
 * A button that plays sound effects when clicked
 */
const SoundButton: React.FC<SoundButtonProps> = ({
  soundEffect = "click",
  children,
  className = "",
  variant = "default",
  onClick,
  ...props
}) => {
  const { playSound } = useSound();
  
  // Build class names based on variant
  let variantClass = "";
  switch (variant) {
    case 'primary':
      variantClass = "bg-scripture text-white hover:bg-scripture-light";
      break;
    case 'outline':
      variantClass = "bg-transparent border border-scripture text-scripture hover:bg-scripture/10";
      break;
    case 'secondary':
      variantClass = "bg-ancient-gold text-black hover:bg-ancient-gold/80";
      break;
    default:
      variantClass = "bg-black/50 text-white hover:bg-black/70";
  }
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Play sound effect
    playSound(soundEffect);
    
    // Call original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      className={`px-4 py-2 rounded font-pixel transition-all duration-200 ${variantClass} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default SoundButton;
