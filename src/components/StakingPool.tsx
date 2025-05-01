
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowUpRight, Info, Shield, ChartBar } from "lucide-react";
import PixelButton from "./PixelButton";
import ScriptureCard from "./ScriptureCard";
import { BibleVerse, getRandomVerse } from "@/data/bibleVerses";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";

interface StakingPoolProps {
  title: string;
  apy: number;
  description: string;
  verse?: BibleVerse;
  lockPeriod: string;
  riskLevel?: "low" | "medium" | "high";
  biblicalPrinciple?: string;
  returnsMechanism?: string;
}

const StakingPool: React.FC<StakingPoolProps> = ({
  title,
  apy,
  description,
  verse,
  lockPeriod,
  riskLevel = "low",
  biblicalPrinciple = "Careful stewardship of resources",
  returnsMechanism = "Interest from lending to verified projects"
}) => {
  // If verse is undefined, get a random verse
  const safeVerse = verse || getRandomVerse();
  const { playSound } = useSound();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  const getRiskColor = () => {
    switch(riskLevel) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-green-100 text-green-800";
    }
  };
  
  const handleStake = () => {
    playSound("coin");
    toast({
      title: "Preparing to stake",
      description: "Connect your wallet to continue your stewardship journey",
    });
  };
  
  const handleLearn = () => {
    playSound("scroll");
    setShowDetails(!showDetails);
  };
  
  return (
    <Card className="pixel-card overflow-hidden">
      <div className="relative px-4 py-2 mb-4 bg-gradient-to-r from-pixel-blue/60 via-pixel-blue to-pixel-blue/60 border-2 border-ancient-gold">
        <div className="absolute inset-0 bg-black/10 opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ancient-gold"></div>
        <div className="absolute -left-1 -top-1 w-2 h-2 border-t border-l border-ancient-gold"></div>
        <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-ancient-gold"></div>
        <div className="absolute -left-1 -bottom-1 w-2 h-2 border-b border-l border-ancient-gold"></div>
        <div className="absolute -right-1 -bottom-1 w-2 h-2 border-b border-r border-ancient-gold"></div>
        <div className="flex justify-between items-center relative z-10">
          <h3 className="text-xl font-scroll text-white drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(255,215,0,0.7)' }}>
            {title}
          </h3>
          <div className="bg-ancient-gold text-black px-3 py-1 rounded-md font-bold drop-shadow-lg">
            {apy}% APY
          </div>
        </div>
      </div>
      
      <p className="mb-4">{description}</p>
      
      <div className="flex items-center mb-4 text-sm text-muted-foreground">
        <BookOpen size={16} className="mr-1" />
        <span>Lock Period: {lockPeriod}</span>
      </div>
      
      <div className="flex items-center mb-4">
        <div className={`text-xs px-2 py-1 rounded-md ${getRiskColor()} flex items-center mr-2`}>
          <Shield size={12} className="mr-1" /> {riskLevel.toUpperCase()} RISK
        </div>
        
        <button 
          className="text-xs flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => {
            setShowDetails(!showDetails);
            playSound("select");
          }}
        >
          <Info size={12} className="mr-1" /> How returns are generated
        </button>
      </div>
      
      {showDetails && (
        <div className="bg-black/10 p-3 rounded-md mb-4 text-sm">
          <div className="flex items-start mb-2">
            <ChartBar size={16} className="mr-2 flex-shrink-0 mt-1 text-scripture" />
            <div>
              <strong>Returns Mechanism:</strong> {returnsMechanism}
            </div>
          </div>
          <div className="flex items-start">
            <BookOpen size={16} className="mr-2 flex-shrink-0 mt-1 text-scripture" />
            <div>
              <strong>Biblical Principle:</strong> {biblicalPrinciple}
            </div>
          </div>
        </div>
      )}
      
      <ScriptureCard verse={safeVerse} className="mb-4" />
      
      <div className="flex space-x-2">
        <PixelButton className="flex-1" onClick={handleStake}>
          Stake
        </PixelButton>
        <PixelButton variant="outline" className="flex items-center" onClick={handleLearn}>
          Learn <ArrowUpRight size={16} className="ml-1" />
        </PixelButton>
      </div>
    </Card>
  );
};

export default StakingPool;
