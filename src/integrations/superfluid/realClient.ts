/**
 * Superfluid client using direct contract calls (ethers v6 compatible)
 * Replaces @superfluid-finance/sdk-core to avoid ethers v5 BigNumber conflicts
 */

import { 
  Contract, 
  JsonRpcProvider, 
  BrowserProvider,
  formatUnits,
  parseUnits,
  ZeroAddress,
  type Signer,
  type Provider
} from 'ethers';

// Superfluid CFA V1 ABI (simplified for flow operations)
const CFA_V1_ABI = [
  'function createFlow(address token, address receiver, int96 flowRate, bytes userData) external returns (bool)',
  'function updateFlow(address token, address receiver, int96 flowRate, bytes userData) external returns (bool)',
  'function deleteFlow(address token, address sender, address receiver, bytes userData) external returns (bool)',
  'function getFlow(address token, address sender, address receiver) external view returns (uint256 timestamp, int96 flowRate, uint256 deposit, uint256 owedDeposit)',
  'function getNetFlow(address token, address account) external view returns (int96 flowRate)',
];

// Super Token ABI (simplified)
const SUPER_TOKEN_ABI = [
  'function upgrade(uint256 amount) external',
  'function downgrade(uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function getUnderlyingToken() external view returns (address)',
  'function realtimeBalanceOfNow(address account) external view returns (int256 availableBalance, uint256 deposit, uint256 owedDeposit, uint256 timestamp)',
];

// Superfluid Host ABI
const HOST_ABI = [
  'function callAgreement(address agreementClass, bytes callData, bytes userData) external returns (bytes memory returnedData)',
];

// Base chain Superfluid addresses
const SUPERFLUID_ADDRESSES = {
  host: '0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74',
  cfaV1: '0x19ba78B9cDB05A877718841c574325fdB53601bb',
};

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
  private cfaContract: Contract | null = null;
  private hostContract: Contract | null = null;
  private provider: Provider | null = null;
  private readonly BASE_CHAIN_ID = 8453;
  private readonly BASE_RPC_URL = "https://mainnet.base.org";
  private readonly BIBLE_TOKEN_ADDRESS = ZeroAddress;

  // Real Base chain Super Tokens
  private tokens: Record<string, SuperfluidToken> = {
    'USDCx': {
      name: 'Super USDC',
      symbol: 'USDCx',
      address: '0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529',
      underlyingToken: {
        symbol: 'USDC',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
      },
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    'ETHx': {
      name: 'Super ETH',
      symbol: 'ETHx',
      address: '0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93',
      underlyingToken: {
        symbol: 'ETH',
        address: '0x4200000000000000000000000000000000000006'
      },
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    },
    'DAIx': {
      name: 'Super DAI',
      symbol: 'DAIx',
      address: '0x7D60e4223A5C1e8A167aEF98a92a4B5C6889bE9C',
      underlyingToken: {
        symbol: 'DAI',
        address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'
      },
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png'
    },
    'BIBLEFIx': {
      name: 'Super BIBLEFI',
      symbol: 'BIBLEFIx',
      address: ZeroAddress, // Deploy pending — governance token
      underlyingToken: {
        symbol: 'BIBLEFI',
        address: ZeroAddress // Deploy pending
      },
      logoURI: '/bible-fi-preview.png'
    },
    'WISDOMx': {
      name: 'Super WISDOM',
      symbol: 'WISDOMx',
      address: ZeroAddress, // Deploy pending — rewards token
      underlyingToken: {
        symbol: 'WISDOM',
        address: ZeroAddress // Deploy pending
      },
      logoURI: '/bible-fi-preview.png'
    }
  };

  /**
   * Initialize the Superfluid contracts
   */
  public async initialize(signer?: Signer): Promise<void> {
    try {
      // Create provider for Base chain
      this.provider = new JsonRpcProvider(this.BASE_RPC_URL);

      // Initialize contracts with read-only provider
      this.cfaContract = new Contract(
        SUPERFLUID_ADDRESSES.cfaV1,
        CFA_V1_ABI,
        this.provider
      );

      this.hostContract = new Contract(
        SUPERFLUID_ADDRESSES.host,
        HOST_ABI,
        this.provider
      );

      console.log("Superfluid contracts initialized for Base chain (ethers v6)");
    } catch (error) {
      console.error("Failed to initialize Superfluid contracts:", error);
      throw error;
    }
  }

  /**
   * Encode flow operation for host.callAgreement
   */
  private encodeCreateFlowData(token: string, receiver: string, flowRate: bigint): string {
    const iface = new (new JsonRpcProvider('').constructor as any).Interface(CFA_V1_ABI);
    // For direct CFA calls, we use createFlow selector + encoded params
    const selector = '0x5d6df3a1'; // createFlow(address,address,int96,bytes) selector
    const encoder = new TextEncoder();
    const userData = '0x';
    
    // ABI encode the parameters
    const encodedParams = new Contract(ZeroAddress, CFA_V1_ABI).interface.encodeFunctionData(
      'createFlow',
      [token, receiver, flowRate, userData]
    ).slice(10); // Remove function selector
    
    return selector + encodedParams;
  }

  /**
   * Create a real Superfluid flow using direct contract call
   */
  public async createFlow(
    signer: Signer,
    receiver: string,
    tokenAddress: string,
    flowRate: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.cfaContract) {
        await this.initialize();
      }

      // Connect CFA contract to signer for write operations
      const cfaWithSigner = new Contract(
        SUPERFLUID_ADDRESSES.cfaV1,
        CFA_V1_ABI,
        signer
      );

      // Create flow directly on CFA
      const flowRateBigInt = BigInt(flowRate);
      const tx = await cfaWithSigner.createFlow(
        tokenAddress,
        receiver,
        flowRateBigInt,
        '0x' // Empty user data
      );

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt?.hash
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
    signer: Signer,
    receiver: string,
    tokenAddress: string,
    newFlowRate: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.cfaContract) {
        await this.initialize();
      }

      const cfaWithSigner = new Contract(
        SUPERFLUID_ADDRESSES.cfaV1,
        CFA_V1_ABI,
        signer
      );

      const flowRateBigInt = BigInt(newFlowRate);
      const tx = await cfaWithSigner.updateFlow(
        tokenAddress,
        receiver,
        flowRateBigInt,
        '0x'
      );

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt?.hash
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
    signer: Signer,
    receiver: string,
    tokenAddress: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.cfaContract) {
        await this.initialize();
      }

      const cfaWithSigner = new Contract(
        SUPERFLUID_ADDRESSES.cfaV1,
        CFA_V1_ABI,
        signer
      );

      const sender = await signer.getAddress();
      const tx = await cfaWithSigner.deleteFlow(
        tokenAddress,
        sender,
        receiver,
        '0x'
      );

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt?.hash
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
      if (!this.cfaContract) {
        await this.initialize();
      }

      if (!this.cfaContract) {
        throw new Error("CFA contract not initialized");
      }

      const flow = await this.cfaContract.getFlow(tokenAddress, sender, receiver);

      return {
        flowRate: flow.flowRate.toString(),
        deposit: flow.deposit.toString(),
        owedDeposit: flow.owedDeposit.toString()
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
    const monthlyWei = parseUnits(monthlyAmount.toString(), decimals);
    const secondsInMonth = 30n * 24n * 60n * 60n;
    const flowRateWei = monthlyWei / secondsInMonth;
    return flowRateWei.toString();
  }

  /**
   * Calculate flow rate from amount and period
   */
  public calculateFlowRateFromPeriod(amount: number, period: string, decimals: number = 18): string {
    let secondsInPeriod: bigint;
    
    switch (period) {
      case 'day':
        secondsInPeriod = 24n * 60n * 60n;
        break;
      case 'week':
        secondsInPeriod = 7n * 24n * 60n * 60n;
        break;
      case 'month':
      default:
        secondsInPeriod = 30n * 24n * 60n * 60n;
        break;
    }
    
    const amountWei = parseUnits(amount.toString(), decimals);
    const flowRate = amountWei / secondsInPeriod;
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
   * Create a tithing stream
   */
  public async createTithingStream(
    signer: Signer,
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

      const flowRate = this.calculateFlowRateFromPeriod(amount, period, 18);
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
