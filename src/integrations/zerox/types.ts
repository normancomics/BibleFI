
export interface BaseToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
}

export interface SwapQuote {
  price: string;
  estimatedGas: string;
  estimatedPriceImpact: string;
  sellAmount: string;
  buyAmount: string;
  allowanceTarget: string;
  sources: Array<{
    name: string;
    proportion: string;
  }>;
}

export interface SwapTransaction extends SwapQuote {
  data: string;
  to: string;
  value: string;
  gasPrice: string;
  gas: string;
}

export interface TokenBalance {
  token: BaseToken;
  balance: string;
  formattedBalance: string;
}

export interface SwapState {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
  exchangeRate: string;
  slippage: number;
  useOdos: boolean;
}
