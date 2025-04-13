
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
}

const PixelButton: React.FC<PixelButtonProps> = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  glitch = false,
  baseStyle = false,
  ...props 
}) => {
  // Determine glitch effect classes
  const glitchClass = glitch ? "glitch-text animate-pixel-shift" : "";
  const glitchAttr = glitch ? { "data-text": typeof children === "string" ? children : "CLICK" } : {};
  
  // Determine if we should use the base button style instead of pixel button
  const buttonClass = baseStyle ? "base-button" : "pixel-button";
  
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
