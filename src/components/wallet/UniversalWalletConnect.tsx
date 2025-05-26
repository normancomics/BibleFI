
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { Wallet, ExternalLink, ArrowRight } from "lucide-react";
import FarcasterConnect from "@/farcaster/FarcasterConnect";
import { useFarcasterAuth } from "@/farcaster/auth";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  type: 'crypto' | 'social';
  description: string;
  available: boolean;
  comingSoon?: boolean;
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
  const { user } = useFarcasterAuth();

  const walletOptions: WalletOption[] = [
    {
      id: "farcaster",
      name: "Warpcast",
      icon: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png",
      type: "social",
      description: "Connect with your Farcaster account",
      available: true,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
      type: "crypto",
      description: "Coinbase's self-custody wallet",
      available: true,
    },
    {
      id: "rainbow",
      name: "Rainbow",
      icon: "https://rainbow.me/assets/rainbow-logo.png",
      type: "crypto", 
      description: "Fun, simple & secure crypto wallet",
      available: true,
    },
    {
      id: "walletconnect",
      name: "Reown (WalletConnect)",
      icon: "https://walletconnect.com/meta/favicon.ico",
      type: "crypto",
      description: "Connect any compatible wallet",
      available: true,
    },
    {
      id: "github",
      name: "GitHub",
      icon: "https://github.githubassets.com/favicons/favicon.png",
      type: "social",
      description: "Sign in with GitHub account",
      available: false,
      comingSoon: true,
    },
    {
      id: "google",
      name: "Google",
      icon: "https://www.google.com/favicon.ico",
      type: "social",
      description: "Sign in with Google account",
      available: false,
      comingSoon: true,
    },
    {
      id: "apple",
      name: "Apple",
      icon: "https://appleid.apple.com/favicon.ico",
      type: "social",
      description: "Sign in with Apple ID",
      available: false,
      comingSoon: true,
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: "https://abs.twimg.com/favicons/twitter.2.ico",
      type: "social",
      description: "Sign in with X account",
      available: false,
      comingSoon: true,
    }
  ];

  const handleWalletConnect = async (walletId: string) => {
    if (!walletOptions.find(w => w.id === walletId)?.available) {
      toast({
        title: "Coming Soon",
        description: "This authentication method will be available soon!",
      });
      return;
    }

    playSound("select");
    setConnecting(walletId);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock address for crypto wallets
      const mockAddress = walletId !== 'farcaster' 
        ? `0x${Math.random().toString(16).substr(2, 40)}`
        : `fid:${Math.floor(Math.random() * 10000)}`;
      
      toast({
        title: "Connected Successfully",
        description: `Connected to ${walletOptions.find(w => w.id === walletId)?.name}`,
      });
      
      if (onConnect) {
        onConnect(walletId, mockAddress);
      }
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const cryptoWallets = walletOptions.filter(w => w.type === 'crypto');
  const socialWallets = walletOptions.filter(w => w.type === 'social');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant as any} className={`${buttonClassName} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0`}>
          <Wallet className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[520px] bg-black/95 border border-ancient-gold/30">
        <DialogHeader>
          <DialogTitle className="text-ancient-gold">Connect to Bible.fi</DialogTitle>
          <DialogDescription className="text-white/70">
            Choose your preferred way to connect and start your biblical finance journey
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Social Login Section */}
          <div>
            <h3 className="text-sm font-medium text-ancient-gold mb-3">Social Login</h3>
            <div className="space-y-2">
              {socialWallets.map((wallet) => (
                <Card 
                  key={wallet.id} 
                  className={`cursor-pointer transition-all duration-200 bg-purple-900/20 border border-ancient-gold/20 hover:border-ancient-gold/40 hover:bg-purple-800/30 ${
                    !wallet.available ? 'opacity-60' : ''
                  }`}
                  onClick={() => wallet.id === 'farcaster' ? null : handleWalletConnect(wallet.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{wallet.name}</span>
                            {wallet.comingSoon && (
                              <span className="text-xs bg-ancient-gold/20 text-ancient-gold px-2 py-1 rounded">
                                Soon
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/60">{wallet.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {wallet.id === 'farcaster' ? (
                          <FarcasterConnect size="sm" />
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
          </div>

          {/* Crypto Wallets Section */}
          <div>
            <h3 className="text-sm font-medium text-ancient-gold mb-3">Crypto Wallets</h3>
            <div className="space-y-2">
              {cryptoWallets.map((wallet) => (
                <Card 
                  key={wallet.id} 
                  className="cursor-pointer transition-all duration-200 bg-purple-900/20 border border-ancient-gold/20 hover:border-ancient-gold/40 hover:bg-purple-800/30"
                  onClick={() => handleWalletConnect(wallet.id)}
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
                        {connecting === wallet.id ? (
                          <div className="w-5 h-5 border-2 border-ancient-gold border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ArrowRight className="h-4 w-4 text-ancient-gold" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-white/50 border-t border-ancient-gold/20 pt-4">
          By connecting, you agree to Bible.fi's Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalWalletConnect;
