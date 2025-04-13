
import React from "react";
import { Link } from "react-router-dom";
import { Home, BookOpen, Coins, Church, BarChart } from "lucide-react";
import PixelIcon from "./PixelIcon";

const NavBar: React.FC = () => {
  return (
    <header className="bg-scripture text-white p-2 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <PixelIcon src="/coin-pixel.png" alt="Bible.Fi Logo" size={40} className="animate-coin-spin mr-2" />
          <h1 className="text-2xl font-scroll">Bible.Fi</h1>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link to="/" className="flex flex-col items-center px-2 py-1 hover:bg-scripture-dark rounded">
            <Home size={20} />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/wisdom" className="flex flex-col items-center px-2 py-1 hover:bg-scripture-dark rounded">
            <BookOpen size={20} />
            <span className="text-xs">Wisdom</span>
          </Link>
          <Link to="/staking" className="flex flex-col items-center px-2 py-1 hover:bg-scripture-dark rounded">
            <Coins size={20} />
            <span className="text-xs">Staking</span>
          </Link>
          <Link to="/tithe" className="flex flex-col items-center px-2 py-1 hover:bg-scripture-dark rounded">
            <Church size={20} />
            <span className="text-xs">Tithe</span>
          </Link>
          <Link to="/taxes" className="flex flex-col items-center px-2 py-1 hover:bg-scripture-dark rounded">
            <BarChart size={20} />
            <span className="text-xs">Taxes</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
