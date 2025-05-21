
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
  
  // Apply farcaster styling by default
  const baseClass = "bg-purple-900 text-ancient-gold border border-ancient-gold/50 hover:bg-purple-800";
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        variant === "default" ? baseClass : "",
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
