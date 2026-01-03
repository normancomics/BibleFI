import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { realSuperfluidClient } from '@/integrations/superfluid/realClient';
import { toast } from 'sonner';
import { ethers } from 'ethers';

// BWSP Constants (matching BWSPCore.sol)
const TITHE_RATE = 1000; // 10.00% in basis points
const BASIS_POINTS = 10000;
const MIN_STREAM_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

export interface TithingStreamParams {
  profitAmount: number;
  churchAddress: string;
  tokenSymbol: string;
  isAnonymous?: boolean;
}

export interface StreamStats {
  activeStreams: number;
  totalMonthlyFlow: number;
  wisdomScore: number;
}

export const useSuperfluid = () => {
  const { address, isConnected } = useAccount();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    activeStreams: 0,
    totalMonthlyFlow: 0,
    wisdomScore: 0
  });

  /**
   * Get Web3 provider and ensure Base chain
   */
  const getProvider = useCallback(async () => {
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
  }, []);

  /**
   * Calculate tithe amount (10% of profits) - matches BWSPCore.sol
   */
  const calculateTithe = useCallback((profitAmount: number): number => {
    return (profitAmount * TITHE_RATE) / BASIS_POINTS;
  }, []);

  /**
   * Calculate flow rate from tithe amount (per second over 30 days)
   */
  const calculateTitheFlowRate = useCallback((titheAmount: number, decimals: number = 18): string => {
    const amountInWei = ethers.utils.parseUnits(titheAmount.toString(), decimals);
    const flowRatePerSecond = amountInWei.div(MIN_STREAM_DURATION);
    return flowRatePerSecond.toString();
  }, []);

  /**
   * Apply wisdom bonus to flow rate (matches BWSPCore.sol logic)
   */
  const applyWisdomBonus = useCallback((baseFlowRate: string, wisdomScore: number): string => {
    const flowRateBN = ethers.BigNumber.from(baseFlowRate);
    
    if (wisdomScore >= 500) {
      // Generous givers: 5% bonus
      return flowRateBN.add(flowRateBN.mul(5).div(100)).toString();
    } else if (wisdomScore >= 100) {
      // Faithful givers: 2% bonus
      return flowRateBN.add(flowRateBN.mul(2).div(100)).toString();
    }
    
    return baseFlowRate;
  }, []);

  // Initialize Superfluid on Base chain
  useEffect(() => {
    const initializeSuperfluid = async () => {
      if (isConnected && !isInitialized) {
        try {
          setIsLoading(true);
          const provider = await getProvider();
          const signer = provider.getSigner();
          await realSuperfluidClient.initialize(signer);
          setIsInitialized(true);
          console.log('[BWSP] Superfluid initialized on Base chain');
          toast.success('Superfluid initialized on Base chain');
        } catch (error) {
          console.error('[BWSP] Failed to initialize Superfluid:', error);
          toast.error('Failed to initialize Superfluid. Please ensure you\'re connected to Base chain.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeSuperfluid();
  }, [isConnected, isInitialized, getProvider]);

  /**
   * Start a BWSP tithing stream (10% of profits)
   */
  const startTithingStream = useCallback(async (params: TithingStreamParams) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'No wallet connected' };
    }

    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      setIsLoading(true);

      // Calculate tithe (10%)
      const titheAmount = calculateTithe(params.profitAmount);
      const token = realSuperfluidClient.getToken(params.tokenSymbol);
      
      if (!token) {
        throw new Error(`Token ${params.tokenSymbol} not found`);
      }

      // Calculate flow rate with optional wisdom bonus
      let flowRate = calculateTitheFlowRate(titheAmount);
      flowRate = applyWisdomBonus(flowRate, streamStats.wisdomScore);

      console.log(`[BWSP] Starting tithing stream: ${titheAmount} ${params.tokenSymbol}/month to ${params.churchAddress}`);

      const result = await realSuperfluidClient.createTithingStream(
        signer,
        params.churchAddress,
        params.tokenSymbol,
        titheAmount,
        'month'
      );

      if (result.success) {
        // Update stats
        setStreamStats(prev => ({
          ...prev,
          activeStreams: prev.activeStreams + 1,
          totalMonthlyFlow: prev.totalMonthlyFlow + titheAmount
        }));
        
        toast.success(`Tithing stream started: ${titheAmount.toFixed(2)} ${params.tokenSymbol}/month`);
      } else {
        toast.error(`Failed to start tithing stream: ${result.error}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error starting tithing stream: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getProvider, calculateTithe, calculateTitheFlowRate, applyWisdomBonus, streamStats.wisdomScore]);

  /**
   * Create a standard flow
   */
  const createFlow = useCallback(async (receiver: string, tokenAddress: string, flowRate: string) => {
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
  }, [isConnected, getProvider]);

  /**
   * Update an existing flow
   */
  const updateFlow = useCallback(async (receiver: string, tokenAddress: string, newFlowRate: string) => {
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
  }, [isConnected, getProvider]);

  /**
   * Delete a flow
   */
  const deleteFlow = useCallback(async (receiver: string, tokenAddress: string) => {
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
        // Update stats
        setStreamStats(prev => ({
          ...prev,
          activeStreams: Math.max(0, prev.activeStreams - 1)
        }));
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
  }, [isConnected, getProvider]);

  /**
   * Legacy createTithingStream for backward compatibility
   */
  const createTithingStream = useCallback(async (
    churchAddress: string,
    tokenSymbol: string,
    amount: number,
    period: string
  ) => {
    return startTithingStream({
      profitAmount: amount * 10, // Convert to profit (tithe = 10%)
      churchAddress,
      tokenSymbol
    });
  }, [startTithingStream]);

  /**
   * Update wisdom score
   */
  const updateWisdomScore = useCallback((newScore: number) => {
    setStreamStats(prev => ({
      ...prev,
      wisdomScore: newScore
    }));
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    address,
    isConnected,
    streamStats,
    
    // BWSP Functions
    startTithingStream,
    calculateTithe,
    calculateTitheFlowRate,
    updateWisdomScore,
    
    // Standard Superfluid Functions
    createFlow,
    updateFlow,
    deleteFlow,
    createTithingStream, // Legacy
    
    // Utilities
    getAvailableTokens: () => realSuperfluidClient.getAvailableTokens(),
    getToken: (symbol: string) => realSuperfluidClient.getToken(symbol),
    calculateFlowRate: (amount: number, decimals?: number) => 
      realSuperfluidClient.calculateFlowRate(amount, decimals),
    calculateFlowRateFromPeriod: (amount: number, period: string, decimals?: number) =>
      realSuperfluidClient.calculateFlowRateFromPeriod(amount, period, decimals)
  };
};
