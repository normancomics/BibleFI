/**
 * Superfluid client using direct contract calls (ethers v6 compatible)
 * Replaces @superfluid-finance/sdk-core to avoid ethers v5 BigNumber conflicts
 * 
 * Flow: User has USDC → approve Super Token → upgrade to USDCx → createFlow
 * "Bring the whole tithe into the storehouse" — Malachi 3:10
 */

import { 
  Contract, 
  JsonRpcProvider, 
  formatUnits,
  parseUnits,
  ZeroAddress,
  type Signer,
  type Provider
} from 'ethers';

// Superfluid CFA V1 Forwarder ABI (preferred over raw CFA for user-facing calls)
const CFA_V1_ABI = [
  'function createFlow(address token, address receiver, int96 flowRate, bytes userData) external returns (bool)',
  'function updateFlow(address token, address receiver, int96 flowRate, bytes userData) external returns (bool)',
  'function deleteFlow(address token, address sender, address receiver, bytes userData) external returns (bool)',
  'function getFlow(address token, address sender, address receiver) external view returns (uint256 timestamp, int96 flowRate, uint256 deposit, uint256 owedDeposit)',
  'function getNetFlow(address token, address account) external view returns (int96 flowRate)',
];

// Super Token ABI — includes upgrade (wrap) and downgrade (unwrap)
const SUPER_TOKEN_ABI = [
  'function upgrade(uint256 amount) external',
  'function downgrade(uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function getUnderlyingToken() external view returns (address)',
  'function realtimeBalanceOfNow(address account) external view returns (int256 availableBalance, uint256 deposit, uint256 owedDeposit, uint256 timestamp)',
];

// Standard ERC-20 ABI for underlying token approval
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
];

// Base chain Superfluid addresses (verified on basescan.org)
const SUPERFLUID_ADDRESSES = {
  host: '0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74',
  cfaV1: '0x19ba78B9cDB05A877718841c574325fdB53601bb',
};

export interface SuperfluidToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number; // Super token decimals (always 18 for Superfluid)
  underlyingToken?: {
    symbol: string;
    address: string;
    decimals: number; // Underlying decimals (e.g., 6 for USDC, 18 for DAI)
  };
  logoURI?: string;
  deployed: boolean; // Whether this token is live on Base
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

export interface UpgradeResult {
  success: boolean;
  txHash?: string;
  amountUpgraded?: string;
  error?: string;
}

export class RealSuperfluidClient {
  private cfaContract: Contract | null = null;
  private provider: Provider | null = null;
  private readonly BASE_CHAIN_ID = 8453;
  private readonly BASE_RPC_URL = "https://mainnet.base.org";

  // Real Base chain Super Tokens with correct decimals
  private tokens: Record<string, SuperfluidToken> = {
    'USDCx': {
      name: 'Super USDC',
      symbol: 'USDCx',
      address: '0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529',
      decimals: 18, // Super tokens always 18
      underlyingToken: {
        symbol: 'USDC',
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6 // USDC on Base is 6 decimals
      },
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      deployed: true
    },
    'ETHx': {
      name: 'Super ETH',
      symbol: 'ETHx',
      address: '0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93',
      decimals: 18,
      underlyingToken: {
        symbol: 'ETH',
        address: '0x4200000000000000000000000000000000000006', // WETH on Base
        decimals: 18
      },
      logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      deployed: true
    },
    'DAIx': {
      name: 'Super DAI',
      symbol: 'DAIx',
      address: '0x7D60e4223A5C1e8A167aEF98a92a4B5C6889bE9C',
      decimals: 18,
      underlyingToken: {
        symbol: 'DAI',
        address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        decimals: 18
      },
      logoURI: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png',
      deployed: true
    },
    'BIBLEFIx': {
      name: 'Super BIBLEFI',
      symbol: 'BIBLEFIx',
      address: ZeroAddress, // Deploy pending — governance token
      decimals: 18,
      underlyingToken: {
        symbol: 'BIBLEFI',
        address: ZeroAddress,
        decimals: 18
      },
      logoURI: '/bible-fi-preview.png',
      deployed: false
    },
    'WISDOMx': {
      name: 'Super WISDOM',
      symbol: 'WISDOMx',
      address: ZeroAddress, // Deploy pending — rewards token
      decimals: 18,
      underlyingToken: {
        symbol: 'WISDOM',
        address: ZeroAddress,
        decimals: 18
      },
      logoURI: '/bible-fi-preview.png',
      deployed: false
    },
    // ── BibleFi Superfluid-native super tokens ───────────────────────────────
    // $xBIBLEFI: Superfluid Super Token wrapping $BIBLEFI for DAO treasury
    // streaming and real-time governance distributions.
    // Deployed via XBibleFiDeployer.deployXBIBLEFI(biblefiAddress)
    'xBIBLEFI': {
      name: 'BibleFi Governance Super Token',
      symbol: 'xBIBLEFI',
      address: ZeroAddress, // Updated after XBibleFiDeployer.deployXBIBLEFI()
      decimals: 18,
      underlyingToken: {
        symbol: 'BIBLEFI',
        address: ZeroAddress, // Updated after BibleFiGovernanceToken deployment
        decimals: 18
      },
      logoURI: '/bible-fi-preview.png',
      deployed: false
    },
    // $xWISDOM: Superfluid Super Token wrapping $WISDOM — VIP LP token for
    // loyal $WISDOM holders with tiered streaming rewards (Bronze → Solomon).
    // Deployed via XWisdomDeployer.deployXWISDOM(wisdomAddress)
    'xWISDOM': {
      name: 'BibleFi Wisdom Super Token',
      symbol: 'xWISDOM',
      address: ZeroAddress, // Updated after XWisdomDeployer.deployXWISDOM()
      decimals: 18,
      underlyingToken: {
        symbol: 'WISDOM',
        address: ZeroAddress, // Updated after WisdomRewardsToken deployment
        decimals: 18
      },
      logoURI: '/bible-fi-preview.png',
      deployed: false
    }
  };

  /**
   * Initialize the Superfluid contracts (read-only provider for queries)
   */
  public async initialize(signer?: Signer): Promise<void> {
    try {
      this.provider = new JsonRpcProvider(this.BASE_RPC_URL);

      this.cfaContract = new Contract(
        SUPERFLUID_ADDRESSES.cfaV1,
        CFA_V1_ABI,
        this.provider
      );

      console.log("[Superfluid] Contracts initialized for Base chain (ethers v6)");
    } catch (error) {
      console.error("[Superfluid] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Check user's underlying token balance (e.g., USDC)
   */
  public async getUnderlyingBalance(
    signer: Signer,
    tokenSymbol: string
  ): Promise<{ balance: bigint; formatted: string; decimals: number }> {
    const token = this.getToken(tokenSymbol);
    if (!token?.underlyingToken || token.underlyingToken.address === ZeroAddress) {
      return { balance: 0n, formatted: '0', decimals: 18 };
    }

    const erc20 = new Contract(token.underlyingToken.address, ERC20_ABI, signer);
    const address = await signer.getAddress();
    const balance = await erc20.balanceOf(address);
    const decimals = token.underlyingToken.decimals;

    return {
      balance,
      formatted: formatUnits(balance, decimals),
      decimals
    };
  }

  /**
   * Check user's Super Token balance (e.g., USDCx)
   */
  public async getSuperTokenBalance(
    signer: Signer,
    tokenSymbol: string
  ): Promise<{ balance: bigint; formatted: string }> {
    const token = this.getToken(tokenSymbol);
    if (!token || token.address === ZeroAddress) {
      return { balance: 0n, formatted: '0' };
    }

    const superToken = new Contract(token.address, SUPER_TOKEN_ABI, signer);
    const address = await signer.getAddress();
    const balance = await superToken.balanceOf(address);

    return {
      balance,
      formatted: formatUnits(balance, 18) // Super tokens always 18 decimals
    };
  }

  /**
   * Get realtime balance (accounts for active streams draining balance)
   */
  public async getRealtimeBalance(
    signer: Signer,
    tokenSymbol: string
  ): Promise<{ availableBalance: bigint; deposit: bigint; formatted: string } | null> {
    const token = this.getToken(tokenSymbol);
    if (!token || token.address === ZeroAddress) return null;

    try {
      const superToken = new Contract(token.address, SUPER_TOKEN_ABI, signer);
      const address = await signer.getAddress();
      const result = await superToken.realtimeBalanceOfNow(address);

      return {
        availableBalance: result.availableBalance,
        deposit: result.deposit,
        formatted: formatUnits(result.availableBalance, 18)
      };
    } catch (error) {
      console.error("[Superfluid] Error getting realtime balance:", error);
      return null;
    }
  }

  /**
   * Step 1: Approve underlying token for Super Token wrapper
   * e.g., approve USDCx contract to spend user's USDC
   */
  public async approveUnderlying(
    signer: Signer,
    tokenSymbol: string,
    amount: bigint
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const token = this.getToken(tokenSymbol);
    if (!token?.underlyingToken || token.underlyingToken.address === ZeroAddress) {
      return { success: false, error: `Token ${tokenSymbol} not deployed yet` };
    }

    try {
      const erc20 = new Contract(token.underlyingToken.address, ERC20_ABI, signer);
      const address = await signer.getAddress();

      // Check existing allowance
      const currentAllowance = await erc20.allowance(address, token.address);
      if (currentAllowance >= amount) {
        console.log("[Superfluid] Sufficient allowance already set");
        return { success: true };
      }

      console.log(`[Superfluid] Approving ${formatUnits(amount, token.underlyingToken.decimals)} ${token.underlyingToken.symbol} for ${tokenSymbol}`);
      const tx = await erc20.approve(token.address, amount);
      const receipt = await tx.wait();

      return { success: true, txHash: receipt?.hash };
    } catch (error) {
      console.error("[Superfluid] Approval error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Approval failed'
      };
    }
  }

  /**
   * Step 2: Upgrade (wrap) underlying tokens to Super Tokens
   * e.g., USDC → USDCx
   * 
   * IMPORTANT: For tokens with different decimals (USDC=6, USDCx=18),
   * the upgrade() function expects the amount in UNDERLYING decimals.
   * Superfluid's wrapper contract handles the decimal scaling internally.
   */
  public async upgradeToSuperToken(
    signer: Signer,
    tokenSymbol: string,
    underlyingAmount: bigint
  ): Promise<UpgradeResult> {
    const token = this.getToken(tokenSymbol);
    if (!token || token.address === ZeroAddress) {
      return { success: false, error: `Token ${tokenSymbol} not deployed yet` };
    }

    try {
      const superToken = new Contract(token.address, SUPER_TOKEN_ABI, signer);

      console.log(`[Superfluid] Upgrading ${formatUnits(underlyingAmount, token.underlyingToken?.decimals ?? 18)} ${token.underlyingToken?.symbol} → ${tokenSymbol}`);
      const tx = await superToken.upgrade(underlyingAmount);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt?.hash,
        amountUpgraded: formatUnits(underlyingAmount, token.underlyingToken?.decimals ?? 18)
      };
    } catch (error) {
      console.error("[Superfluid] Upgrade error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upgrade to Super Token failed'
      };
    }
  }

  /**
   * Full pipeline: Approve + Upgrade + Create Flow
   * This is the "Grandma Test" method — one call does everything.
   * 
   * @param signer - User's wallet signer
   * @param receiver - Church wallet address
   * @param tokenSymbol - Super token symbol (e.g., 'USDCx')
   * @param monthlyAmount - Amount per month in human-readable units (e.g., 100 for $100/month)
   * @param streamDurationMonths - How many months of buffer to wrap (default 3)
   */
  public async createTithingStreamFull(
    signer: Signer,
    receiver: string,
    tokenSymbol: string,
    monthlyAmount: number,
    streamDurationMonths: number = 3
  ): Promise<{ success: boolean; streamId?: string; txHash?: string; error?: string; steps?: string[] }> {
    const token = this.getToken(tokenSymbol);
    if (!token || token.address === ZeroAddress) {
      return { success: false, error: `Token ${tokenSymbol} is not yet deployed on Base` };
    }
    if (!token.deployed) {
      return { success: false, error: `${tokenSymbol} is coming soon — use USDCx, ETHx, or DAIx for now` };
    }

    const steps: string[] = [];
    const underlyingDecimals = token.underlyingToken?.decimals ?? 18;

    try {
      // Calculate total amount to wrap (monthly × duration buffer)
      const totalAmount = monthlyAmount * streamDurationMonths;
      const underlyingAmountBN = parseUnits(totalAmount.toString(), underlyingDecimals);

      // Step 1: Check underlying balance
      const { balance: underlyingBal } = await this.getUnderlyingBalance(signer, tokenSymbol);
      if (underlyingBal < underlyingAmountBN) {
        const have = formatUnits(underlyingBal, underlyingDecimals);
        const need = totalAmount.toString();
        return {
          success: false,
          error: `Insufficient ${token.underlyingToken?.symbol} balance. You have ${have} but need ${need} (${streamDurationMonths} months buffer).`,
          steps
        };
      }
      steps.push(`✓ Balance check: ${formatUnits(underlyingBal, underlyingDecimals)} ${token.underlyingToken?.symbol}`);

      // Step 2: Check if we already have enough Super Tokens
      const { balance: superBal } = await this.getSuperTokenBalance(signer, tokenSymbol);
      // Convert monthly amount to 18-decimal Super Token scale for comparison
      const neededSuperTokens = parseUnits(totalAmount.toString(), 18);

      if (superBal < neededSuperTokens) {
        // Need to wrap more tokens
        // Step 2a: Approve underlying
        const approveResult = await this.approveUnderlying(signer, tokenSymbol, underlyingAmountBN);
        if (!approveResult.success) {
          return { ...approveResult, steps };
        }
        steps.push(`✓ Approved ${totalAmount} ${token.underlyingToken?.symbol} for wrapping`);

        // Step 2b: Upgrade (wrap) to Super Token
        const upgradeResult = await this.upgradeToSuperToken(signer, tokenSymbol, underlyingAmountBN);
        if (!upgradeResult.success) {
          return { success: false, error: upgradeResult.error, steps };
        }
        steps.push(`✓ Wrapped ${totalAmount} ${token.underlyingToken?.symbol} → ${tokenSymbol}`);
      } else {
        steps.push(`✓ Sufficient ${tokenSymbol} balance already available`);
      }

      // Step 3: Calculate flow rate (always in 18 decimals for Super Tokens)
      const flowRate = this.calculateFlowRate(monthlyAmount, 18);
      steps.push(`✓ Flow rate: ${flowRate} wei/sec (~$${monthlyAmount}/month)`);

      // Step 4: Create the flow
      const flowResult = await this.createFlow(signer, receiver, token.address, flowRate);
      if (!flowResult.success) {
        return { success: false, error: flowResult.error, steps };
      }

      steps.push(`✓ Tithing stream created to ${receiver.slice(0, 6)}...${receiver.slice(-4)}`);

      return {
        success: true,
        streamId: 'tithe_' + Date.now().toString(16),
        txHash: flowResult.txHash,
        steps
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating tithing stream',
        steps
      };
    }
  }

  /**
   * Create a Superfluid flow (low-level — assumes user already has Super Tokens)
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

      const cfaWithSigner = new Contract(
        SUPERFLUID_ADDRESSES.cfaV1,
        CFA_V1_ABI,
        signer
      );

      const flowRateBigInt = BigInt(flowRate);
      console.log(`[Superfluid] Creating flow: ${flowRate} wei/sec to ${receiver}`);

      const tx = await cfaWithSigner.createFlow(
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
      console.error("[Superfluid] Error creating flow:", error);
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

      const tx = await cfaWithSigner.updateFlow(
        tokenAddress,
        receiver,
        BigInt(newFlowRate),
        '0x'
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt?.hash };
    } catch (error) {
      console.error("[Superfluid] Error updating flow:", error);
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
      return { success: true, txHash: receipt?.hash };
    } catch (error) {
      console.error("[Superfluid] Error deleting flow:", error);
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
      console.error("[Superfluid] Error getting flow:", error);
      return null;
    }
  }

  /**
   * Calculate flow rate from monthly amount (Super Token = 18 decimals always)
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
   * Get only deployed (usable) tokens
   */
  public getDeployedTokens(): SuperfluidToken[] {
    return Object.values(this.tokens).filter(t => t.deployed);
  }

  /**
   * Get all tokens (including pending deployment)
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
   * Legacy createTithingStream — delegates to full pipeline
   */
  public async createTithingStream(
    signer: Signer,
    churchAddress: string,
    tokenSymbol: string,
    amount: number,
    period: string
  ): Promise<{ success: boolean; streamId?: string; txHash?: string; error?: string }> {
    // Convert period amount to monthly equivalent
    let monthlyAmount = amount;
    switch (period) {
      case 'day':
        monthlyAmount = amount * 30;
        break;
      case 'week':
        monthlyAmount = amount * 4.33;
        break;
      case 'month':
      default:
        monthlyAmount = amount;
        break;
    }

    return this.createTithingStreamFull(signer, churchAddress, tokenSymbol, monthlyAmount);
  }
}

export const realSuperfluidClient = new RealSuperfluidClient();
