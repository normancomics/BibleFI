
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { Wallet, ArrowRight } from "lucide-react";
import FixedFarcasterConnect from "@/components/farcaster/FixedFarcasterConnect";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface UniversalWalletConnectProps {
  onConnect?: (provider: string, address: string) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  buttonClassName?: string;
}

const UniversalWalletConnect: React.FC<UniversalWalletConnectProps> = ({
  onConnect,
  buttonText = "Connect Wallet",
  buttonVariant = "default",
  buttonClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();
  const { playSound } = useSound();

  const walletOptions: WalletOption[] = [
    {
      id: "farcaster",
      name: "Farcaster / Warpcast",
      icon: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png",
      description: "Connect with your Farcaster account",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
      description: "Coinbase's self-custody wallet",
    },
    {
      id: "rainbow",
      name: "Rainbow Wallet",
      icon: "https://rainbow.me/assets/rainbow-logo.png",
      description: "Fun, simple & secure crypto wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect (Reown)",
      icon: "https://walletconnect.com/meta/favicon.ico",
      description: "Connect any compatible wallet",
    },
  ];

  const handleWalletConnect = async (walletId: string) => {
    if (walletId === 'farcaster') {
      // Farcaster connection is handled by its own component
      return;
    }

    playSound("select");
    setConnecting(walletId);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock address for crypto wallets
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      toast({
        title: "Connected Successfully",
        description: `Connected to ${walletOptions.find(w => w.id === walletId)?.name}`,
      });
      
      if (onConnect) {
        onConnect(walletId, mockAddress);
      }
      
      setOpen(false);
      playSound("success");
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
      playSound("error");
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant as any} 
          className={`${buttonClassName} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0`}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[420px] bg-black/95 border border-ancient-gold/30">
        <DialogHeader>
          <DialogTitle className="text-ancient-gold">Connect to Bible.fi</DialogTitle>
          <DialogDescription className="text-white/70">
            Choose your wallet to connect and start your biblical finance journey
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {walletOptions.map((wallet) => (
            <Card 
              key={wallet.id} 
              className="cursor-pointer transition-all duration-200 bg-purple-900/20 border border-ancient-gold/20 hover:border-ancient-gold/40 hover:bg-purple-800/30"
              onClick={() => wallet.id === 'farcaster' ? null : handleWalletConnect(wallet.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded" />
                    <div>
                      <span className="font-medium text-white">{wallet.name}</span>
                      <p className="text-sm text-white/60">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {wallet.id === 'farcaster' ? (
                      <FixedFarcasterConnect size="sm" />
                    ) : (
                      <>
                        {connecting === wallet.id ? (
                          <div className="w-5 h-5 border-2 border-ancient-gold border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ArrowRight className="h-4 w-4 text-ancient-gold" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-xs text-white/50 border-t border-ancient-gold/20 pt-4">
          By connecting, you agree to Bible.fi's Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalWalletConnect;
