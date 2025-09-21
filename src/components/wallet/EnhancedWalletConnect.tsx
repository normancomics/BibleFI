import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  AlertCircle, 
  CheckCircle,
  Smartphone,
  Globe,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { useWallet } from '@/contexts/WalletContext';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  recommended?: boolean;
  mobile?: boolean;
  desktop?: boolean;
}

const EnhancedWalletConnect: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet, walletType, isOnBaseChain, switchToBase } = useWallet();
  const [showQR, setShowQR] = useState(false);

  const walletOptions: WalletOption[] = [
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🟦',
      description: 'Native Base chain support with smart wallet features',
      recommended: true,
      mobile: true,
      desktop: true
    },
    {
      id: 'rainbow',
      name: 'Rainbow Wallet',
      icon: '🌈',
      description: 'Beautiful mobile-first wallet with Base support',
      mobile: true,
      desktop: false
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Popular browser extension wallet',
      mobile: true,
      desktop: true
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect any mobile wallet via QR code',
      mobile: true,
      desktop: true
    }
  ];

  const handleConnect = async (walletId: string) => {
    playSound('click');
    
    if (walletId === 'walletconnect') {
      setShowQR(true);
    }
    
    try {
      await connectWallet();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please try again or use a different wallet.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowQR(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      playSound('success');
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openInExplorer = () => {
    if (address) {
      window.open(`https://basescan.org/address/${address}`, '_blank');
      playSound('click');
    }
  };

  if (isConnected && address) {
    return (
      <Card className="border-green-400/30 bg-green-400/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{walletType || 'Unknown Wallet'}</div>
              <div className="text-sm text-muted-foreground font-mono">
                {address.substring(0, 8)}...{address.substring(-4)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOnBaseChain ? "default" : "destructive"}>
                {isOnBaseChain ? "Base" : "Wrong Network"}
              </Badge>
            </div>
          </div>

          {!isOnBaseChain && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Wrong Network</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Please switch to Base network to use Bible.fi
              </p>
              <Button onClick={switchToBase} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Switch to Base
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyAddress} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy Address
            </Button>
            <Button variant="outline" size="sm" onClick={openInExplorer} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on BaseScan
            </Button>
          </div>

          <Button variant="outline" onClick={handleDisconnect} className="w-full">
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Connect Your Wallet
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred wallet to start using Bible.fi on Base
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletOptions.map((wallet) => (
          <Button
            key={wallet.id}
            variant="outline"
            className="w-full h-auto p-4 justify-start"
            onClick={() => handleConnect(wallet.id)}
            disabled={isConnecting}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="text-2xl">{wallet.icon}</div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{wallet.name}</span>
                  {wallet.recommended && (
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{wallet.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  {wallet.mobile && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Smartphone className="h-3 w-3" />
                      Mobile
                    </span>
                  )}
                  {wallet.desktop && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      Desktop
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Button>
        ))}

        {showQR && (
          <Card className="border-blue-400/30 bg-blue-400/5">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center">
                  <div className="text-4xl">📱</div>
                </div>
                <div>
                  <h3 className="font-medium">Scan with your wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Open your mobile wallet and scan this QR code
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowQR(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Secure Connection</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Your wallet stays in your control</li>
            <li>• No private keys stored by Bible.fi</li>
            <li>• All transactions require your approval</li>
            <li>• Built on Base for low fees</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedWalletConnect;