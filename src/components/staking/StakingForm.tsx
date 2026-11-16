
import React from "react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import PixelButton from "@/components/PixelButton";
import { Wallet } from "lucide-react";
import { useWalletAssets, fmtBalance } from "@/hooks/useWalletAssets";
import { projectStakingRewards } from "@/lib/defiPreview";

interface StakingFormProps {
  supportedTokens?: string[];
  onStakeSubmit?: (amount: string, token: string) => void;
  isFormVisible?: boolean;
  apy?: number;
  lockDays?: number;
}

const StakingForm: React.FC<StakingFormProps> = ({ 
  supportedTokens = ["USDC", "DAI", "ETH"], 
  onStakeSubmit = () => {},
  isFormVisible = false,
  apy = 0,
  lockDays = 30,
}) => {
  const wallet = useWalletAssets();
  const [stakeAmount, setStakeAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState(supportedTokens[0] || "USDC");
  const { playSound } = useSound();
  const { toast } = useToast();

  const live = wallet.get(selectedToken);
  const preview = projectStakingRewards(Number(stakeAmount) || 0, apy, lockDays);

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
    
    if (live && live.balance !== null && Number(stakeAmount) > parseFloat(live.balance)) {
      toast({ title: "Not enough " + selectedToken, description: "Count the cost first — Luke 14:28", variant: "destructive" });
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
      <div className="text-xs text-muted-foreground mb-3 space-y-1">
        <div className="flex justify-between">
          <span>
            {wallet.isConnected
              ? <>Wallet: {fmtBalance(live?.balance ?? null)} {selectedToken}{wallet.isTestnet && " (test)"}</>
              : "Connect wallet to see your balance"}
          </span>
          {wallet.isConnected && live?.balance && parseFloat(live.balance) > 0 && (
            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => setStakeAmount(live.balance as string)}>MAX</button>
          )}
        </div>
        {preview && (
          <div className="rounded border border-border p-2 space-y-0.5">
            <div className="flex justify-between"><span>Est. rewards over {lockDays} days ({apy}% APY)</span><span>{preview.grossReward.toFixed(4)} {selectedToken}</span></div>
            <div className="flex justify-between"><span>10% tithe on rewards</span><span>{preview.tithe.toFixed(4)} {selectedToken}</span></div>
            <div className="flex justify-between font-semibold"><span>You keep after lock</span><span>{preview.endBalance.toFixed(4)} {selectedToken}</span></div>
            <div className="opacity-70">Estimate only — rates can change.</div>
          </div>
        )}
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
