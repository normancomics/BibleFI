
import { BASE_TOKENS } from "@/integrations/zerox/client";

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
}

export const getTokenBySymbol = (symbol: string): TokenInfo | null => {
  return BASE_TOKENS[symbol] || null;
};

export const formatTokenBalance = (balance: string, decimals: number): string => {
  const balanceNum = parseFloat(balance);
  if (balanceNum === 0) return "0.0";
  
  if (balanceNum < 0.001) {
    return "< 0.001";
  }
  
  if (balanceNum < 1) {
    return balanceNum.toFixed(4);
  }
  
  if (balanceNum < 1000) {
    return balanceNum.toFixed(2);
  }
  
  return balanceNum.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
};

export const parseTokenInput = (input: string, decimals: number): string => {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  
  if (parts.length > 2) {
    return parts[0] + '.' + parts[1];
  }
  
  if (parts[1] && parts[1].length > decimals) {
    return parts[0] + '.' + parts[1].substring(0, decimals);
  }
  
  return cleaned;
};

export const calculateSlippage = (expectedAmount: string, actualAmount: string): number => {
  const expected = parseFloat(expectedAmount);
  const actual = parseFloat(actualAmount);
  
  if (expected === 0) return 0;
  
  return Math.abs((expected - actual) / expected) * 100;
};

export const isValidTokenAmount = (amount: string, balance?: string): boolean => {
  const amountNum = parseFloat(amount);
  
  if (isNaN(amountNum) || amountNum <= 0) {
    return false;
  }
  
  if (balance) {
    const balanceNum = parseFloat(balance);
    return amountNum <= balanceNum;
  }
  
  return true;
};

export const getTokenPairKey = (fromToken: string, toToken: string): string => {
  return `${fromToken}-${toToken}`;
};
