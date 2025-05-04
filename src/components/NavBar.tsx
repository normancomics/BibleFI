
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Coins, Church, BarChart } from "lucide-react";
import PixelIcon from "./PixelIcon";
import { useSound } from "@/contexts/SoundContext";

const NavBar: React.FC = () => {
  const { playSound } = useSound();
  const location = useLocation();

  const handleNavClick = (soundType: "coin" | "select" | "scroll") => {
    playSound(soundType);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-scripture text-white p-2 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center group" onClick={() => handleNavClick("coin")}>
          <PixelIcon 
            src="/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png" 
            alt="BIBLE.Fi Logo" 
            size={40} 
            spin={false}
            glow={true}
            className="mr-2 transition-all duration-300 group-hover:animate-pulse-glow"
          />
          <h1 className="text-2xl font-scroll transition-all duration-300 gold-gradient-text group-hover:text-glow">
            BIBLE.FI
          </h1>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link 
            to="/" 
            className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/") ? "bg-base-blue" : "hover:bg-scripture-dark"}`} 
            onClick={() => handleNavClick("select")}
          >
            <Home size={20} />
            <span className="text-xs">Home</span>
          </Link>
          <Link 
            to="/wisdom" 
            className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/wisdom") ? "bg-base-blue" : "hover:bg-scripture-dark"}`}
            onClick={() => handleNavClick("scroll")}
          >
            <BookOpen size={20} />
            <span className="text-xs">Wisdom</span>
          </Link>
          <Link 
            to="/staking" 
            className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/staking") ? "bg-base-blue" : "hover:bg-scripture-dark"}`}
            onClick={() => handleNavClick("coin")}
          >
            <Coins size={20} />
            <span className="text-xs">Staking</span>
          </Link>
          <Link 
            to="/tithe" 
            className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/tithe") ? "bg-base-blue" : "hover:bg-scripture-dark"}`}
            onClick={() => handleNavClick("scroll")}
          >
            <Church size={20} />
            <span className="text-xs">Tithe</span>
          </Link>
          <Link 
            to="/taxes" 
            className={`flex flex-col items-center px-2 py-1 rounded ${isActive("/taxes") ? "bg-base-blue" : "hover:bg-scripture-dark"}`}
            onClick={() => handleNavClick("select")}
          >
            <BarChart size={20} />
            <span className="text-xs">Taxes</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
