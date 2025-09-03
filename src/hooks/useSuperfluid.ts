import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { realSuperfluidClient } from '@/integrations/superfluid/realClient';
import { toast } from 'sonner';
import { ethers } from 'ethers';

export const useSuperfluid = () => {
  const { address, isConnected } = useAccount();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getProvider = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Check if we're on Base chain (8453)
      if (network.chainId !== 8453) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // Base chain ID in hex
          });
        } catch (error: any) {
          if (error.code === 4902) {
            // Chain not added, add Base chain
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
              }]
            });
          }
        }
      }
      return provider;
    }
    throw new Error('No wallet provider found');
  };

  useEffect(() => {
    const initializeSuperfluid = async () => {
      if (isConnected && !isInitialized) {
        try {
          setIsLoading(true);
          const provider = await getProvider();
          const signer = provider.getSigner();
          await realSuperfluidClient.initialize(signer);
          setIsInitialized(true);
          toast.success('Superfluid initialized on Base chain');
        } catch (error) {
          console.error('Failed to initialize Superfluid:', error);
          toast.error('Failed to initialize Superfluid. Please ensure you\'re connected to Base chain.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeSuperfluid();
  }, [isConnected, isInitialized]);

  const createFlow = async (receiver: string, tokenAddress: string, flowRate: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'No wallet connected' };
    }

    try {
      const provider = await getProvider();
      const signer = provider.getSigner();

      setIsLoading(true);
      const result = await realSuperfluidClient.createFlow(signer, receiver, tokenAddress, flowRate);
      
      if (result.success) {
        toast.success('Flow created successfully!');
      } else {
        toast.error(`Failed to create flow: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error creating flow: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlow = async (receiver: string, tokenAddress: string, newFlowRate: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'No wallet connected' };
    }

    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      setIsLoading(true);
      const result = await realSuperfluidClient.updateFlow(signer, receiver, tokenAddress, newFlowRate);
      
      if (result.success) {
        toast.success('Flow updated successfully!');
      } else {
        toast.error(`Failed to update flow: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error updating flow: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlow = async (receiver: string, tokenAddress: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'No wallet connected' };
    }

    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      setIsLoading(true);
      const result = await realSuperfluidClient.deleteFlow(signer, receiver, tokenAddress);
      
      if (result.success) {
        toast.success('Flow deleted successfully!');
      } else {
        toast.error(`Failed to delete flow: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error deleting flow: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const createTithingStream = async (
    churchAddress: string,
    tokenSymbol: string,
    amount: number,
    period: string
  ) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'No wallet connected' };
    }

    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      setIsLoading(true);
      const result = await realSuperfluidClient.createTithingStream(
        signer,
        churchAddress,
        tokenSymbol,
        amount,
        period
      );
      
      if (result.success) {
        toast.success('Tithing stream created successfully!');
      } else {
        toast.error(`Failed to create tithing stream: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error creating tithing stream: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInitialized,
    isLoading,
    address,
    isConnected,
    createFlow,
    updateFlow,
    deleteFlow,
    createTithingStream,
    getAvailableTokens: () => realSuperfluidClient.getAvailableTokens(),
    getToken: (symbol: string) => realSuperfluidClient.getToken(symbol),
    calculateFlowRate: (amount: number, decimals?: number) => 
      realSuperfluidClient.calculateFlowRate(amount, decimals),
    calculateFlowRateFromPeriod: (amount: number, period: string, decimals?: number) =>
      realSuperfluidClient.calculateFlowRateFromPeriod(amount, period, decimals)
  };
};