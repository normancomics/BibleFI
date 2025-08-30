import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";

export interface SuperfluidToken {
  name: string;
  symbol: string;
  address: string;
  underlyingToken?: {
    symbol: string;
    address: string;
  };
  logoURI?: string;
}

export interface StakingPool {
  id: string;
  name: string;
  description: string;
  token: SuperfluidToken;
  totalStaked?: string;
  apy: number;
  minStake: string;
  duration: number;
  scriptureReference?: string;
  principles: string[];
  verified: boolean;
}

export interface TithingStream {
  id: string;
  church: string;
  token: SuperfluidToken;
  flowRate: string;
  startDate: Date;
  endDate?: Date;
  totalStreamed?: string;
  status: 'active' | 'cancelled' | 'completed';
}

export class RealSuperfluidClient {
  private framework: Framework | null = null;
  private provider: ethers.providers.Provider | null = null;
  private readonly BASE_CHAIN_ID = 8453;
  private readonly BASE_RPC_URL = "https://mainnet.base.org";

  // Real Base chain Super Tokens
  private tokens: Record<string, SuperfluidToken> = {
    'USDCx': {
      name: 'Super USDC',
      symbol: 'USDCx',
      address: '0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529', // Real USDCx on Base
      underlyingToken: {
        symbol: 'USDC',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
      },
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    'ETHx': {
      name: 'Super ETH',
      symbol: 'ETHx',
      address: '0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93', // Real ETHx on Base
      underlyingToken: {
        symbol: 'ETH',
        address: '0x4200000000000000000000000000000000000006'
      },
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    },
    'DAIx': {
      name: 'Super DAI',
      symbol: 'DAIx',
      address: '0x7D60e4223A5C1e8A167aEF98a92a4B5C6889bE9C', // Real DAIx on Base
      underlyingToken: {
        symbol: 'DAI',
        address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'
      },
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png'
    }
  };

  /**
   * Initialize the Superfluid Framework
   */
  public async initialize(signer?: ethers.Signer): Promise<void> {
    try {
      // Create provider for Base chain
      this.provider = new ethers.providers.JsonRpcProvider(this.BASE_RPC_URL);

      // Initialize Superfluid Framework
      this.framework = await Framework.create({
        chainId: this.BASE_CHAIN_ID,
        provider: this.provider,
        resolverAddress: undefined, // Use default resolver for Base
        protocolReleaseVersion: "v1"
      });

      console.log("Superfluid Framework initialized for Base chain");
    } catch (error) {
      console.error("Failed to initialize Superfluid Framework:", error);
      throw error;
    }
  }

  /**
   * Create a real Superfluid flow
   */
  public async createFlow(
    signer: ethers.Signer,
    receiver: string,
    tokenAddress: string,
    flowRate: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.framework) {
        await this.initialize();
      }

      if (!this.framework) {
        throw new Error("Framework not initialized");
      }

      // Get the Super Token
      const superToken = await this.framework.loadSuperToken(tokenAddress);

      // Create flow operation
      const createFlowOperation = superToken.createFlow({
        sender: await signer.getAddress(),
        receiver: receiver,
        flowRate: flowRate
      });

      // Execute the transaction
      const txn = await createFlowOperation.exec(signer);
      const receipt = await txn.wait();

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Error creating flow:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating flow'
      };
    }
  }

  /**
   * Update an existing flow
   */
  public async updateFlow(
    signer: ethers.Signer,
    receiver: string,
    tokenAddress: string,
    newFlowRate: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.framework) {
        await this.initialize();
      }

      if (!this.framework) {
        throw new Error("Framework not initialized");
      }

      const superToken = await this.framework.loadSuperToken(tokenAddress);

      const updateFlowOperation = superToken.updateFlow({
        sender: await signer.getAddress(),
        receiver: receiver,
        flowRate: newFlowRate
      });

      const txn = await updateFlowOperation.exec(signer);
      const receipt = await txn.wait();

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Error updating flow:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating flow'
      };
    }
  }

  /**
   * Delete a flow
   */
  public async deleteFlow(
    signer: ethers.Signer,
    receiver: string,
    tokenAddress: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.framework) {
        await this.initialize();
      }

      if (!this.framework) {
        throw new Error("Framework not initialized");
      }

      const superToken = await this.framework.loadSuperToken(tokenAddress);

      const deleteFlowOperation = superToken.deleteFlow({
        sender: await signer.getAddress(),
        receiver: receiver
      });

      const txn = await deleteFlowOperation.exec(signer);
      const receipt = await txn.wait();

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Error deleting flow:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error deleting flow'
      };
    }
  }

  /**
   * Get flow info between sender and receiver
   */
  public async getFlow(
    sender: string,
    receiver: string,
    tokenAddress: string
  ): Promise<{ flowRate: string; deposit: string; owedDeposit: string } | null> {
    try {
      if (!this.framework) {
        await this.initialize();
      }

      if (!this.framework) {
        throw new Error("Framework not initialized");
      }

      const superToken = await this.framework.loadSuperToken(tokenAddress);
      const flow = await superToken.getFlow({
        sender,
        receiver,
        providerOrSigner: this.provider!
      });

      return {
        flowRate: flow.flowRate,
        deposit: flow.deposit,
        owedDeposit: flow.owedDeposit
      };
    } catch (error) {
      console.error("Error getting flow:", error);
      return null;
    }
  }

  /**
   * Calculate flow rate from monthly amount
   */
  public calculateFlowRate(monthlyAmount: number, decimals: number = 18): string {
    const monthlyWei = ethers.utils.parseUnits(monthlyAmount.toString(), decimals);
    const secondsInMonth = 30 * 24 * 60 * 60;
    const flowRateWei = monthlyWei.div(secondsInMonth);
    return flowRateWei.toString();
  }

  /**
   * Calculate flow rate from amount and period
   */
  public calculateFlowRateFromPeriod(amount: number, period: string, decimals: number = 18): string {
    let secondsInPeriod: number;
    
    switch (period) {
      case 'day':
        secondsInPeriod = 24 * 60 * 60;
        break;
      case 'week':
        secondsInPeriod = 7 * 24 * 60 * 60;
        break;
      case 'month':
      default:
        secondsInPeriod = 30 * 24 * 60 * 60;
        break;
    }
    
    const flowRate = ethers.utils.parseUnits(
      (amount / secondsInPeriod).toString(),
      decimals
    );
    return flowRate.toString();
  }

  /**
   * Get available tokens
   */
  public getAvailableTokens(): SuperfluidToken[] {
    return Object.values(this.tokens);
  }

  /**
   * Get token by symbol
   */
  public getToken(symbol: string): SuperfluidToken | null {
    return this.tokens[symbol] || null;
  }

  /**
   * Create a tithing stream with real Superfluid integration
   */
  public async createTithingStream(
    signer: ethers.Signer,
    churchAddress: string,
    tokenSymbol: string,
    amount: number,
    period: string
  ): Promise<{ success: boolean; streamId?: string; txHash?: string; error?: string }> {
    try {
      const token = this.getToken(tokenSymbol);
      if (!token) {
        return {
          success: false,
          error: 'Token not found'
        };
      }

      // Calculate flow rate
      const flowRate = this.calculateFlowRateFromPeriod(amount, period, 18);

      // Create the actual flow
      const result = await this.createFlow(signer, churchAddress, token.address, flowRate);

      if (result.success) {
        return {
          success: true,
          streamId: 'tithe_' + Math.random().toString(16).substr(2, 8),
          txHash: result.txHash
        };
      } else {
        return result;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating tithing stream'
      };
    }
  }
}

export const realSuperfluidClient = new RealSuperfluidClient();