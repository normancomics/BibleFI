import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, 
  Shield, 
  ExternalLink, 
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Zap,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { GlowingText } from "@/components/ui/tailwind-extensions";
import FixedFarcasterConnect from "@/components/farcaster/FixedFarcasterConnect";

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  recommended?: boolean;
  biblicalConnection?: string;
  verse?: string;
  status: 'available' | 'coming-soon' | 'connected';
}

const biblicalWallets: WalletOption[] = [
  {
    id: "farcaster",
    name: "Farcaster Wallet",
    description: "Native Farcaster integration for seamless social DeFi",
    icon: "/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png",
    features: ["Social Connectivity", "Frame Integration", "Community Features", "Built-in Identity"],
    recommended: true,
    biblicalConnection: "Fellowship",
    verse: "For where two or three gather in my name, there am I with them. - Matthew 18:20",
    status: 'available'
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Secure, user-friendly wallet with fiat on-ramps",
    icon: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png",
    features: ["Easy Onboarding", "Fiat Support", "Mobile App", "Base Chain Native"],
    biblicalConnection: "Faithful Stewardship",
    verse: "Whoever can be trusted with very little can also be trusted with much. - Luke 16:10",
    status: 'available'
  },
  {
    id: "rainbow",
    name: "Rainbow Wallet",
    description: "Beautiful, intuitive wallet with advanced features",
    icon: "/lovable-uploads/450f0ecf-de96-4379-b399-2eeb41f04db9.png",
    features: ["Beautiful UI", "ENS Support", "Portfolio Tracking", "DeFi Integration"],
    biblicalConnection: "God's Covenant",
    verse: "I have set my rainbow in the clouds, and it will be the sign of the covenant. - Genesis 9:13",
    status: 'available'
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Connect to any compatible mobile wallet",
    icon: "/lovable-uploads/69e0702d-fa00-4fcf-96b5-d6057ece1097.png",
    features: ["Universal Compatibility", "QR Code Connection", "Mobile First", "Secure Protocol"],
    biblicalConnection: "Unity in Diversity",
    verse: "Just as a body, though one, has many parts, but all its many parts form one body. - 1 Corinthians 12:12",
    status: 'available'
  },
  {
    id: "metamask",
    name: "MetaMask",
    description: "Popular browser extension wallet",
    icon: "/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png",
    features: ["Browser Extension", "Wide Compatibility", "Established Ecosystem", "Developer Tools"],
    biblicalConnection: "Wisdom in Tools",
    verse: "The simple believe anything, but the prudent give thought to their steps. - Proverbs 14:15",
    status: 'available'
  }
];

interface BiblicalWalletConnectProps {
  onConnect?: (walletId: string, address: string) => void;
  className?: string;
}

const BiblicalWalletConnect: React.FC<BiblicalWalletConnectProps> = ({ 
  onConnect, 
  className = "" 
}) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const handleWalletConnect = async (wallet: WalletOption) => {
    if (wallet.status !== 'available') return;
    
    setIsConnecting(wallet.id);
    playSound("powerup");
    
    toast({
      title: "Biblical Wallet Connection",
      description: `Connecting to ${wallet.name} with divine guidance...`,
    });

    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(null);
      setConnectedWallet(wallet.id);
      const mockAddress = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;
      
      playSound("success");
      toast({
        title: "Wallet Connected Successfully",
        description: `${wallet.name} connected. May your transactions be blessed with wisdom and prosperity.`,
      });
      
      onConnect?.(wallet.id, mockAddress);
      setIsOpen(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    playSound("select");
    setConnectedWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected. Go in peace.",
    });
  };

  return (
    <div className={className}>
      {connectedWallet ? (
        <Card className="border-green-400/50 bg-green-400/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">Wallet Connected</p>
                  <p className="text-sm text-white/70">
                    {biblicalWallets.find(w => w.id === connectedWallet)?.name}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnect}
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-gradient-to-r from-ancient-gold to-yellow-600 hover:from-yellow-600 hover:to-ancient-gold text-black font-bold"
              onClick={() => playSound("select")}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Biblical Wallet
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                <GlowingText color="yellow" className="text-2xl font-scroll">
                  Choose Your Spiritual Wallet
                </GlowingText>
              </DialogTitle>
            </DialogHeader>
            
            <Alert className="border-ancient-gold/50 bg-ancient-gold/10">
              <BookOpen className="h-4 w-4 text-ancient-gold" />
              <AlertDescription className="text-ancient-gold">
                <strong>Biblical Wisdom:</strong> "Store up for yourselves treasures in heaven, where moths and vermin do not destroy, 
                and where thieves do not break in and steal." - Matthew 6:20
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {biblicalWallets.map((wallet) => (
                <Card 
                  key={wallet.id} 
                  className={`border-scripture/30 bg-black/40 hover:bg-black/60 transition-all cursor-pointer ${
                    wallet.recommended ? 'border-ancient-gold/50 bg-ancient-gold/5' : ''
                  } ${wallet.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => wallet.status === 'available' && handleWalletConnect(wallet)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={wallet.icon} 
                          alt={wallet.name} 
                          className="w-12 h-12 rounded-lg" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-medium text-ancient-gold">{wallet.name}</h3>
                            {wallet.recommended && (
                              <Badge className="bg-ancient-gold/20 text-ancient-gold">
                                RECOMMENDED
                              </Badge>
                            )}
                            {wallet.status === 'coming-soon' && (
                              <Badge className="bg-blue-400/20 text-blue-400">
                                COMING SOON
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/70 mb-2">{wallet.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {wallet.features.map((feature, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs border-scripture/30"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {isConnecting === wallet.id && (
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-ancient-gold animate-pulse" />
                          <span className="text-sm text-ancient-gold">Connecting...</span>
                        </div>
                      )}
                    </div>

                    {wallet.biblicalConnection && wallet.verse && (
                      <div className="bg-black/30 p-3 rounded-lg border border-ancient-gold/20">
                        <p className="text-sm font-medium text-ancient-gold mb-1">
                          Biblical Connection: {wallet.biblicalConnection}
                        </p>
                        <p className="text-xs text-white/80 italic">{wallet.verse}</p>
                      </div>
                    )}

                    {wallet.id === 'farcaster' && (
                      <div className="mt-4 p-3 bg-purple-400/10 border border-purple-400/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-purple-400" />
                          <span className="text-sm font-medium text-purple-400">
                            Farcaster Integration Ready
                          </span>
                        </div>
                        <FixedFarcasterConnect />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                <strong>Security Reminder:</strong> Never share your private keys or seed phrases. 
                "Be wise as serpents and innocent as doves." - Matthew 10:16
              </AlertDescription>
            </Alert>

            <div className="text-center text-sm text-white/60">
              <p>Connecting your wallet enables you to participate in biblical DeFi, tithing, and community features.</p>
              <p className="mt-1">All transactions are secured by divine providence and cryptographic principles.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BiblicalWalletConnect;