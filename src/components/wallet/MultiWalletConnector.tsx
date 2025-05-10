
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Wallet } from "lucide-react";

interface MultiWalletConnectorProps {
  onConnect?: (provider: string, address: string) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  buttonClassName?: string;
}

const MultiWalletConnector: React.FC<MultiWalletConnectorProps> = ({
  onConnect,
  buttonText = "Connect Wallet",
  buttonVariant = "default",
  buttonClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const wallets = [
    {
      id: "farcaster",
      name: "Farcaster Wallet",
      icon: "/lovable-uploads/8afaf401-60bd-4154-a6c1-5be046578f2f.png",
      description: "Connect using your Farcaster account wallet",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "https://www.coinbase.com/img/favicon.ico",
      description: "Connect using Coinbase Wallet",
    },
    {
      id: "rainbow",
      name: "Rainbow Wallet",
      icon: "https://rainbow.me/favicon.png",
      description: "Connect using Rainbow Wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "https://walletconnect.com/favicon.ico",
      description: "Connect using WalletConnect protocol",
    },
  ];

  const handleWalletConnect = (walletId: string) => {
    // Simulate connecting to wallet
    setTimeout(() => {
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletId} with address ${mockAddress.substring(0, 6)}...${mockAddress.substring(38)}`,
      });
      
      if (onConnect) {
        onConnect(walletId, mockAddress);
      }
      
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant as any} className={buttonClassName}>
          <Wallet className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect with Bible.fi
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          {wallets.map((wallet) => (
            <Card 
              key={wallet.id} 
              className="cursor-pointer hover:border-scripture transition-colors"
              onClick={() => handleWalletConnect(wallet.id)}
            >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
                    <CardTitle className="text-base">{wallet.name}</CardTitle>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-muted-foreground">{wallet.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiWalletConnector;
