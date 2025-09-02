import React from 'react';
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

interface WalletButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

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
    walletType 
  } = useWallet();

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        variant={variant}
        size={size}
        className={`${className} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700`}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
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
          <Card className="border-ancient-gold/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Connected</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {walletType || 'Wallet'}
                </Badge>
              </div>
              <div className="text-xs text-white/70 font-mono break-all">
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