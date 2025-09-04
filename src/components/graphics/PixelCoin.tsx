import React, { useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { cn } from "@/lib/utils";

interface PixelCoinProps {
  type?: "gold" | "silver" | "crypto" | "tithe";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  clickable?: boolean;
  value?: number;
  className?: string;
  onClick?: () => void;
}

const PixelCoin: React.FC<PixelCoinProps> = ({
  type = "gold",
  size = "md",
  animated = true,
  clickable = false,
  value,
  className = "",
  onClick
}) => {
  const { playSound } = useSound();
  const [isClicked, setIsClicked] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const coinColors = {
    gold: "from-ancient-gold to-wisdom-glow",
    silver: "from-gray-300 to-gray-500",
    crypto: "from-eboy-blue to-eboy-cyan",
    tithe: "from-scripture to-scripture-light"
  };

  const handleClick = () => {
    if (clickable && onClick) {
      setIsClicked(true);
      playSound("coin");
      onClick();
      
      setTimeout(() => setIsClicked(false), 200);
    }
  };

  return (
    <div 
      className={cn(
        "relative",
        sizeClasses[size],
        clickable && "cursor-pointer",
        animated && "animate-coin-spin",
        isClicked && "animate-eboy-glitch",
        className
      )}
      onClick={handleClick}
    >
      {/* Coin base */}
      <div className={cn(
        "w-full h-full rounded-full border-2 border-foreground/20 pixelated",
        "bg-gradient-to-br",
        coinColors[type],
        animated && "hover:animate-pixel-bounce",
        "eboy-glow"
      )}>
        {/* Inner circle */}
        <div className="absolute inset-1 rounded-full border border-foreground/10 bg-gradient-to-tl from-transparent to-white/20" />
        
        {/* Symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          {type === "gold" && <span className="text-foreground/80 font-bold text-xs">₪</span>}
          {type === "silver" && <span className="text-foreground/80 font-bold text-xs">◈</span>}
          {type === "crypto" && <span className="text-foreground/80 font-bold text-xs">₿</span>}
          {type === "tithe" && <span className="text-foreground/80 font-bold text-xs">✝</span>}
        </div>
        
        {/* Value display */}
        {value && (
          <div className="absolute -bottom-1 -right-1 bg-eboy-yellow text-foreground text-xs font-bold px-1 rounded">
            {value}
          </div>
        )}
      </div>
      
      {/* Sparkle effect */}
      {animated && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-wisdom-glow rounded-full animate-pulse opacity-70" />
      )}
    </div>
  );
};

export default PixelCoin;