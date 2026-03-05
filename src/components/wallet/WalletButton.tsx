import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, ExternalLink, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WalletButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const WALLET_ICONS: Record<string, string> = {
  'Farcaster Wallet': '🟣',
  'Coinbase Wallet': '🔵',
  'WalletConnect': '🔗',
  'Browser Wallet': '🦊',
  'MetaMask': '🦊',
  'Injected': '🌐',
};

const WALLET_DESCRIPTIONS: Record<string, string> = {
  'Farcaster Wallet': 'Connect with your Farcaster/Warpcast wallet',
  'Coinbase Wallet': 'Connect with Coinbase Wallet or Smart Wallet',
  'WalletConnect': 'Scan QR code with any WalletConnect-compatible wallet',
  'Browser Wallet': 'Connect with MetaMask or other browser extension wallets',
  'MetaMask': 'Connect with MetaMask browser extension',
  'Injected': 'Connect with your browser wallet extension',
};

const WalletButton: React.FC<WalletButtonProps> = ({ 
  variant = 'default', 
  size = 'default',
  className = '' 
}) => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    switchToBase, 
    isOnBaseChain,
    walletType,
    availableConnectors,
  } = useWallet();
  const [showWalletPicker, setShowWalletPicker] = useState(false);

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowWalletPicker(true)}
          disabled={isConnecting}
          variant={variant}
          size={size}
          className={`${className} bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:opacity-90`}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        <Dialog open={showWalletPicker} onOpenChange={setShowWalletPicker}>
          <DialogContent className="sm:max-w-[420px] bg-stone-900 border-stone-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[hsl(var(--primary))]" />
                Connect Your Wallet
              </DialogTitle>
              <DialogDescription className="text-stone-400">
                Choose your preferred wallet to connect with BibleFi on Base Chain
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-3 py-4">
              {availableConnectors.map((connector) => (
                <Button
                  key={connector.uid}
                  variant="outline"
                  className="h-auto p-4 justify-start border-stone-600 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition-all"
                  onClick={() => {
                    connectWallet(connector);
                    setShowWalletPicker(false);
                  }}
                  disabled={isConnecting}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-2xl">
                      {WALLET_ICONS[connector.name] || '💼'}
                    </span>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-white">{connector.name}</div>
                      <div className="text-xs text-stone-400">
                        {WALLET_DESCRIPTIONS[connector.name] || 'Connect with this wallet'}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="text-xs text-stone-500 text-center pt-2 border-t border-stone-700">
              By connecting, you agree to BibleFi's Terms of Service
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const shortAddress = `${address?.slice(0, 6)}...${address?.slice(-4)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`${className} ${!isOnBaseChain ? 'border-orange-500 text-orange-500' : ''}`}
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{shortAddress}</span>
            {!isOnBaseChain && <AlertTriangle className="h-4 w-4 text-orange-500" />}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3">
          <Card className="border-stone-600">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Connected</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {walletType || 'Wallet'}
                </Badge>
              </div>
              <div className="text-xs text-stone-400 font-mono break-all">
                {address}
              </div>
              {!isOnBaseChain && (
                <div className="mt-2 p-2 bg-orange-500/20 rounded-md">
                  <div className="flex items-center gap-2 text-orange-400 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    Wrong Network
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <DropdownMenuSeparator />
        
        {!isOnBaseChain && (
          <>
            <DropdownMenuItem onClick={switchToBase} className="text-orange-400">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Switch to Base
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem 
          onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on BaseScan
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-400">
          <Wallet className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;
