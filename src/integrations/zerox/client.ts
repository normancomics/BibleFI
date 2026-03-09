
/**
 * 0x Protocol API Integration (Secure Proxy Version)
 * All API calls are proxied through a Supabase Edge Function
 * to protect the API key server-side.
 */
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Types for 0x API responses
export interface PriceResponse {
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

export interface SwapQuoteResponse extends PriceResponse {
  data: string; // Transaction data
  to: string;   // Target contract address
  value: string; // ETH value to send with transaction
  gasPrice: string;
  gas: string;
}

// Token interface for supported tokens
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
}

// Base Chain ID (Layer 2 Ethereum solution built by Coinbase)
export const BASE_CHAIN_ID = 8453;

// Common ERC20 tokens on Base Chain
export const BASE_TOKENS: Record<string, Token> = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // 0x protocol's ETH pseudo-address
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    chainId: BASE_CHAIN_ID
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    chainId: BASE_CHAIN_ID
  },
  DAI: {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png",
    chainId: BASE_CHAIN_ID
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 6,
    logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    chainId: BASE_CHAIN_ID
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    chainId: BASE_CHAIN_ID
  },
  WBTC: {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x1ceA84203673764244E05693e42E6Ace62bE9BA5",
    decimals: 8,
    logoURI: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
    chainId: BASE_CHAIN_ID
  },
  cbBTC: {
    symbol: "cbBTC",
    name: "Coinbase Wrapped Bitcoin",
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    decimals: 8,
    logoURI: "https://assets.coingecko.com/coins/images/33052/small/cbBTC_icon_yellowgradient.png",
    chainId: BASE_CHAIN_ID
  },
  cbETH: {
    symbol: "cbETH",
    name: "Coinbase Wrapped Ethereum",
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/27008/small/cbeth.png",
    chainId: BASE_CHAIN_ID
  },
  FRAX: {
    symbol: "FRAX",
    name: "Frax",
    address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/13422/small/frax_logo.png",
    chainId: BASE_CHAIN_ID
  },
  SUP: {
    symbol: "SUP",
    name: "Superfluid",
    address: "0x2740267Ef48ED3a8F2E9FA6A5De7F0e7E66e250c",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/21597/small/superfluid.png",
    chainId: BASE_CHAIN_ID
  },
  USDCx: {
    symbol: "USDCx",
    name: "Super USDC",
    address: "0x4dd8db0c491c475f1335e0eaa58ab8601f26c86f",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    chainId: BASE_CHAIN_ID
  },
  ETHx: {
    symbol: "ETHx",
    name: "Super ETH",
    address: "0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    chainId: BASE_CHAIN_ID
  },
  DAIx: {
    symbol: "DAIx",
    name: "Super DAI",
    address: "0x708169c8C87563Ce904E0a7F3BFC1F3b0b767f41",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png",
    chainId: BASE_CHAIN_ID
  },
  VEIL: {
    symbol: "VEIL",
    name: "Veil Cash",
    address: "0x27D2DECb4bFC9C76F0309b8E88dec3a601Fe25a8",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/18723/small/veil-logo.png",
    chainId: BASE_CHAIN_ID
  },
  AERO: {
    symbol: "AERO",
    name: "Aerodrome Finance",
    address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/31745/small/token.png",
    chainId: BASE_CHAIN_ID
  },
  DEGEN: {
    symbol: "DEGEN",
    name: "Degen",
    address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/34515/small/degen-logo.png",
    chainId: BASE_CHAIN_ID
  },
  BRETT: {
    symbol: "BRETT",
    name: "Brett",
    address: "0x532f27101965dd16442E59d40670FaF5eBB142E4",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/35529/small/brett-logo.png",
    chainId: BASE_CHAIN_ID
  },
  TOSHI: {
    symbol: "TOSHI",
    name: "Toshi",
    address: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/31126/small/toshi.png",
    chainId: BASE_CHAIN_ID
  },
  HIGHER: {
    symbol: "HIGHER",
    name: "Higher",
    address: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/36063/small/higher-logo.png",
    chainId: BASE_CHAIN_ID
  },
  rETH: {
    symbol: "rETH",
    name: "Rocket Pool ETH",
    address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/20764/small/reth.png",
    chainId: BASE_CHAIN_ID
  },
  wstETH: {
    symbol: "wstETH",
    name: "Wrapped stETH",
    address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/18834/small/wstETH.png",
    chainId: BASE_CHAIN_ID
  },
  AAVE: {
    symbol: "AAVE",
    name: "Aave",
    address: "0x18709E89BD403F470088aBDAcEbE86CC60dda12e",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
    chainId: BASE_CHAIN_ID
  },
  COMP: {
    symbol: "COMP",
    name: "Compound",
    address: "0x9e1028F5F1D5eDE59748FFceE5532509976840E0",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/10775/small/COMP.png",
    chainId: BASE_CHAIN_ID
  },
  UNI: {
    symbol: "UNI",
    name: "Uniswap",
    address: "0xc3De830EA07524a0761646a6a4e4be0e114a3C83",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
    chainId: BASE_CHAIN_ID
  },
  SNX: {
    symbol: "SNX",
    name: "Synthetix",
    address: "0x22e6966B799c4D5B13BE962E1D117b56327FDa66",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/3406/small/SNX.png",
    chainId: BASE_CHAIN_ID
  },
  SUSHI: {
    symbol: "SUSHI",
    name: "SushiSwap",
    address: "0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png",
    chainId: BASE_CHAIN_ID
  }
};

// Format amount with token decimals
export function formatTokenAmount(amount: string | number, decimals: number): string {
  const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
  return (amountNum / 10 ** decimals).toFixed(decimals > 8 ? 8 : decimals);
}

// Parse amount to token decimals
export function parseTokenAmount(amount: string | number, decimals: number): string {
  const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
  const multiplier = 10 ** decimals;
  return (amountNum * multiplier).toFixed(0);
}

/**
 * Secure client that proxies requests through edge function
 * to keep API key server-side only.
 */
export class ZeroXClient {
  constructor() {
    // No client-side API key needed - requests go through edge function
  }

  private async invokeProxy(payload: Record<string, unknown>): Promise<any> {
    const { data, error } = await supabase.functions.invoke('zerox-proxy', {
      body: payload,
    });

    if (error) {
      console.error('[ZeroXClient] Proxy error:', error);
      throw new Error(error.message || 'Failed to fetch from 0x API');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }

  // Get supported token list
  async getSupportedTokens(): Promise<Token[]> {
    try {
      const data = await this.invokeProxy({ endpoint: 'tokens' });
      return data.records || Object.values(BASE_TOKENS);
    } catch (error) {
      console.error("Failed to fetch supported tokens:", error);
      return Object.values(BASE_TOKENS); // Fallback to predefined tokens
    }
  }

  // Get price quote for token swap
  async getQuote(
    sellToken: string,
    buyToken: string,
    sellAmount: string
  ): Promise<PriceResponse | null> {
    try {
      return await this.invokeProxy({
        endpoint: 'price',
        sellToken,
        buyToken,
        sellAmount,
      });
    } catch (error) {
      console.error("Failed to fetch price quote:", error);
      return null;
    }
  }

  // Get swap quote with transaction data
  async getSwapQuote(
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    takerAddress?: string
  ): Promise<SwapQuoteResponse | null> {
    try {
      return await this.invokeProxy({
        endpoint: 'quote',
        sellToken,
        buyToken,
        sellAmount,
        takerAddress,
      });
    } catch (error) {
      console.error("Failed to fetch swap quote:", error);
      return null;
    }
  }
}

// Hook to use 0x API with BibleFi customizations (via secure proxy)
export function useZeroX() {
  const { toast } = useToast();

  // No API key on client side - all requests go through edge function
  const client = new ZeroXClient();

  const getTokenPrice = async (tokenSymbol: string): Promise<number | null> => {
    try {
      // Get price of token in USDC
      const token = BASE_TOKENS[tokenSymbol];
      if (!token) {
        throw new Error(`Token ${tokenSymbol} not supported`);
      }

      // Use 1 unit of the token as sell amount
      const sellAmount = parseTokenAmount("1", token.decimals);
      const quote = await client.getQuote(
        token.address,
        BASE_TOKENS.USDC.address,
        sellAmount
      );

      if (!quote) {
        return null;
      }

      // Format price as USD
      return parseFloat(formatTokenAmount(quote.price, BASE_TOKENS.USDC.decimals));
    } catch (error) {
      console.error(`Error getting price for ${tokenSymbol}:`, error);
      toast({
        title: "Price Fetch Error",
        description: `Could not get current price for ${tokenSymbol}.`,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    client,
    getTokenPrice,
    getSupportedTokens: client.getSupportedTokens.bind(client),
    getQuote: client.getQuote.bind(client),
    getSwapQuote: client.getSwapQuote.bind(client),
    baseTokens: BASE_TOKENS,
  };
}
