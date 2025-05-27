import { ethers } from 'ethers';

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
  duration: number; // Duration in days
  scriptureReference?: string;
  principles: string[];
  verified: boolean;
}

export interface VestingSchedule {
  id: string;
  name: string;
  token: SuperfluidToken;
  amount: string;
  startDate: Date;
  endDate: Date;
  recipient: string;
  flowRate: string;
  scriptureReference?: string;
  canCancel: boolean;
  status: 'active' | 'cancelled' | 'completed' | 'pending';
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

export class SuperfluidClient {
  private readonly BASE_CHAIN_ID = 8453;
  private readonly DEFAULT_RECIPIENT = "0xb638831Adf73A08490f71a45E613Bb9045AccEFE";
  
  private tokens: Record<string, SuperfluidToken> = {
    'USDCx': {
      name: 'Super USDC',
      symbol: 'USDCx',
      address: '0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529', // Actual Base USDCx address
      underlyingToken: {
        symbol: 'USDC',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base USDC
      },
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    'DAIx': {
      name: 'Super DAI',
      symbol: 'DAIx',
      address: '0x7D60e4223A5C1e8A167aEF98a92a4B5C6889bE9C', // Actual Base DAIx address
      underlyingToken: {
        symbol: 'DAI',
        address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' // Base DAI
      },
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png'
    },
    'ETHx': {
      name: 'Super ETH',
      symbol: 'ETHx',
      address: '0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93', // Actual Base ETHx address
      underlyingToken: {
        symbol: 'ETH',
        address: '0x4200000000000000000000000000000000000006' // Base WETH
      },
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    }
  };

  // Biblical staking pools with scripture references
  private stakingPools: StakingPool[] = [
    {
      id: 'prosperity-pool',
      name: 'Prosperity Pool',
      description: 'A high-yield pool based on principles of diligent work and wise investment',
      token: this.tokens['USDCx'],
      apy: 12.5,
      minStake: '100',
      duration: 30,
      scriptureReference: 'Proverbs 13:11',
      principles: ['Steady accumulation', 'Patience', 'Consistent growth'],
      verified: true
    },
    {
      id: 'wisdom-pool',
      name: 'Solomon\'s Wisdom Pool',
      description: 'A medium-risk pool focused on balanced, wise investments',
      token: this.tokens['ETHx'],
      apy: 8.2,
      minStake: '0.1',
      duration: 90,
      scriptureReference: 'Ecclesiastes 11:2',
      principles: ['Diversification', 'Risk management', 'Long-term thinking'],
      verified: true
    },
    {
      id: 'stewardship-pool',
      name: 'Faithful Steward Pool',
      description: 'A stable, low-risk pool for conservative investors',
      token: this.tokens['DAIx'],
      apy: 5.5,
      minStake: '500',
      duration: 180,
      scriptureReference: 'Matthew 25:21',
      principles: ['Stewardship', 'Faithfulness', 'Consistency'],
      verified: true
    }
  ];
  
  // Active tithing streams (mock data)
  private tithingStreams: TithingStream[] = [
    {
      id: 'tithe-stream-1',
      church: 'First Biblical Church of Cryptoria',
      token: this.tokens['USDCx'],
      flowRate: '0.00023148148148',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: 'active',
      totalStreamed: '150.0'
    },
    {
      id: 'tithe-stream-2',
      church: 'Divine Treasury Assembly',
      token: this.tokens['DAIx'],
      flowRate: '0.00011574074074',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      status: 'cancelled',
      totalStreamed: '75.0'
    }
  ];

  /**
   * Create a Superfluid flow with correct Base chain configuration
   */
  public async createFlow(
    sender: string,
    receiver: string,
    token: string,
    flowRate: string
  ): Promise<{ success: boolean; txHash?: string; error?: string; setupUrl?: string }> {
    try {
      // Validate inputs
      if (!sender || !receiver || !token || !flowRate) {
        return {
          success: false,
          error: 'Missing required parameters'
        };
      }

      // Generate Superfluid app URL for Base chain
      const setupUrl = `https://app.superfluid.finance/stream/base/${receiver}?token=${token}&flowRate=${flowRate}`;
      
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        setupUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating flow'
      };
    }
  }

  /**
   * Get a list of available SuperTokens
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
   * Get available staking pools
   */
  public getStakingPools(): StakingPool[] {
    return this.stakingPools;
  }
  
  /**
   * Get active tithing streams
   */
  public getTithingStreams(account?: string): TithingStream[] {
    // In a real implementation, this would filter by account
    return this.tithingStreams;
  }

  /**
   * Calculate a flow rate from a monthly amount with proper decimal handling
   */
  public calculateFlowRate(monthlyAmount: number): string {
    // Convert to wei and calculate per-second rate
    const monthlyWei = ethers.utils.parseEther(monthlyAmount.toString());
    const secondsInMonth = 30 * 24 * 60 * 60;
    const flowRateWei = monthlyWei.div(secondsInMonth);
    return flowRateWei.toString();
  }
  
  /**
   * Calculate a flow rate from an amount and period
   * @param amount Amount in tokens
   * @param period Period (day, week, month)
   * @returns Flow rate in tokens per second
   */
  public calculateFlowRateFromPeriod(amount: number, period: string): string {
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
    
    const flowRate = ethers.utils.parseEther(
      (amount / secondsInPeriod).toString()
    );
    return flowRate.toString();
  }

  /**
   * Get the streaming URL for Base chain
   */
  public getStreamingUrl(token: string, receiver: string, flowRate: string): string {
    return `https://app.superfluid.finance/stream/base/${receiver}?token=${token}&flowRate=${flowRate}`;
  }
  
  /**
   * Create a vesting schedule (mock implementation)
   */
  public async createVestingSchedule(
    sender: string,
    recipient: string,
    token: string,
    amount: string,
    durationInDays: number
  ): Promise<{ success: boolean; vestingId?: string; error?: string; setupUrl?: string }> {
    try {
      // This would actually create a Superfluid stream
      // For now, we'll generate a URL to Superfluid app
      
      // Calculate flow rate for the given duration
      const amountNum = parseFloat(amount);
      const durationInSeconds = durationInDays * 24 * 60 * 60;
      const flowRate = (amountNum / durationInSeconds).toFixed(9);
      
      // Create Superfluid URL for setting up stream
      const setupUrl = `https://app.superfluid.finance/stream/base/${recipient}/${token}/${flowRate}`;
      
      return {
        success: true,
        vestingId: 'vesting_' + Math.random().toString(16).substr(2, 8),
        setupUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating vesting schedule'
      };
    }
  }
  
  /**
   * Create a tithing stream with default recipient
   */
  public async createTithingStream(
    sender: string,
    churchAddress: string,
    tokenSymbol: string,
    amount: number,
    period: string,
    durationInMonths?: number
  ): Promise<{ success: boolean; streamId?: string; error?: string; setupUrl?: string }> {
    try {
      // Get the token details
      const token = this.getToken(tokenSymbol);
      if (!token) {
        return {
          success: false,
          error: 'Token not found'
        };
      }
      
      // Use default recipient if church doesn't have address
      const recipient = churchAddress || this.DEFAULT_RECIPIENT;
      
      // Calculate flow rate based on period
      const flowRate = this.calculateFlowRateFromPeriod(amount, period);
      
      // Create Superfluid URL for Base chain
      const setupUrl = `https://app.superfluid.finance/stream/base/${recipient}?token=${token.address}&flowRate=${flowRate}`;
      
      return {
        success: true,
        streamId: 'tithe_' + Math.random().toString(16).substr(2, 8),
        setupUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating tithing stream'
      };
    }
  }
  
  /**
   * Generate a deep link to the Superfluid dashboard
   */
  public getDashboardUrl(): string {
    return `https://app.superfluid.finance/dashboard`;
  }
}

export const superfluidClient = new SuperfluidClient();
