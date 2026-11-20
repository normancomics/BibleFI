import { useRealTokenPrices } from '@/hooks/useRealTokenPrices';

/** Live CoinGecko prices keyed by token symbol (no simulated fluctuation). */
export const useRealTimePrices = () => {
  const { prices, isLoading, error, getPrice, formatPrice, formatChange } = useRealTokenPrices();
  return {
    prices,
    isLoading,
    error: error ? (error as Error).message : null,
    getPrice,
    formatPrice,
    formatChange,
  };
};
