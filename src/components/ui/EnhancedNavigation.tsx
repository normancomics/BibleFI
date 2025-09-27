import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/ui/LogoIcon';
import { cn } from '@/lib/utils';

interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType<any>;
  logoName?: 'base' | 'farcaster' | 'biblefi' | 'eth' | 'usdc' | 'bitcoin';
  external?: boolean;
}

interface EnhancedNavigationProps {
  items: NavigationItem[];
  className?: string;
}

const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({ items, className }) => {
  const location = useLocation();

  return (
    <nav className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const content = (
          <div className="flex items-center gap-2">
            {item.logoName && (
              <LogoIcon 
                name={item.logoName} 
                size="sm" 
                glowOnHover={!isActive}
                className={isActive ? "biblefi-glow" : ""}
              />
            )}
            {item.icon && !item.logoName && (
              <item.icon className="w-4 h-4" />
            )}
            {item.label}
          </div>
        );

        if (item.external) {
          return (
            <Button
              key={item.path}
              variant="outline"
              size="sm"
              asChild
              className={cn(
                "border-white/20 hover:border-ancient-gold/50 transition-colors",
                "hover:bg-ancient-gold/10"
              )}
            >
              <a 
                href={item.path} 
                target="_blank" 
                rel="noopener noreferrer"
                className="logo-hover-token"
              >
                {content}
              </a>
            </Button>
          );
        }

        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "outline"}
            size="sm"
            asChild
            className={cn(
              isActive
                ? "bg-ancient-gold text-black hover:bg-ancient-gold/80"
                : "border-white/20 hover:border-ancient-gold/50 transition-colors hover:bg-ancient-gold/10",
              !isActive && "logo-hover-token"
            )}
          >
            <Link to={item.path}>
              {content}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
};

export default EnhancedNavigation;