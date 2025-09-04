import React from "react";
import { cn } from "@/lib/utils";
import IsometricBuilding from "./IsometricBuilding";
import PixelCoin from "./PixelCoin";

interface PixelBackgroundProps {
  theme?: "temple" | "city" | "heaven" | "minimal";
  animated?: boolean;
  className?: string;
}

const PixelBackground: React.FC<PixelBackgroundProps> = ({
  theme = "temple",
  animated = true,
  className = ""
}) => {
  const renderTempleTheme = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pixel-sky to-background" />
      
      {/* Temple buildings */}
      <div className="absolute bottom-0 left-4">
        <IsometricBuilding type="temple" size="lg" animated={animated} />
      </div>
      <div className="absolute bottom-0 right-8">
        <IsometricBuilding type="church" size="md" animated={animated} />
      </div>
      <div className="absolute bottom-0 left-1/3">
        <IsometricBuilding type="tower" size="sm" animated={animated} />
      </div>
      
      {/* Floating coins */}
      {animated && (
        <>
          <div className="absolute top-1/4 left-1/4">
            <PixelCoin type="gold" size="sm" animated />
          </div>
          <div className="absolute top-1/3 right-1/4">
            <PixelCoin type="tithe" size="sm" animated />
          </div>
          <div className="absolute top-1/2 left-3/4">
            <PixelCoin type="crypto" size="sm" animated />
          </div>
        </>
      )}
      
      {/* Clouds */}
      <div className="absolute top-8 left-8 w-16 h-8 bg-white/20 rounded-full blur-sm" />
      <div className="absolute top-12 right-12 w-20 h-6 bg-white/15 rounded-full blur-sm" />
    </div>
  );

  const renderCityTheme = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Urban sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-eboy-blue/30 to-background" />
      
      {/* City buildings */}
      <div className="absolute bottom-0 left-2">
        <IsometricBuilding type="bank" size="lg" animated={animated} />
      </div>
      <div className="absolute bottom-0 right-4">
        <IsometricBuilding type="tower" size="lg" animated={animated} />
      </div>
      <div className="absolute bottom-0 left-1/2">
        <IsometricBuilding type="church" size="md" animated={animated} />
      </div>
      
      {/* Digital elements */}
      {animated && (
        <>
          <div className="absolute top-1/4 left-1/3 animate-color-shift">
            <PixelCoin type="crypto" size="md" animated />
          </div>
          <div className="absolute top-1/2 right-1/3">
            <PixelCoin type="silver" size="sm" animated />
          </div>
        </>
      )}
    </div>
  );

  const renderHeavenTheme = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Heavenly gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-wisdom-glow/30 via-scripture/20 to-background" />
      
      {/* Heavenly elements */}
      <div className="absolute top-8 left-1/4 w-12 h-12 bg-ancient-gold/20 rounded-full blur-lg animate-pulse" />
      <div className="absolute top-16 right-1/4 w-8 h-8 bg-wisdom-glow/30 rounded-full blur-md animate-pulse" />
      <div className="absolute top-24 left-3/4 w-6 h-6 bg-scripture/25 rounded-full blur-sm animate-pulse" />
      
      {/* Floating sacred symbols */}
      {animated && (
        <>
          <div className="absolute top-1/3 left-1/4 text-ancient-gold/40 text-2xl animate-float">✝</div>
          <div className="absolute top-1/4 right-1/3 text-wisdom-glow/40 text-xl animate-float" style={{ animationDelay: "1s" }}>✡</div>
          <div className="absolute top-1/2 left-3/4 text-scripture/40 text-lg animate-float" style={{ animationDelay: "2s" }}>☪</div>
        </>
      )}
    </div>
  );

  const renderMinimalTheme = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Simple gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/20" />
      
      {/* Minimal decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-eboy-green rounded-full opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-eboy-yellow rounded-full opacity-40" />
      <div className="absolute bottom-1/3 left-3/4 w-3 h-3 bg-eboy-pink rounded-full opacity-20" />
    </div>
  );

  const themes = {
    temple: renderTempleTheme,
    city: renderCityTheme,
    heaven: renderHeavenTheme,
    minimal: renderMinimalTheme
  };

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {themes[theme]()}
    </div>
  );
};

export default PixelBackground;