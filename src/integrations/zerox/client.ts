
/**
 * 0x Protocol API Integration
 * Documentation: https://0x.org/docs/introduction/0x-api-specification
 */
import { useToast } from "@/hooks/use-toast";

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

// Create a client to interact with 0x API
export class ZeroXClient {
  private apiKey: string;
  private baseUrl: string;
  private chainId: number;
  
  constructor(apiKey: string, chainId = BASE_CHAIN_ID) {
    this.apiKey = apiKey;
    this.chainId = chainId;
    this.baseUrl = "https://api.0x.org";
  }
  
  // Get supported token list
  async getSupportedTokens(): Promise<Token[]> {
    try {
      const response = await fetch(`${this.baseUrl}/swap/v1/tokens?chainId=${this.chainId}`, {
        headers: {
          "0x-api-key": this.apiKey
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching tokens:", error);
        return Object.values(BASE_TOKENS); // Fallback to predefined tokens
      }
      
      const data = await response.json();
      return data.records;
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
      const params = new URLSearchParams({
        sellToken,
        buyToken,
        sellAmount,
        chainId: this.chainId.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/swap/v1/price?${params}`, {
        headers: {
          "0x-api-key": this.apiKey
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching price:", error);
        return null;
      }
      
      return await response.json();
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
      const params = new URLSearchParams({
        sellToken,
        buyToken,
        sellAmount,
        chainId: this.chainId.toString()
      });
      
      if (takerAddress) {
        params.append("takerAddress", takerAddress);
      }
      
      const response = await fetch(`${this.baseUrl}/swap/v1/quote?${params}`, {
        headers: {
          "0x-api-key": this.apiKey
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching swap quote:", error);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch swap quote:", error);
      return null;
    }
  }
}

// Hook to use 0x API with Bible.fi customizations
export function useZeroX() {
  const { toast } = useToast();
  
  // Access the API key from server environment
  // This key is stored securely in Supabase Edge Functions
  const apiKey = "62f2a1b5-ee27-4423-962f-e84a2d40badb"; // This will be replaced with secure access
  const client = new ZeroXClient(apiKey);
  
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
