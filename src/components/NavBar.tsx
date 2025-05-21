
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Coins, Church, BarChart, ExternalLink } from "lucide-react";
import PixelIcon from "./PixelIcon";
import { useSound } from "@/contexts/SoundContext";
import FarcasterConnect from "@/components/farcaster/FarcasterConnect";
import { APP_CONFIG } from "@/farcaster/config";

const NavBar: React.FC = () => {
  const { playSound } = useSound();
  const location = useLocation();

  const handleNavClick = (soundType: "coin" | "select" | "scroll") => {
    playSound(soundType);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleBaseExplorerClick = () => {
    playSound("select");
    window.open(APP_CONFIG.baseChain.explorerUrl, "_blank");
  };

  return (
    <header className="bg-base-blue text-white p-2 sticky top-0 z-10">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center group" onClick={() => handleNavClick("coin")}>
            <div className="text-2xl font-scroll tracking-tight font-bold text-white group-hover:opacity-90 transition-opacity mr-2">
              <span className="text-scripture-light">BIBLE</span>.FI
            </div>
          </Link>
          
          <div 
            className="ml-4 flex items-center px-2 py-1 bg-black/20 rounded-full cursor-pointer hover:bg-black/40 transition-colors"
            onClick={handleBaseExplorerClick}
          >
            <img
              src="/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png"
              alt="Base Chain"
              className="h-4 mr-1"
            />
            <span className="text-xs">Base Chain</span>
            <ExternalLink size={10} className="ml-1 opacity-70" />
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0">
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              to="/" 
              className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/") ? "bg-scripture" : "hover:bg-base-dark"}`} 
              onClick={() => handleNavClick("select")}
            >
              <Home size={20} />
              <span className="text-xs font-scroll">Home</span>
            </Link>
            <Link 
              to="/wisdom" 
              className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/wisdom") ? "bg-scripture" : "hover:bg-base-dark"}`}
              onClick={() => handleNavClick("scroll")}
            >
              <BookOpen size={20} />
              <span className="text-xs font-scroll">Wisdom</span>
            </Link>
            <Link 
              to="/staking" 
              className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/staking") ? "bg-scripture" : "hover:bg-base-dark"}`}
              onClick={() => handleNavClick("coin")}
            >
              <Coins size={20} />
              <span className="text-xs font-scroll">Staking</span>
            </Link>
            <Link 
              to="/tithe" 
              className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/tithe") ? "bg-scripture" : "hover:bg-base-dark"}`}
              onClick={() => handleNavClick("scroll")}
            >
              <Church size={20} />
              <span className="text-xs font-scroll">Tithe</span>
            </Link>
            <Link 
              to="/taxes" 
              className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/taxes") ? "bg-scripture" : "hover:bg-base-dark"}`}
              onClick={() => handleNavClick("select")}
            >
              <BarChart size={20} />
              <span className="text-xs font-scroll">Taxes</span>
            </Link>
          </nav>
          
          <div className="hidden sm:block ml-4">
            <FarcasterConnect size="sm" />
          </div>
        </div>
      </div>
      
      <div className="sm:hidden flex justify-center mt-2 px-2">
        <FarcasterConnect size="sm" className="w-full" />
      </div>
    </header>
  );
};

export default NavBar;
