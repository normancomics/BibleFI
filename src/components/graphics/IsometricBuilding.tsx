import React from "react";
import { cn } from "@/lib/utils";

interface IsometricBuildingProps {
  type?: "temple" | "church" | "tower" | "bank";
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

const IsometricBuilding: React.FC<IsometricBuildingProps> = ({
  type = "temple",
  size = "md",
  className = "",
  animated = false
}) => {
  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-16 h-20",
    lg: "w-20 h-24"
  };

  const buildings = {
    temple: (
      <div className="relative">
        {/* Base */}
        <div className="absolute bottom-0 w-full h-8 bg-gradient-to-b from-temple-stone to-iso-wall-dark" 
             style={{ clipPath: "polygon(0 100%, 20% 80%, 80% 80%, 100% 100%)" }} />
        
        {/* Columns */}
        <div className="absolute bottom-2 left-2 w-2 h-12 bg-gradient-to-r from-iso-wall-light to-iso-wall-dark" />
        <div className="absolute bottom-2 left-6 w-2 h-12 bg-gradient-to-r from-iso-wall-light to-iso-wall-dark" />
        <div className="absolute bottom-2 right-6 w-2 h-12 bg-gradient-to-r from-iso-wall-light to-iso-wall-dark" />
        <div className="absolute bottom-2 right-2 w-2 h-12 bg-gradient-to-r from-iso-wall-light to-iso-wall-dark" />
        
        {/* Roof */}
        <div className="absolute top-0 w-full h-4 bg-gradient-to-b from-ancient-gold to-sacred-flame"
             style={{ clipPath: "polygon(0 100%, 50% 0%, 100% 100%)" }} />
      </div>
    ),
    church: (
      <div className="relative">
        {/* Main building */}
        <div className="absolute bottom-0 w-3/4 h-12 bg-gradient-to-b from-iso-wall-light to-iso-wall-dark ml-auto mr-auto left-0 right-0" />
        
        {/* Steeple */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-b from-iso-wall-light to-iso-wall-dark" />
        
        {/* Cross */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-ancient-gold" />
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-ancient-gold" />
      </div>
    ),
    tower: (
      <div className="relative">
        {/* Tower base */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-b from-iso-wall-light to-iso-wall-dark" />
        
        {/* Tower details */}
        <div className="absolute bottom-4 left-1 w-2 h-8 bg-gradient-to-r from-eboy-blue to-eboy-cyan" />
        <div className="absolute bottom-4 right-1 w-2 h-8 bg-gradient-to-r from-eboy-blue to-eboy-cyan" />
        
        {/* Top */}
        <div className="absolute top-0 w-full h-4 bg-gradient-to-b from-eboy-green to-eboy-blue"
             style={{ clipPath: "polygon(20% 100%, 50% 0%, 80% 100%)" }} />
      </div>
    ),
    bank: (
      <div className="relative">
        {/* Building */}
        <div className="absolute bottom-0 w-full h-14 bg-gradient-to-b from-iso-wall-light to-iso-wall-dark" />
        
        {/* Pillars */}
        <div className="absolute bottom-2 left-1 w-1 h-10 bg-gradient-to-r from-ancient-gold to-wisdom-glow" />
        <div className="absolute bottom-2 left-3 w-1 h-10 bg-gradient-to-r from-ancient-gold to-wisdom-glow" />
        <div className="absolute bottom-2 right-3 w-1 h-10 bg-gradient-to-r from-ancient-gold to-wisdom-glow" />
        <div className="absolute bottom-2 right-1 w-1 h-10 bg-gradient-to-r from-ancient-gold to-wisdom-glow" />
        
        {/* Dollar sign */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-ancient-gold font-bold text-xs">$</div>
      </div>
    )
  };

  return (
    <div className={cn(
      "relative isometric-card",
      sizeClasses[size],
      animated && "animate-pixel-bounce hover:animate-character-idle",
      className
    )}>
      {buildings[type]}
    </div>
  );
};

export default IsometricBuilding;