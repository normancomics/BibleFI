import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import bibleFiLogo from '@/assets/biblefi-nav-icon.png';
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
  Wheat,
  Trophy
} from 'lucide-react';
import SoundToggle from '@/components/SoundToggle';
import WalletButton from '@/components/wallet/WalletButton';
import WisdomScoreNavbar from '@/components/ui/WisdomScoreNavbar';
import NetworkStatusIndicator from '@/components/wallet/NetworkStatusIndicator';
import SuperfluidStatusPill from '@/components/SuperfluidStatusPill';
import { supabase } from '@/integrations/supabase/client';

const NavBar: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsAdmin(false); return; }
      try {
        const { data } = await supabase.functions.invoke('check-admin-role', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        setIsAdmin(!!data?.isAdmin);
      } catch { setIsAdmin(false); }
    };
    checkAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAdmin());
    return () => subscription.unsubscribe();
  }, []);
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/defi', label: 'DeFi', icon: TrendingUp },
    { path: '/swap', label: 'Swap', icon: TrendingUp, badge: 'NEW' },
    { path: '/staking', label: 'Staking', icon: Coins },
    { path: '/defi-opportunities', label: 'Opportunities', icon: TrendingUp, badge: 'LIVE' },
    { path: '/farming', label: 'Farming', icon: Wheat },
    { path: '/token', label: '$BIBLEFI', icon: Coins, badge: 'NEW' },
    { path: '/tithe', label: 'Tithe', icon: Heart },
    { path: '/zk-monitor', label: 'ZK Privacy', icon: Shield, badge: 'ZK' },
    { path: '/wisdom', label: 'Wisdom', icon: BookOpen },
    { path: '/biblical-finance', label: 'Scripture', icon: BookOpen, badge: '100%' },
    { path: '/taxes', label: 'Taxes', icon: Calculator },
    { path: '/live-data', label: 'Live Data', icon: TrendingUp, badge: 'LIVE' },
    { path: '/analytics', label: 'Analytics', icon: Shield, badge: 'AI' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Settings, badge: 'DEV' }] : []),
    { path: '/builder-score', label: 'Builder', icon: Trophy, badge: 'REP' },
    { path: '/security', label: 'Security', icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-ancient-gold/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={bibleFiLogo}
                alt="BibleFi Logo" 
                className="w-10 h-10 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/50"
              />
            </div>
            <span className="font-mono text-lg font-bold hidden sm:block tracking-wider text-ancient-gold hover:text-scripture transition-colors duration-300">
              BibleFi
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

          {/* Network Status, Wisdom Score, Wallet & Sound Toggle */}
          <div className="flex items-center gap-2">
            <NetworkStatusIndicator showLabel className="hidden sm:flex" />
            <NetworkStatusIndicator className="sm:hidden" />
            <WisdomScoreNavbar />
            <WalletButton variant="outline" size="sm" />
            <SoundToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
