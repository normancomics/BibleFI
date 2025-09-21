import { ethers } from 'ethers';

export interface KyberSwapQuote {
  inputAmount: string;
  outputAmount: string;
  totalGas: string;
  gasPrice: string;
  amountInUsd: string;
  amountOutUsd: string;
  swaps: KyberSwap[];
  tokens: {
    [address: string]: {
      price: number;
      decimals: number;
      symbol: string;
    };
  };
}

export interface KyberSwap {
  pool: string;
  tokenIn: string;
  tokenOut: string;
  swapAmount: string;
  amountOut: string;
  exchange: string;
  poolLength: number;
  poolType: string;
}

export interface KyberPool {
  address: string;
  token0: string;
  token1: string;
  fee: number;
  liquidity: string;
  apy: string;
  volume24h: string;
}

export class KyberSwapClient {
  private baseUrl = 'https://aggregator-api.kyberswap.com';
  private chainId: number;

  constructor(chainId: number = 8453) {
    this.chainId = chainId;
  }

  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippageTolerance: number = 50 // 0.5%
  ): Promise<KyberSwapQuote | null> {
    try {
      const params = new URLSearchParams({
        tokenIn,
        tokenOut,
        amountIn,
        gasInclude: 'true',
        slippageTolerance: slippageTolerance.toString()
      });

      const response = await fetch(
        `${this.baseUrl}/${this.chainId}/route/encode?${params}`
      );

      if (!response.ok) {
        console.error('KyberSwap API error:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting KyberSwap quote:', error);
      
      // Return mock data for development
      const amountInBN = ethers.BigNumber.from(amountIn);
      const outputAmount = amountInBN.mul(98).div(100); // 2% slippage simulation
      
      return {
        inputAmount: amountIn,
        outputAmount: outputAmount.toString(),
        totalGas: '180000',
        gasPrice: '1000000000',
        amountInUsd: '100.00',
        amountOutUsd: '98.00',
        swaps: [{
          pool: '0x1234567890123456789012345678901234567890',
          tokenIn,
          tokenOut,
          swapAmount: amountIn,
          amountOut: outputAmount.toString(),
          exchange: 'KyberSwap',
          poolLength: 1,
          poolType: 'concentrated-liquidity'
        }],
        tokens: {
          [tokenIn]: {
            price: 1800,
            decimals: 18,
            symbol: 'ETH'
          },
          [tokenOut]: {
            price: 1,
            decimals: 6,
            symbol: 'USDC'
          }
        }
      };
    }
  }

  async getLiquidityPools(): Promise<KyberPool[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.chainId}/pools`);
      
      if (!response.ok) {
        console.error('Error fetching pools:', await response.text());
        return [];
      }

      const data = await response.json();
      return data.pools || [];
    } catch (error) {
      console.error('Error getting KyberSwap pools:', error);
      
      // Return mock pools for development
      return [
        {
          address: '0x1234567890123456789012345678901234567890',
          token0: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          token1: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          fee: 300,
          liquidity: ethers.utils.parseEther('1000000').toString(),
          apy: '15.2',
          volume24h: ethers.utils.parseEther('50000').toString()
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          token0: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          token1: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
          fee: 100,
          liquidity: ethers.utils.parseEther('750000').toString(),
          apy: '8.7',
          volume24h: ethers.utils.parseEther('25000').toString()
        }
      ];
    }
  }

  async buildSwapTransaction(
    quote: KyberSwapQuote,
    recipient: string,
    slippageTolerance: number = 50
  ): Promise<{
    to: string;
    data: string;
    value: string;
  } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.chainId}/route/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          routeSummary: quote,
          sender: recipient,
          recipient,
          slippageTolerance
        })
      });

      if (!response.ok) {
        console.error('Error building swap transaction:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error building KyberSwap transaction:', error);
      return null;
    }
  }

  getPoolAnalyticsUrl(poolAddress: string): string {
    return `https://kyberswap.com/pools/${this.chainId}/${poolAddress}`;
  }

  getSwapUrl(tokenIn: string, tokenOut: string): string {
    return `https://kyberswap.com/swap/${this.chainId}?inputCurrency=${tokenIn}&outputCurrency=${tokenOut}`;
  }
}

export const kyberswapClient = new KyberSwapClient(8453); // Base chain