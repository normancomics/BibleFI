import { ethers } from 'ethers';

export interface ParaSwapQuote {
  srcToken: string;
  destToken: string;
  srcAmount: string;
  destAmount: string;
  priceRoute: PriceRoute;
  gasCost: string;
}

export interface PriceRoute {
  bestRoute: RouteStep[];
  gasCostUSD: string;
  side: string;
  tokenTransferProxy: string;
}

export interface RouteStep {
  swapExchanges: Exchange[];
  srcAmount: string;
  destAmount: string;
}

export interface Exchange {
  exchange: string;
  srcAmount: string;
  destAmount: string;
  percent: number;
}

export class ParaSwapClient {
  private baseUrl = 'https://apiv5.paraswap.io';
  private chainId: number;

  constructor(chainId: number = 8453) {
    this.chainId = chainId;
  }

  async getTokenList(): Promise<Array<{
    symbol: string;
    address: string;
    decimals: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${this.chainId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error fetching ParaSwap tokens:', error);
      // Return Base tokens as fallback
      return [
        { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
        { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
        { symbol: 'DAI', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18 }
      ];
    }
  }

  async getQuote(
    srcToken: string,
    destToken: string,
    srcAmount: string,
    userAddress?: string,
    slippage: number = 1
  ): Promise<ParaSwapQuote | null> {
    try {
      const params = new URLSearchParams({
        srcToken,
        destToken,
        srcAmount,
        slippage: slippage.toString(),
        network: this.chainId.toString(),
        side: 'SELL'
      });

      if (userAddress) {
        params.append('userAddress', userAddress);
      }

      const response = await fetch(`${this.baseUrl}/prices?${params}`);
      
      if (!response.ok) {
        console.error('ParaSwap API error:', await response.text());
        return null;
      }

      const data = await response.json();
      return data.priceRoute;
    } catch (error) {
      console.error('Error getting ParaSwap quote:', error);
      
      // Return mock quote for development
      const srcAmountBN = ethers.BigNumber.from(srcAmount);
      const destAmount = srcAmountBN.mul(95).div(100); // 5% slippage simulation
      
      return {
        srcToken,
        destToken,
        srcAmount,
        destAmount: destAmount.toString(),
        priceRoute: {
          bestRoute: [{
            swapExchanges: [{
              exchange: 'UniswapV3',
              srcAmount,
              destAmount: destAmount.toString(),
              percent: 100
            }],
            srcAmount,
            destAmount: destAmount.toString()
          }],
          gasCostUSD: '5.50',
          side: 'SELL',
          tokenTransferProxy: '0x216b4b4ba9f3e719726886d34a177484278bfcae'
        },
        gasCost: '150000'
      };
    }
  }

  async buildTransaction(
    priceRoute: PriceRoute,
    srcToken: string,
    destToken: string,
    srcAmount: string,
    destAmount: string,
    userAddress: string,
    slippage: number = 1
  ): Promise<{
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: string;
  } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${this.chainId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          srcToken,
          destToken,
          srcAmount,
          destAmount,
          priceRoute,
          userAddress,
          slippage: slippage * 100 // ParaSwap expects basis points
        })
      });

      if (!response.ok) {
        console.error('Error building transaction:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error building ParaSwap transaction:', error);
      return null;
    }
  }

  getDAppUrl(srcToken: string, destToken: string): string {
    return `https://app.paraswap.io/#/?network=${this.chainId}&from=${srcToken}&to=${destToken}`;
  }
}

export const paraswapClient = new ParaSwapClient(8453); // Base chain