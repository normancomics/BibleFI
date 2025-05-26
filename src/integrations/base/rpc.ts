
/**
 * Base Chain RPC Integration for real blockchain data
 * Uses public Base RPC endpoints
 */

import { ethers } from 'ethers';

// Public Base RPC endpoints
const BASE_RPC_URLS = [
  'https://mainnet.base.org',
  'https://base-mainnet.g.alchemy.com/v2/demo',
  'https://base.blockpi.network/v1/rpc/public'
];

// Common Base chain token addresses
export const BASE_TOKEN_ADDRESSES = {
  ETH: '0x0000000000000000000000000000000000000000',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  WETH: '0x4200000000000000000000000000000000000006',
  USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'
};

// ERC20 ABI for token interactions
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)'
];

export class BaseRPCClient {
  private provider: ethers.providers.JsonRpcProvider;
  
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URLS[0]);
  }

  /**
   * Get ETH balance for an address
   */
  async getETHBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      return '0';
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  } | null> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals)
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '0.001'; // Default fallback
    }
  }

  /**
   * Get latest block number
   */
  async getLatestBlock(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting latest block:', error);
      return 0;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return null;
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: ethers.providers.TransactionRequest): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      return gasEstimate.toString();
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '21000'; // Default gas limit
    }
  }
}

export const baseRPCClient = new BaseRPCClient();

export function useBaseRPC() {
  return {
    getETHBalance: baseRPCClient.getETHBalance.bind(baseRPCClient),
    getTokenBalance: baseRPCClient.getTokenBalance.bind(baseRPCClient),
    getTokenInfo: baseRPCClient.getTokenInfo.bind(baseRPCClient),
    getGasPrice: baseRPCClient.getGasPrice.bind(baseRPCClient),
    getLatestBlock: baseRPCClient.getLatestBlock.bind(baseRPCClient),
    getTransactionReceipt: baseRPCClient.getTransactionReceipt.bind(baseRPCClient),
    estimateGas: baseRPCClient.estimateGas.bind(baseRPCClient)
  };
}
