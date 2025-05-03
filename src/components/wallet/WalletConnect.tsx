
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

const WalletConnect: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [connecting, setConnecting] = useState<WalletType | null>(null);
  const [connected, setConnected] = useState<WalletType | null>(null);
  
  // Available wallet options
  const wallets: WalletOption[] = [
    {
      id: "farcaster",
      name: "Farcaster Wallet",
      logo: "/placeholder.svg", // Replace with actual Farcaster logo
      description: "Connect with Farcaster Wallet",
      available: true,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      logo: "/placeholder.svg", // Replace with actual Coinbase logo
      description: "Connect with Coinbase Wallet",
      available: true,
    },
    {
      id: "rainbow",
      name: "Rainbow Wallet",
      logo: "/placeholder.svg", // Replace with actual Rainbow logo
      description: "Connect with Rainbow Wallet",
      available: true,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      logo: "/placeholder.svg", // Replace with actual WalletConnect logo
      description: "Connect any compatible wallet",
      available: true,
    },
  ];
  
  const handleConnect = async (wallet: WalletType) => {
    playSound("powerup");
    setConnecting(wallet);
    
    // Simulate connection
    setTimeout(() => {
      setConnecting(null);
      setConnected(wallet);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${wallets.find(w => w.id === wallet)?.name}`,
      });
    }, 1500);
    
    // In a real implementation, this would integrate with the wallet's API
    // For example with WalletConnect, Coinbase SDK, etc.
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
    <Card className="pixel-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-scroll">Connect Wallet</h2>
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
                className={`flex items-center justify-between p-3 border rounded-md hover:bg-scripture/10 cursor-pointer ${
                  wallet.id === connecting ? "bg-scripture/20 border-scripture" : "bg-black/20 border-ancient-gold/30"
                }`}
                onClick={() => wallet.available && handleConnect(wallet.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-scripture/20 flex items-center justify-center mr-3">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-pixel">{wallet.name}</h3>
                    <p className="text-xs text-white/60">{wallet.description}</p>
                  </div>
                </div>
                <div>
                  {connecting === wallet.id ? (
                    <div className="w-5 h-5 border-2 border-scripture border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PixelButton 
                      size="sm" 
                      disabled={!wallet.available}
                      baseStyle={true} // Use base chain style instead of default
                      className="bg-base-blue hover:bg-base-blue/80"
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
            <div className="bg-base-blue/20 border border-base-blue/50 p-4 rounded-md">
              <h3 className="flex items-center text-base-blue font-pixel mb-2">
                <CheckCircle2 size={16} className="mr-2" />
                {wallets.find(w => w.id === connected)?.name} Connected
              </h3>
              <p className="text-sm">
                Your wallet is now connected to Bible.fi. You can now tithe, stake, and participate in other financial activities.
              </p>
            </div>
            
            <PixelButton onClick={handleDisconnect} variant="outline" className="w-full">
              Disconnect Wallet
            </PixelButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
