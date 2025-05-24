import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, Coins, Church, Receipt, Sprout } from "lucide-react";
import WalletConnect from "@/components/wallet/WalletConnect";
import SoundToggle from "@/components/SoundToggle";

const NavBar: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      
      setVisible(isVisible);
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md bg-black/50 border-b border-gray-800 shadow-lg ${visible ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300`}>
      <div className="container flex h-14 mx-auto items-center text-sm">
        <Link to="/" className="flex items-center gap-2 font-bold text-ancient-gold hover:opacity-80 mr-8">
          <img src="/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png" alt="Bible.fi Logo" className="h-8" />
          <span className="font-game tracking-wide text-lg hidden md:inline">BIBLE.FI</span>
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
          <nav className="flex items-center gap-1 md:gap-2">
            <NavLink to="/wisdom" className="nav-link px-2 md:px-3 py-2">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Wisdom</span>
            </NavLink>
            <NavLink to="/defi" className="nav-link px-2 md:px-3 py-2">
              <Coins className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">DeFi</span>
            </NavLink>
            <NavLink to="/farming" className="nav-link px-2 md:px-3 py-2">
              <Sprout className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Farming</span>
            </NavLink>
            <NavLink to="/tithe" className="nav-link px-2 md:px-3 py-2">
              <Church className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Tithe</span>
            </NavLink>
            <NavLink to="/taxes" className="nav-link px-2 md:px-3 py-2">
              <Receipt className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Taxes</span>
            </NavLink>
          </nav>
          
          <SoundToggle className="ml-2" />
          
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
