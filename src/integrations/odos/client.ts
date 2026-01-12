import { parseUnits } from 'ethers';

interface Token {
  symbol: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

interface SwapQuote {
  price: string;
  buyAmount: string;
  sellAmount: string;
  priceImpact: string;
  gasEstimate: string;
}

export class OdosClient {
  private tokens: Record<string, Token> = {
    'ETH': {
      symbol: 'ETH',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880'
    },
    'USDC': {
      symbol: 'USDC',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389'
    },
    'DAI': {
      symbol: 'DAI',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png?1636636734'
    },
    'USDT': {
      symbol: 'USDT',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707'
    }
  };

  /**
   * Get swap quote from Odos (mock implementation)
   */
  public async getSwapQuote(
    sellToken: string,
    buyToken: string,
    sellAmount: string
  ): Promise<SwapQuote | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!this.tokens[sellToken] || !this.tokens[buyToken]) {
        return null;
      }
      
      // Mock price calculations
      const sellTokenInfo = this.tokens[sellToken];
      const buyTokenInfo = this.tokens[buyToken];
      
      // Calculate mock price (would be replaced with actual Odos API call)
      let price;
      if (sellToken === 'ETH' && buyToken === 'USDC') {
        price = '1800'; // 1 ETH = 1800 USDC
      } else if (sellToken === 'USDC' && buyToken === 'ETH') {
        price = '0.00055'; // 1 USDC = 0.00055 ETH
      } else if (sellToken === 'USDC' && buyToken === 'DAI') {
        price = '0.99'; // 1 USDC = 0.99 DAI
      } else {
        price = '1'; // Default 1:1 for other pairs
      }
      
      // Calculate buy amount using native bigint
      const parsedAmount = BigInt(sellAmount);
      const priceUnits = parseUnits(price, buyTokenInfo.decimals);
      const sellUnits = parseUnits('1', sellTokenInfo.decimals);
      const buyAmount = (parsedAmount * priceUnits) / sellUnits;
      
      // Return mock quote
      return {
        price,
        buyAmount: buyAmount.toString(),
        sellAmount,
        priceImpact: '0.1',
        gasEstimate: '150000'
      };
    } catch (error) {
      console.error('Error getting Odos quote:', error);
      return null;
    }
  }

  /**
   * Get swap URL to Odos platform
   */
  public getSwapUrl(
    fromToken: string,
    toToken: string,
    amount: string
  ): string {
    return `https://app.odos.xyz/swap?from=${fromToken}&to=${toToken}&amount=${amount}`;
  }

  /**
   * Get available tokens
   */
  public getAvailableTokens(): Record<string, Token> {
    return this.tokens;
  }
}

export const odosClient = new OdosClient();
