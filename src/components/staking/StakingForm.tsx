
import React from "react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import PixelButton from "@/components/PixelButton";
import { Wallet } from "lucide-react";

interface StakingFormProps {
  supportedTokens: string[];
  onStakeSubmit: (amount: string, token: string) => void;
  isFormVisible: boolean;
}

const StakingForm: React.FC<StakingFormProps> = ({ 
  supportedTokens = [], 
  onStakeSubmit,
  isFormVisible
}) => {
  const [stakeAmount, setStakeAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState(supportedTokens[0] || "USDC");
  const { playSound } = useSound();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid staking amount",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    playSound("coin");
    onStakeSubmit(stakeAmount, selectedToken);
  };

  if (!isFormVisible) return null;

  return (
    <div className="px-4 mb-4 border-t border-border pt-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="amount-stake" className="block text-xs mb-1">Amount</label>
          <input
            id="amount-stake"
            type="text"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full border border-input px-3 py-2 rounded text-sm"
            placeholder="0.00"
          />
        </div>
        <div className="w-1/3">
          <label htmlFor="token-stake" className="block text-xs mb-1">Token</label>
          <select
            id="token-stake"
            value={selectedToken}
            onChange={(e) => {
              setSelectedToken(e.target.value);
              playSound("select");
            }}
            className="w-full border border-input px-3 py-2 rounded text-sm"
          >
            {supportedTokens.map((token) => (
              <option key={token} value={token}>{token}</option>
            ))}
          </select>
        </div>
      </div>
      <PixelButton 
        className="w-full flex items-center justify-center" 
        onClick={handleSubmit}
      >
        Confirm Stake<Wallet size={16} className="ml-2" />
      </PixelButton>
    </div>
  );
};

export default StakingForm;
