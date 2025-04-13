
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "base";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  glitch?: boolean;
}

const PixelButton: React.FC<PixelButtonProps> = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  glitch = false,
  ...props 
}) => {
  // Determine glitch effect classes
  const glitchClass = glitch ? "glitch-text animate-pixel-shift" : "";
  const glitchAttr = glitch ? { "data-text": typeof children === "string" ? children : "CLICK" } : {};
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        variant === "base" ? "base-button" : "pixel-button",
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
