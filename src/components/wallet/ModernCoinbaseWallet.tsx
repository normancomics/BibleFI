import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink, Shield, Zap } from 'lucide-react';
import { useSound } from '@/contexts/SoundContext';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    CoinbaseWalletSDKClass?: any;
    ethereum?: any;
  }
}

interface ModernCoinbaseWalletProps {
  onConnect?: (address: string, provider: any) => void;
  onDisconnect?: () => void;
  className?: string;
  showFeatures?: boolean;
}

const ModernCoinbaseWallet: React.FC<ModernCoinbaseWalletProps> = ({
  onConnect,
  onDisconnect,
  className = "",
  showFeatures = true
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const { playSound } = useSound();
  const { toast } = useToast();

  useEffect(() => {
    initializeCoinbaseWallet();
    checkConnection();
  }, []);

  const initializeCoinbaseWallet = async () => {
    try {
      // Check if Coinbase Wallet SDK is available
      if (typeof window !== 'undefined') {
        // Load Coinbase Wallet SDK if not already loaded
        if (!window.CoinbaseWalletSDKClass) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@coinbase/wallet-sdk@latest/dist/index.js';
          script.onload = () => {
            window.CoinbaseWalletSDKClass = (window as any).CoinbaseWalletSDK;
            initializeSDK();
          };
          document.head.appendChild(script);
        } else {
          initializeSDK();
        }
      }
    } catch (error) {
      console.error('Failed to initialize Coinbase Wallet:', error);
    }
  };

  const initializeSDK = () => {
    try {
      if (window.CoinbaseWalletSDKClass) {
        const sdk = new window.CoinbaseWalletSDKClass({
          appName: 'BibleFi',
          appLogoUrl: '/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png',
          darkMode: true
        });

        const web3Provider = sdk.makeWeb3Provider();
        setProvider(web3Provider);

        // Listen for account changes
        web3Provider.on('accountsChanged', handleAccountsChanged);
        web3Provider.on('chainChanged', handleChainChanged);
        web3Provider.on('disconnect', handleDisconnect);
      }
    } catch (error) {
      console.error('Failed to initialize SDK:', error);
    }
  };

  const checkConnection = async () => {
    try {
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Get chain ID
          const chainId = await provider.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainId, 16));
        }
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!provider) {
      toast({
        title: "Coinbase Wallet not available",
        description: "Please install Coinbase Wallet extension or app",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    playSound('select');

    try {
      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        setAddress(userAddress);
        setIsConnected(true);
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));

        // Switch to Base if not already
        if (parseInt(chainId, 16) !== 8453) {
          await switchToBase();
        }

        playSound('success');
        toast({
          title: "🎮 Coinbase Wallet Connected!",
          description: `Address: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
        });

        onConnect?.(userAddress, provider);
      }
    } catch (error: any) {
      playSound('error');
      console.error('Failed to connect:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to Coinbase Wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToBase = async () => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet (8453)
      });
    } catch (switchError: any) {
      // Chain not added to wallet
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Base network:', addError);
        }
      }
    }
  };

  const disconnectWallet = async () => {
    try {
      if (provider && provider.disconnect) {
        await provider.disconnect();
      }
      
      setIsConnected(false);
      setAddress(null);
      setChainId(null);
      
      playSound('select');
      toast({
        title: "Disconnected",
        description: "Coinbase Wallet has been disconnected",
      });

      onDisconnect?.();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress(null);
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setChainId(null);
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 8453: return 'Base';
      case 1: return 'Ethereum';
      case 84532: return 'Base Sepolia';
      default: return `Chain ${chainId}`;
    }
  };

  if (isConnected && address) {
    return (
      <Card className={`retro-card p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3 flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-retro-cyan">Coinbase Wallet</div>
              <div className="text-xs text-retro-green">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-retro-green/20 text-retro-green border-retro-green">
            Connected
          </Badge>
        </div>

        {chainId && (
          <div className="mb-3 text-xs text-retro-yellow font-pixel">
            ⚡ {getChainName(chainId)}
          </div>
        )}

        <Button 
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          Disconnect
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="retro-card p-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Wallet size={24} className="text-white" />
          </div>
          <h3 className="font-orbitron text-lg font-bold text-retro-cyan mb-2">
            Coinbase Wallet
          </h3>
          <p className="text-sm text-retro-green">
            Connect your Coinbase Wallet to start your biblical DeFi journey
          </p>
        </div>

        <Button 
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Connecting...
            </div>
          ) : (
            <div className="flex items-center">
              <Wallet size={18} className="mr-2" />
              Connect Coinbase Wallet
            </div>
          )}
        </Button>
      </Card>

      {showFeatures && (
        <Card className="retro-card p-4">
          <h4 className="font-orbitron text-sm font-bold text-retro-cyan mb-3">
            Coinbase Wallet Features
          </h4>
          <div className="space-y-2">
            <div className="flex items-center text-xs text-retro-green">
              <Shield size={14} className="mr-2 text-retro-yellow" />
              Self-custody wallet
            </div>
            <div className="flex items-center text-xs text-retro-green">
              <Zap size={14} className="mr-2 text-retro-yellow" />
              Base chain optimized
            </div>
            <div className="flex items-center text-xs text-retro-green">
              <ExternalLink size={14} className="mr-2 text-retro-yellow" />
              DeFi protocols access
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ModernCoinbaseWallet;