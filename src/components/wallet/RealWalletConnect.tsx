
import React from "react";
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/contexts/SoundContext";
import { Wallet, ExternalLink, ArrowRight, LogOut } from "lucide-react";

interface RealWalletConnectProps {
  onConnect?: (provider: string, address: string) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  buttonClassName?: string;
}

const RealWalletConnect: React.FC<RealWalletConnectProps> = ({
  onConnect,
  buttonText = "Connect Wallet",
  buttonVariant = "default",
  buttonClassName = "",
}) => {
  const [open, setOpen] = React.useState(false);
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const { playSound } = useSound();

  const handleConnect = (connector: any) => {
    playSound("select");
    
    connect({ connector }, {
      onSuccess: (data) => {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${connector.name}`,
        });
        
        if (onConnect && data.accounts[0]) {
          onConnect(connector.name, data.accounts[0]);
        }
        
        setOpen(false);
        playSound("success");
      },
      onError: (error) => {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
        playSound("error");
      }
    });
  };

  const handleDisconnect = () => {
    playSound("select");
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // If wallet is connected, show disconnect button
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-ancient-gold">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="border-ancient-gold text-ancient-gold hover:bg-ancient-gold hover:text-black"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

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
          <DialogTitle className="text-ancient-gold">Connect Wallet</DialogTitle>
          <DialogDescription className="text-white/70">
            Choose your wallet to connect to Bible.fi
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {connectors.map((connector) => (
            <Card 
              key={connector.uid}
              className="cursor-pointer transition-all duration-200 bg-purple-900/20 border border-ancient-gold/20 hover:border-ancient-gold/40 hover:bg-purple-800/30"
              onClick={() => handleConnect(connector)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-ancient-gold/20 rounded-lg flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-ancient-gold" />
                    </div>
                    <div>
                      <span className="font-medium text-white">
                        {connector.name === 'Coinbase Wallet' ? 'Base Wallet' : 
                         connector.name === 'WalletConnect' ? 'Rainbow Wallet' :
                         connector.name === 'Browser Wallet' ? 'Farcaster Wallet' : 
                         connector.name}
                      </span>
                      <p className="text-sm text-white/60">
                        {connector.name === 'Coinbase Wallet' && 'Connect with Base app'}
                        {connector.name === 'WalletConnect' && 'Rainbow & other wallets'}
                        {(connector.name === 'Injected' || connector.name === 'Browser Wallet') && 'Browser extension & Farcaster'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isPending ? (
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

        <div className="text-center text-xs text-white/50 border-t border-ancient-gold/20 pt-4">
          By connecting, you agree to Bible.fi's Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RealWalletConnect;
