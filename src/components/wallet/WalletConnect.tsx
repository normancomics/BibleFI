
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PixelButton from "@/components/PixelButton";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { CheckCircle2, Wallet } from "lucide-react";

// Types of supported wallets
type WalletType = "farcaster" | "coinbase" | "rainbow" | "walletconnect";

interface WalletOption {
  id: WalletType;
  name: string;
  logo: string;
  description: string;
  available: boolean;
}

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onCancel?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onCancel }) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [connecting, setConnecting] = useState<WalletType | null>(null);
  const [connected, setConnected] = useState<WalletType | null>(null);
  
  // Available wallet options
  const wallets: WalletOption[] = [
    {
      id: "farcaster",
      name: "Farcaster Wallet",
      logo: "/placeholder.svg", 
      description: "Connect with Farcaster Wallet",
      available: true,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      logo: "/placeholder.svg",
      description: "Connect with Coinbase Wallet",
      available: true,
    },
    {
      id: "rainbow",
      name: "Rainbow Wallet",
      logo: "/placeholder.svg",
      description: "Connect with Rainbow Wallet",
      available: true,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      logo: "/placeholder.svg",
      description: "Connect any compatible wallet",
      available: true,
    },
  ];
  
  const handleConnect = async (wallet: WalletType) => {
    playSound("powerup");
    setConnecting(wallet);
    
    // Generate a mock address for demonstration
    const mockAddress = "0x" + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    // Simulate connection
    setTimeout(() => {
      setConnecting(null);
      setConnected(wallet);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${wallets.find(w => w.id === wallet)?.name}`,
      });
      
      // Call the onConnect callback if provided
      if (onConnect) {
        onConnect(mockAddress);
      }
    }, 1500);
  };
  
  const handleDisconnect = () => {
    playSound("select");
    setConnected(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <Card className="pixel-card bg-purple-900/30 border border-ancient-gold/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-scroll text-ancient-gold">Connect Wallet</h2>
          {connected && (
            <div className="flex items-center text-green-500">
              <CheckCircle2 size={16} className="mr-1" />
              <span className="text-sm">Connected</span>
            </div>
          )}
        </div>
        
        {!connected ? (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div 
                key={wallet.id}
                className={`flex items-center justify-between p-3 border rounded-md hover:bg-purple-800/40 cursor-pointer ${
                  wallet.id === connecting ? "bg-purple-800/50 border-ancient-gold/70" : "bg-purple-900/50 border-ancient-gold/30"
                }`}
                onClick={() => wallet.available && handleConnect(wallet.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-800/50 flex items-center justify-center mr-3">
                    <Wallet size={20} className="text-ancient-gold" />
                  </div>
                  <div>
                    <h3 className="font-scroll text-ancient-gold">{wallet.name}</h3>
                    <p className="text-xs text-white/60">{wallet.description}</p>
                  </div>
                </div>
                <div>
                  {connecting === wallet.id ? (
                    <div className="w-5 h-5 border-2 border-ancient-gold border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PixelButton 
                      size="sm" 
                      disabled={!wallet.available}
                      farcasterStyle 
                    >
                      CONNECT
                    </PixelButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-800/20 border border-ancient-gold/50 p-4 rounded-md">
              <h3 className="flex items-center text-ancient-gold font-scroll mb-2">
                <CheckCircle2 size={16} className="mr-2" />
                {wallets.find(w => w.id === connected)?.name} Connected
              </h3>
              <p className="text-sm text-white/90">
                Your wallet is now connected to Bible.fi. You can now tithe, stake, and participate in other financial activities.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <PixelButton onClick={handleDisconnect} variant="outline" className="flex-1" farcasterStyle>
                Disconnect Wallet
              </PixelButton>
              
              {onCancel && (
                <PixelButton onClick={onCancel} variant="outline" className="flex-1" farcasterStyle>
                  Cancel
                </PixelButton>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
