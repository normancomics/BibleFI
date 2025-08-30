
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  glitch?: boolean;
  baseStyle?: boolean; // Use this instead of variant="base"
  farcasterStyle?: boolean; // New prop for Farcaster styling
}

const PixelButton: React.FC<PixelButtonProps> = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  glitch = false,
  baseStyle = false,
  farcasterStyle = false,
  ...props 
}) => {
  // Determine glitch effect classes
  const glitchClass = glitch ? "glitch-text animate-pixel-shift" : "";
  const glitchAttr = glitch ? { "data-text": typeof children === "string" ? children : "CLICK" } : {};
  
  // eBoy-inspired button styling
  const eboyClass = "eboy-button";
  const eboyYellowClass = "eboy-yellow-button";
  
  let buttonClass = "";
  
  // Default to eBoy styling
  if (farcasterStyle) {
    buttonClass = eboyYellowClass; // Yellow for Farcaster
  } else if (baseStyle || variant === "default") {
    buttonClass = eboyClass; // Green for default
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        buttonClass,
        glitchClass,
        className
      )}
      {...glitchAttr}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PixelButton;
