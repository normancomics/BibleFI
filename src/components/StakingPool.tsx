
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowUpRight, Info } from "lucide-react";
import PixelButton from "./PixelButton";
import ScriptureCard from "./ScriptureCard";
import StakingTransparency from "./StakingTransparency";
import { BibleVerse, getRandomVerse } from "@/data/bibleVerses";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import StakingHeader from "./staking/StakingHeader";
import StakingDetails from "./staking/StakingDetails";
import StakingForm from "./staking/StakingForm";
import RiskBadge from "./staking/RiskBadge";
import WalletModal from "./staking/WalletModal";

interface StakingPoolProps {
  title: string;
  apy: number;
  description: string;
  verse?: BibleVerse;
  lockPeriod: string;
  riskLevel?: "low" | "medium" | "high";
  biblicalPrinciple?: string;
  returnsMechanism?: string;
  showTransparency?: boolean;
  supportedTokens?: string[];
  // New props from the StakingPage component
  name?: string;
  tvl?: number;
  assets?: string[];
  duration?: number;
  risk?: string;
}

const StakingPool: React.FC<StakingPoolProps> = ({
  title,
  name, // Fallback for name prop
  apy,
  description,
  verse,
  lockPeriod,
  riskLevel = "low",
  risk, // Fallback for risk prop
  biblicalPrinciple = "Careful stewardship of resources",
  returnsMechanism = "Interest from lending to verified projects",
  showTransparency = false,
  supportedTokens = [],
  assets = [], // Fallback for assets prop
  tvl, // Optional TVL value
  duration, // Optional duration value
}) => {
  const actualTitle = title || name || "Staking Pool";
  const actualRiskLevel = riskLevel || (risk as "low" | "medium" | "high") || "low";
  const actualSupportedTokens = supportedTokens.length > 0 ? supportedTokens : assets;
  const actualLockPeriod = lockPeriod || (duration ? `${duration} days` : "30 days");
  
  const safeVerse = verse || getRandomVerse();
  const { playSound } = useSound();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showFullTransparency, setShowFullTransparency] = useState(showTransparency);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showStakingForm, setShowStakingForm] = useState(false);
  
  const handleStake = () => {
    if (!showStakingForm) {
      setShowStakingForm(true);
      playSound("select");
      return;
    }
  };

  const handleStakeSubmit = (amount: string, token: string) => {
    toast({
      title: "Preparing to stake",
      description: `Staking ${amount} ${token} in the ${actualTitle}`,
    });
    
    setIsWalletOpen(true);
  };
  
  const handleWalletConnected = (address: string) => {
    toast({
      title: "Wallet Connected",
      description: `Connected with ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    });
    
    // Simulate successful staking after wallet connection
    setTimeout(() => {
      toast({
        title: "Staking Successful",
        description: `Your staking transaction is now growing with biblical wisdom`,
        variant: "default",
      });
      
      // Reset form
      setShowStakingForm(false);
      setIsWalletOpen(false);
      playSound("success");
    }, 1500);
  };
  
  const handleLearn = () => {
    playSound("scroll");
    setShowDetails(!showDetails);
  };

  const handleShowTransparency = () => {
    setShowFullTransparency(true);
  };
  
  return (
    <Card className="pixel-card overflow-hidden">
      <StakingHeader title={actualTitle} apy={apy} />
      
      <p className="mb-4 px-4">{description}</p>
      
      <div className="flex items-center mb-4 text-sm text-muted-foreground px-4">
        <BookOpen size={16} className="mr-1" />
        <span>Lock Period: {actualLockPeriod}</span>
      </div>
      
      <div className="flex items-center mb-4 px-4">
        <RiskBadge riskLevel={actualRiskLevel} />
        
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

      {actualSupportedTokens && actualSupportedTokens.length > 0 && (
        <div className="px-4 mb-4">
          <div className="text-xs text-muted-foreground">
            Supported tokens: {actualSupportedTokens.join(", ")}
          </div>
        </div>
      )}

      {tvl && (
        <div className="px-4 mb-4">
          <div className="text-xs text-muted-foreground">
            Total Value Locked: ${tvl.toLocaleString()}
          </div>
        </div>
      )}
      
      <StakingDetails 
        returnsMechanism={returnsMechanism}
        biblicalPrinciple={biblicalPrinciple}
        onShowTransparency={handleShowTransparency}
        visible={showDetails}
      />

      {showFullTransparency && <StakingTransparency />}
      
      <StakingForm
        supportedTokens={actualSupportedTokens} 
        onStakeSubmit={handleStakeSubmit}
        isFormVisible={showStakingForm}
      />
      
      <div className="px-4 mb-4">
        <ScriptureCard verse={safeVerse} />
      </div>
      
      <div className="flex space-x-2 px-4 pb-4">
        <PixelButton className="flex-1 flex items-center justify-center" onClick={handleStake}>
          {!showStakingForm ? "Stake" : "Show Details"}
        </PixelButton>
        <PixelButton variant="outline" className="flex items-center" onClick={handleLearn}>
          Learn <ArrowUpRight size={16} className="ml-1" />
        </PixelButton>
      </div>
      
      <WalletModal 
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onWalletConnected={handleWalletConnected}
      />
    </Card>
  );
};

export default StakingPool;
