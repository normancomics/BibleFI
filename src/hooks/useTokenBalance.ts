import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface UseTokenBalanceProps {
  tokenAddress?: `0x${string}`;
  enabled?: boolean;
}

export const useTokenBalance = ({ tokenAddress, enabled = true }: UseTokenBalanceProps) => {
  const { address } = useAccount();
  
  const { data: balanceData } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: enabled && !!address && !!tokenAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const { data: decimalsData } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: {
      enabled: enabled && !!tokenAddress,
    },
  });

  const { data: symbolData } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: {
      enabled: enabled && !!tokenAddress,
    },
  });

  const balance = balanceData && decimalsData 
    ? formatUnits(balanceData, decimalsData)
    : '0';

  return {
    balance,
    formattedBalance: parseFloat(balance).toFixed(4),
    symbol: symbolData || 'TOKEN',
    decimals: decimalsData || 18,
    isLoading: !balanceData && enabled,
  };
};