
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Heart, 
  Shield,
  Coins,
  Calculator,
  Settings,
  Wheat
} from 'lucide-react';
import SoundToggle from '@/components/SoundToggle';
import WalletButton from '@/components/wallet/WalletButton';

const NavBar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/defi', label: 'DeFi', icon: TrendingUp },
    { path: '/staking', label: 'Staking', icon: Coins },
    { path: '/farming', label: 'Farming', icon: Wheat },
    { path: '/token', label: '$BIBLE', icon: Coins, badge: 'NEW' },
    { path: '/tithe', label: 'Tithe', icon: Heart },
    { path: '/wisdom', label: 'Wisdom', icon: BookOpen },
    { path: '/taxes', label: 'Taxes', icon: Calculator },
    { path: '/security', label: 'Security', icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-ancient-gold/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center shadow-lg group-hover:shadow-yellow-400/25 transition-all duration-300">
              <span className="text-black font-bold text-sm font-mono">₿</span>
            </div>
            <span className="font-mono text-yellow-400 text-xl font-bold hidden sm:block tracking-tight">
              Bible.fi
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`
                    flex items-center gap-1 whitespace-nowrap
                    ${isActive(item.path) 
                      ? 'bg-ancient-gold text-background hover:bg-ancient-gold/90' 
                      : 'text-foreground/80 hover:text-ancient-gold hover:bg-ancient-gold/10'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs bg-scripture text-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>

          {/* Wallet & Sound Toggle */}
          <div className="flex items-center gap-2">
            <WalletButton variant="outline" size="sm" />
            <SoundToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
