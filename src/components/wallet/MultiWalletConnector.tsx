
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
      description: "Connect using your Farcaster account",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet", 
      description: "Connect using Coinbase Wallet",
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
        
        <div className="grid grid-cols-1 gap-3 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="h-auto p-4 justify-start hover:border-ancient-gold hover:bg-ancient-gold/10"
              onClick={() => handleWalletConnect(wallet.id)}
            >
              <div className="text-left">
                <div className="font-medium text-white">{wallet.name}</div>
                <div className="text-sm text-white/70">{wallet.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiWalletConnector;
