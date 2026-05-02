import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, Connector } from 'wagmi';
import { base } from 'wagmi/chains';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';

export type ConnectionStep = 'idle' | 'connecting' | 'signing' | 'switching-chain' | 'connected' | 'error';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | undefined;
  isOnBaseChain: boolean;
  connectWallet: (connector?: Connector) => void;
  disconnectWallet: () => void;
  switchToBase: () => void;
  walletType: string | undefined;
  connectionStep: ConnectionStep;
  connectionError: string | undefined;
  retryConnection: () => void;
  availableConnectors: readonly Connector[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { toast } = useToast();
  const { playSound } = useSound();
  const [walletType, setWalletType] = useState<string | undefined>();
  const [connectionStep, setConnectionStep] = useState<ConnectionStep>('idle');
  const [connectionError, setConnectionError] = useState<string | undefined>();
  // Tracks whether the most recent wallet activity was triggered by an explicit
  // user action (button click) vs. background auto-init / persisted reconnect.
  // Only user-initiated activity should surface toasts/sounds.
  const userInitiatedRef = useRef(false);

  const isOnBaseChain = chainId === base.id;

  useEffect(() => {
    if (connectError) {
      setConnectionStep('error');
      setConnectionError(connectError.message || 'Failed to connect wallet');
      if (userInitiatedRef.current) {
        playSound('error');
      }
    } else if (isPending) {
      setConnectionStep('connecting');
      setConnectionError(undefined);
    } else if (isSwitchingChain) {
      setConnectionStep('switching-chain');
    } else if (isConnected && isOnBaseChain) {
      setConnectionStep('connected');
      setConnectionError(undefined);
    } else if (isConnected && !isOnBaseChain) {
      setConnectionStep('switching-chain');
    } else if (!isConnected) {
      setConnectionStep('idle');
    }
  }, [isPending, isSwitchingChain, isConnected, isOnBaseChain, connectError, playSound]);

  useEffect(() => {
    if (connector) {
      setWalletType(connector.name);
    }
  }, [connector]);

  const connectWallet = useCallback((selectedConnector?: Connector) => {
    userInitiatedRef.current = true;
    setConnectionError(undefined);
    setConnectionStep('connecting');
    
    try {
      if (selectedConnector) {
        connect({ connector: selectedConnector });
      } else if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        setConnectionStep('error');
        setConnectionError('No wallet connectors available');
      }
    } catch (err) {
      setConnectionStep('error');
      setConnectionError(err instanceof Error ? err.message : 'Failed to initiate connection');
    }
  }, [connectors, connect]);

  const retryConnection = useCallback(() => {
    setConnectionStep('idle');
    setConnectionError(undefined);
  }, []);

  const disconnectWallet = useCallback(() => {
    userInitiatedRef.current = true;
    disconnect();
    setWalletType(undefined);
    setConnectionStep('idle');
    setConnectionError(undefined);
    playSound('click');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected.",
    });
  }, [disconnect, playSound, toast]);

  const switchToBase = useCallback(() => {
    if (!isOnBaseChain) {
      userInitiatedRef.current = true;
      setConnectionStep('switching-chain');
      toast({
        title: "🔄 Switching Network",
        description: `Requesting switch to Base (Chain ID: ${base.id})...`,
      });
      switchChain(
        { chainId: base.id },
        {
          onSuccess: () => {
            playSound('success');
            toast({
              title: "✅ Network Switched",
              description: `Successfully connected to Base network (Chain ID: ${base.id})`,
            });
          },
          onError: (error) => {
            playSound('error');
            toast({
              title: "❌ Switch Failed",
              description: error.message || "Failed to switch to Base network",
              variant: "destructive",
            });
          },
        }
      );
    }
  }, [isOnBaseChain, switchChain, toast, playSound]);

  useEffect(() => {
    if (isConnected && !isOnBaseChain) {
      // Silent auto-switch on persisted reconnect — no toasts.
      const timer = setTimeout(() => {
        setConnectionStep('switching-chain');
        switchChain({ chainId: base.id });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isOnBaseChain, switchChain]);

  useEffect(() => {
    if (isConnected && address && isOnBaseChain && connectionStep === 'connected') {
      if (userInitiatedRef.current) {
        playSound('success');
        toast({
          title: "Wallet Connected",
          description: `Connected to ${walletType || 'wallet'} (${address.slice(0, 6)}...${address.slice(-4)})`,
        });
        userInitiatedRef.current = false;
      }
    }
  }, [isConnected, address, walletType, isOnBaseChain, connectionStep, playSound, toast]);

  const value = {
    address,
    isConnected,
    isConnecting: isPending || isSwitchingChain,
    chainId,
    isOnBaseChain,
    connectWallet,
    disconnectWallet,
    switchToBase,
    walletType,
    connectionStep,
    connectionError,
    retryConnection,
    availableConnectors: connectors,
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