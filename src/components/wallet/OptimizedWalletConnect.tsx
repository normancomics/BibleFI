import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { Card, CardContent } from '@/components/ui/card';
import PixelButton from '@/components/PixelButton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, ChevronRight, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'available' | 'installed' | 'unavailable';
  connector?: any;
}

const OptimizedWalletConnect: React.FC = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  const { playSound } = useSound();
  const [open, setOpen] = useState(false);
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);

  const isOnBaseChain = chainId === base.id;

  useEffect(() => {
    // Check wallet availability and setup options
    const options: WalletOption[] = [
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        description: 'Smart Wallet optimized for Base Chain',
        status: 'available',
        connector: connectors.find(c => c.id === 'coinbaseWalletSDK'),
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        description: 'Connect 300+ wallets including Rainbow',
        status: 'available',
        connector: connectors.find(c => c.id === 'walletConnect'),
      },
      {
        id: 'injected',
        name: 'Browser Wallet',
        icon: '🌐',
        description: 'MetaMask, Brave Wallet, etc.',
        status: typeof window !== 'undefined' && window.ethereum ? 'installed' : 'unavailable',
        connector: connectors.find(c => c.id === 'injected'),
      },
    ];

    setWalletOptions(options.filter(option => option.connector));
  }, [connectors]);

  const handleConnect = async (connector: any) => {
    try {
      playSound('select');
      await connect({ connector });
      setOpen(false);
      
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet.',
      });
      
      // Auto-switch to Base chain if needed
      if (chainId !== base.id) {
        setTimeout(() => {
          switchChain({ chainId: base.id });
        }, 1000);
      }
      
    } catch (error: any) {
      playSound('error');
      toast({
        title: 'Connection Failed',
        description: error?.message || 'Failed to connect wallet.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    playSound('coin');
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  const handleSwitchToBase = () => {
    switchChain({ chainId: base.id });
    playSound('powerup');
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Card className="bg-scripture/20 border border-ancient-gold">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-ancient-gold" />
              <span className="text-white font-medium">Connected</span>
              {isOnBaseChain ? (
                <Badge className="bg-green-900 text-green-200 border border-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Base Chain
                </Badge>
              ) : (
                <Badge className="bg-yellow-900 text-yellow-200 border border-yellow-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Wrong Network
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mb-3">
            <code className="text-ancient-gold text-sm bg-black/40 px-2 py-1 rounded">
              {truncateAddress(address)}
            </code>
          </div>
          
          <div className="flex gap-2">
            {!isOnBaseChain && (
              <PixelButton 
                onClick={handleSwitchToBase}
                className="bg-yellow-900 text-yellow-200 border border-yellow-500 flex-1"
              >
                <Zap className="h-4 w-4 mr-1" />
                Switch to Base
              </PixelButton>
            )}
            
            <PixelButton 
              onClick={handleDisconnect}
              className="bg-red-900 text-red-200 border border-red-500"
            >
              Disconnect
            </PixelButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <PixelButton 
          className="bg-purple-900 text-ancient-gold border border-ancient-gold/50 hover:bg-purple-800"
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </PixelButton>
      </DialogTrigger>
      
      <DialogContent className="bg-temple border border-ancient-gold max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ancient-gold">Connect Your Wallet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <Card 
              key={wallet.id}
              className={`cursor-pointer transition-colors hover:bg-scripture/40 ${
                wallet.status === 'unavailable' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => wallet.status !== 'unavailable' && handleConnect(wallet.connector)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {wallet.name}
                        {wallet.status === 'installed' && (
                          <Badge className="bg-green-900 text-green-200 text-xs">
                            Installed
                          </Badge>
                        )}
                      </div>
                      <div className="text-ancient-gold/80 text-sm">
                        {wallet.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ancient-gold" />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500 rounded">
              <p className="text-red-300 text-sm">{error.message}</p>
            </div>
          )}
          
          <div className="text-center text-ancient-gold/60 text-xs">
            <p>By connecting, you agree to our Terms of Service</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptimizedWalletConnect;