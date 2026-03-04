
import React from "react";

// Custom styled components that extend Tailwind functionality
// These are primarily for animations and visual effects

// eBoy-style pixel logo component
export const AnimatedLogo: React.FC<{ size?: "sm" | "md" | "lg", className?: string }> = ({ 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl"
  };
  
  return (
    <div className={`${className} eboy-card p-4 bg-eboy-yellow`}>
      <div className={`font-pixel font-bold ${sizeClasses[size]} text-foreground uppercase tracking-wider`}>
        BibleFi
      </div>
    </div>
  );
};

// eBoy-style pixel text component
export const GlowingText: React.FC<{ 
  children: React.ReactNode, 
  color?: "yellow" | "green" | "pink" | "blue" | "purple", 
  className?: string
}> = ({ children, color = "yellow", className = "" }) => {
  const colorClasses = {
    yellow: "text-eboy-yellow",
    green: "text-eboy-green",
    pink: "text-eboy-pink",
    blue: "text-eboy-blue",
    purple: "text-eboy-purple",
  };
  
  return (
    <span className={`${colorClasses[color]} font-pixel uppercase tracking-wider eboy-text ${className}`}>
      {children}
    </span>
  );
};

// Animated sprite background
export const AnimatedSpriteBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => {
  return (
    <div 
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-repeat animate-scroll-slow"
        style={{
          backgroundImage: 'url("/pixel-temple-bg.png")',
          backgroundSize: '1000px 1000px',
          filter: 'blur(8px)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
    </div>
  );
};

// Animated coin that spins
export const SpinningCoin: React.FC<{ size?: number, className?: string }> = ({ 
  size = 32, 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png" 
        alt="Digital Coin" 
        width={size}
        height={size}
        className="animate-spin-slow pixelated"
      />
    </div>
  );
};

// Biblical quote component with decorative styling
export const BibleQuote: React.FC<{
  children: React.ReactNode;
  reference?: string;
  className?: string;
}> = ({ children, reference, className = "" }) => {
  return (
    <div className={`relative p-6 ${className}`}>
      <div className="absolute top-0 left-0 text-4xl text-ancient-gold/40">"</div>
      <div className="pl-6 pr-6 italic font-scroll text-white/90">{children}</div>
      <div className="absolute bottom-0 right-0 text-4xl text-ancient-gold/40">"</div>
      {reference && (
        <div className="text-right mt-2 font-scroll text-sm text-ancient-gold">— {reference}</div>
      )}
    </div>
  );
};
