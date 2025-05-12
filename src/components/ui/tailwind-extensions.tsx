
import React from "react";

// Custom styled components that extend Tailwind functionality
// These are primarily for animations and visual effects

// Animated logo component that uses the new Bible.fi logo
export const AnimatedLogo: React.FC<{ size?: "sm" | "md" | "lg", className?: string }> = ({ 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32"
  };
  
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="font-scroll text-4xl sm:text-5xl md:text-6xl font-bold text-ancient-gold">
        Bible.fi
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
    </div>
  );
};

// Glowing text component
export const GlowingText: React.FC<{ 
  children: React.ReactNode, 
  color?: "gold" | "blue" | "purple" | "white", 
  className?: string
}> = ({ children, color = "gold", className = "" }) => {
  const colorClasses = {
    gold: "text-ancient-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]",
    blue: "text-base-blue drop-shadow-[0_0_8px_rgba(0,82,255,0.7)]",
    purple: "text-scripture drop-shadow-[0_0_8px_rgba(155,135,245,0.7)]",
    white: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]",
  };
  
  return (
    <span className={`${colorClasses[color]} ${className}`}>
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
