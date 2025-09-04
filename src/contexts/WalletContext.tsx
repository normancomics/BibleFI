import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | undefined;
  isOnBaseChain: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  switchToBase: () => void;
  walletType: string | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  const { playSound } = useSound();
  const [walletType, setWalletType] = useState<string | undefined>();

  const isOnBaseChain = chainId === base.id;

  useEffect(() => {
    if (connector) {
      setWalletType(connector.name);
    }
  }, [connector]);

  const connectWallet = () => {
    // Try to find available connectors in order of preference
    const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet');
    const walletConnectConnector = connectors.find(c => c.name === 'WalletConnect');
    const injectedConnector = connectors.find(c => c.name === 'Browser Wallet');
    
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    } else if (walletConnectConnector) {
      connect({ connector: walletConnectConnector });
    } else if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setWalletType(undefined);
    playSound('click');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected.",
    });
  };

  const switchToBase = () => {
    if (!isOnBaseChain) {
      switchChain({ chainId: base.id });
    }
  };

  // Auto switch to Base chain when wallet connects
  useEffect(() => {
    if (isConnected && !isOnBaseChain) {
      setTimeout(() => {
        switchToBase();
      }, 1000);
    }
  }, [isConnected, isOnBaseChain]);

  // Connection status notifications
  useEffect(() => {
    if (isConnected && address) {
      playSound('success');
      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletType || 'wallet'} (${address.slice(0, 6)}...${address.slice(-4)})`,
      });
    }
  }, [isConnected, address, walletType]);

  const value = {
    address,
    isConnected,
    isConnecting: isPending,
    chainId,
    isOnBaseChain,
    connectWallet,
    disconnectWallet,
    switchToBase,
    walletType,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};