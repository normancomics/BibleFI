import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';

export const useNativeBalance = () => {
  const { address } = useAccount();
  
  const { data, isLoading, refetch } = useBalance({
    address,
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const balance = data?.formatted || '0';
  const symbol = data?.symbol || 'ETH';

  return {
    balance,
    formattedBalance: parseFloat(balance).toFixed(4),
    symbol,
    isLoading,
    refetch,
  };
};