import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMobile } from "@/hooks/use-mobile";
import PixelButton from "@/components/PixelButton";
import { Home, Book, Church, Coins, Wallet, FileText, BookOpen } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";

export default function NavBar() {
  const { isMobile } = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { playSound } = useSound();
  
  const menuItems = [
    { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
    { label: "Wisdom", href: "/wisdom", icon: <Book className="h-4 w-4" /> },
    { label: "Tithe", href: "/tithe", icon: <Church className="h-4 w-4" /> },
    { label: "DeFi", href: "/defi", icon: <Coins className="h-4 w-4" /> },
    { label: "Biblical DeFi", href: "/biblical-defi", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Staking", href: "/staking", icon: <Wallet className="h-4 w-4" /> },
    { label: "Taxes", href: "/taxes", icon: <FileText className="h-4 w-4" /> }
  ];

  return (
    <nav className="bg-black/80 border-b border-ancient-gold/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-game text-ancient-gold">
          BIBLE.FI
        </Link>
        
        {isMobile ? (
          <button 
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              playSound("select");
            }}
            className="text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link key={item.label} to={item.href} className="text-white hover:text-ancient-gold flex items-center space-x-2">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <PixelButton 
              href="https://github.com/username/biblefi"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
            >
              GitHub
            </PixelButton>
          </div>
        )}
      </div>
      
      {isMobile && isMenuOpen && (
        <div className="bg-black/80 py-2 px-4">
          {menuItems.map((item) => (
            <Link key={item.label} to={item.href} className="block text-white py-2 hover:text-ancient-gold">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
