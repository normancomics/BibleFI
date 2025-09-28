import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface Capability {
  [method: string]: {
    supported: boolean;
  };
}

interface BatchTransactionRequest {
  to: string;
  data: string;
  value?: string;
}

export const useEIP5792 = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [capabilities, setCapabilities] = useState<Capability | null>(null);
  const [isCheckingCapabilities, setIsCheckingCapabilities] = useState(false);

  const checkWalletCapabilities = useCallback(async () => {
    if (!isConnected || !window.ethereum) {
      return null;
    }

    setIsCheckingCapabilities(true);
    try {
      // Check if wallet supports EIP-5792
      const capabilities = await window.ethereum.request({
        method: 'wallet_getCapabilities',
        params: [address],
      });

      setCapabilities(capabilities);
      
      if (capabilities?.['wallet_sendCalls']) {
        toast({
          title: "Advanced Wallet Features Detected",
          description: "Your wallet supports batch transactions for smoother DeFi interactions",
        });
      }

      return capabilities;
    } catch (error) {
      console.log('EIP-5792 not supported:', error);
      return null;
    } finally {
      setIsCheckingCapabilities(false);
    }
  }, [address, isConnected, toast]);

  const sendBatchTransaction = useCallback(async (calls: BatchTransactionRequest[]) => {
    if (!isConnected || !window.ethereum || !capabilities?.['wallet_sendCalls']) {
      throw new Error('Batch transactions not supported');
    }

    try {
      const result = await window.ethereum.request({
        method: 'wallet_sendCalls',
        params: [
          {
            version: '1.0',
            chainId: '0x2105', // Base chain
            from: address,
            calls: calls.map(call => ({
              to: call.to,
              data: call.data,
              value: call.value || '0x0',
            })),
          },
        ],
      });

      toast({
        title: "Batch Transaction Sent",
        description: "Multiple operations executed in a single transaction",
      });

      return result;
    } catch (error) {
      console.error('Batch transaction failed:', error);
      throw error;
    }
  }, [address, isConnected, capabilities, toast]);

  const isEIP5792Supported = Boolean(capabilities?.['wallet_sendCalls']?.supported);

  return {
    capabilities,
    isCheckingCapabilities,
    checkWalletCapabilities,
    sendBatchTransaction,
    isEIP5792Supported,
  };
};