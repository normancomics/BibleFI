import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  type: 'swap' | 'send' | 'receive';
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  counterparty?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export const useTransactionHistory = (limit = 15) => {
  const { isConnected, address } = useAccount();

  const query = useQuery({
    queryKey: ['basescan-history', address, limit],
    queryFn: async () => {
      if (!address) return [];
      const { data, error } = await supabase.functions.invoke('basescan-history', {
        body: { address, page: 1, offset: limit },
      });
      if (error) throw error;
      return (data?.transactions || []) as Transaction[];
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    isConnected,
    address,
  };
};
