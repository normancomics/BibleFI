import React from 'react';
import { cn } from '@/lib/utils';

interface LogoIconProps {
  name: 'base' | 'farcaster' | 'biblefi' | 'eth' | 'usdc' | 'bitcoin';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glowOnHover?: boolean;
}

const LogoIcon: React.FC<LogoIconProps> = ({ 
  name, 
  size = 'md', 
  className, 
  glowOnHover = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const getIconPath = (iconName: string) => {
    switch (iconName) {
      case 'base':
        return '/logos/base-logo.png';
      case 'farcaster':
        return '/logos/farcaster-logo.png';
      case 'biblefi':
        return '/public/bible-fi-brand-logo-v2.png';
      case 'eth':
        return '/logos/ethereum-logo.png';
      case 'usdc':
        return '/logos/usdc-logo.png';
      case 'bitcoin':
        return '/logos/bitcoin-logo.png';
      default:
        return '/logos/default-logo.png';
    }
  };

  const getLogo = () => {
    switch (name) {
      case 'base':
        return (
          <div className={cn(
            "inline-flex items-center justify-center rounded-full bg-base-blue/20 border border-base-blue/30",
            sizeClasses[size],
            glowOnHover && "hover:shadow-lg hover:shadow-base-blue/50 transition-shadow duration-300",
            className
          )}>
            <div className="text-base-blue font-bold text-xs">B</div>
          </div>
        );
      
      case 'farcaster':
        return (
          <div className={cn(
            "inline-flex items-center justify-center rounded bg-purple-600/20 border border-purple-600/30",
            sizeClasses[size],
            glowOnHover && "hover:shadow-lg hover:shadow-purple-600/50 transition-shadow duration-300",
            className
          )}>
            <div className="text-purple-400 font-bold text-xs">FC</div>
          </div>
        );
      
      case 'biblefi':
        return (
          <div className={cn(
            "inline-flex items-center justify-center rounded border border-ancient-gold/30 bg-ancient-gold/10",
            sizeClasses[size],
            "animate-pulse-glow", // Always glowing for Bible.fi logo
            className
          )}>
            <div className="text-ancient-gold font-bold text-xs">B</div>
          </div>
        );
      
      case 'eth':
        return (
          <div className={cn(
            "inline-flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30",
            sizeClasses[size],
            glowOnHover && "hover:shadow-lg hover:shadow-blue-500/50 transition-shadow duration-300",
            className
          )}>
            <div className="text-blue-400 font-bold text-xs">Ξ</div>
          </div>
        );
      
      case 'usdc':
        return (
          <div className={cn(
            "inline-flex items-center justify-center rounded-full bg-blue-600/20 border border-blue-600/30",
            sizeClasses[size],
            glowOnHover && "hover:shadow-lg hover:shadow-blue-600/50 transition-shadow duration-300",
            className
          )}>
            <div className="text-blue-400 font-bold text-xs">$</div>
          </div>
        );
      
      case 'bitcoin':
        return (
          <div className={cn(
            "inline-flex items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/30",
            sizeClasses[size],
            glowOnHover && "hover:shadow-lg hover:shadow-orange-500/50 transition-shadow duration-300",
            className
          )}>
            <div className="text-orange-400 font-bold text-xs">₿</div>
          </div>
        );
      
      default:
        return (
          <div className={cn(
            "inline-flex items-center justify-center rounded border border-white/30 bg-white/10",
            sizeClasses[size],
            glowOnHover && "hover:shadow-lg hover:shadow-white/50 transition-shadow duration-300",
            className
          )}>
            <div className="text-white font-bold text-xs">?</div>
          </div>
        );
    }
  };

  return getLogo();
};

export default LogoIcon;