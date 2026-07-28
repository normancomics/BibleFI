/**
 * Veil.cash integration for anonymous ZK tithing on Base.
 *
 * Veil Cash is a real privacy protocol on Base L2 (UTXO model, Poseidon +
 * Groth16). This client uses the VERIFIED live contract addresses and reads
 * real pool state on-chain.
 *
 * SAFETY CONTRACT
 * ───────────────
 * This client NEVER fabricates a transaction. In PREVIEW mode (the default —
 * see src/config/veil.ts) deposit()/withdraw() return { success:false,
 * preview:true } and no funds move. Real transfers only happen when the
 * deployment opts into live mode (VITE_VEIL_LIVE=true) AND the @veil-cash/sdk
 * is installed; even then, success is only reported after a confirmed on-chain
 * transaction hash. A donor is never told a tithe was sent unless it was.
 *
 * Docs: https://docs.veil.cash/  SDK: @veil-cash/sdk
 */

import { Contract, JsonRpcProvider } from 'ethers';
import {
  createBrowserProvider,
  keccak256,
  hexlify,
  randomBytes,
  concat,
  getBytes,
  type Provider,
  type Signer,
} from '@/lib/ethers-compat';
import {
  VEIL_ASSETS,
  VEIL_CHAIN_ID,
  VEIL_PROTOCOL_FEE_BPS,
  isVeilLive,
  type VeilAsset,
} from '@/config/veil';

// Kept for backwards-compat with existing UI; maps onto real assets/pools.
export type VeilDenomination = '0.1_ETH' | '1_ETH' | '10_ETH' | 'USDC_100' | 'USDC_1000';

const DENOMINATION_ASSET: Record<VeilDenomination, { asset: VeilAsset; amount: string; label: string }> = {
  '0.1_ETH': { asset: 'ETH', amount: '0.1', label: '0.1 ETH' },
  '1_ETH': { asset: 'ETH', amount: '1', label: '1 ETH' },
  '10_ETH': { asset: 'ETH', amount: '10', label: '10 ETH' },
  'USDC_100': { asset: 'USDC', amount: '100', label: '100 USDC' },
  'USDC_1000': { asset: 'USDC', amount: '1000', label: '1,000 USDC' },
};

interface VeilDepositResult {
  success: boolean;
  /** True when the call was a no-op because live mode is off (funds untouched). */
  preview?: boolean;
  txHash?: string;
  commitment?: string;
  note?: string;
  error?: string;
}

interface VeilWithdrawResult {
  success: boolean;
  preview?: boolean;
  txHash?: string;
  amount?: string;
  error?: string;
}

const PREVIEW_MESSAGE =
  'Anonymous giving via Veil is in preview on this deployment — no on-chain transfer was made and no funds moved. Enable VITE_VEIL_LIVE with the @veil-cash/sdk to send real anonymous tithes.';

// Minimal read ABI — nextIndex is the number of commitments (anonymity set).
const POOL_READ_ABI = [
  'function nextIndex() view returns (uint32)',
  'function getLastRoot() view returns (bytes32)',
];

export class VeilCashClient {
  private provider: Provider | null = null;
  private signer: Signer | null = null;

  readonly denominations: { value: VeilDenomination; label: string; amount: string }[] =
    (Object.keys(DENOMINATION_ASSET) as VeilDenomination[]).map((value) => ({
      value,
      label: DENOMINATION_ASSET[value].label,
      amount: DENOMINATION_ASSET[value].amount,
    }));

  /** True only when real transfers are enabled for this build. */
  isLive(): boolean {
    return isVeilLive();
  }

  async initialize(signer?: Signer): Promise<void> {
    if (signer) {
      this.signer = signer;
      this.provider = signer.provider || null;
    } else if (typeof window !== 'undefined' && (window as { ethereum?: unknown }).ethereum) {
      const browserProvider = createBrowserProvider((window as { ethereum?: unknown }).ethereum);
      this.provider = browserProvider;
      this.signer = await browserProvider.getSigner();
    }
  }

  /** Generate deposit secrets locally (real, harmless — used for the user's note). */
  generateCommitment(): { commitment: string; nullifier: string; secret: string } {
    const nullifier = hexlify(randomBytes(31));
    const secret = hexlify(randomBytes(31));
    const commitment = keccak256(concat([getBytes(nullifier), getBytes(secret)]));
    return { commitment, nullifier, secret };
  }

  createNote(denomination: VeilDenomination, nullifier: string, secret: string): string {
    const noteData = { denomination, nullifier, secret, network: 'base', timestamp: Date.now() };
    return `veil-note-${btoa(JSON.stringify(noteData))}`;
  }

  parseNote(note: string): { denomination: VeilDenomination; nullifier: string; secret: string } | null {
    try {
      if (!note.startsWith('veil-note-')) return null;
      const noteData = JSON.parse(atob(note.replace('veil-note-', '')));
      return { denomination: noteData.denomination, nullifier: noteData.nullifier, secret: noteData.secret };
    } catch {
      return null;
    }
  }

  /**
   * Deposit into a Veil privacy pool. In preview mode this is a no-op that
   * returns preview:true — it NEVER submits a transaction or moves funds.
   */
  async deposit(denomination: VeilDenomination): Promise<VeilDepositResult> {
    if (!this.isLive()) {
      return { success: false, preview: true, error: PREVIEW_MESSAGE };
    }
    if (!this.signer) {
      return { success: false, error: 'Wallet not connected' };
    }
    try {
      const adapter = await loadVeilSdk();
      if (!adapter) {
        return { success: false, preview: true, error: PREVIEW_MESSAGE };
      }
      const { asset, amount } = DENOMINATION_ASSET[denomination];
      // Delegate to the real SDK. Only report success on a confirmed tx hash.
      const res = await adapter.deposit({ signer: this.signer, asset, amount });
      if (!res?.txHash) {
        return { success: false, error: res?.error ?? 'Deposit did not confirm on-chain' };
      }
      return { success: true, txHash: res.txHash, commitment: res.commitment, note: res.note };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Deposit failed' };
    }
  }

  /**
   * Withdraw from a Veil pool to a recipient (church) address. Preview mode is
   * a no-op; live mode reports success only on a confirmed tx.
   */
  async withdraw(note: string, recipientAddress: string): Promise<VeilWithdrawResult> {
    if (!this.isLive()) {
      return { success: false, preview: true, error: PREVIEW_MESSAGE };
    }
    if (!this.signer) {
      return { success: false, error: 'Wallet not connected' };
    }
    const parsed = this.parseNote(note);
    if (!parsed) {
      return { success: false, error: 'Invalid note format' };
    }
    try {
      const adapter = await loadVeilSdk();
      if (!adapter) {
        return { success: false, preview: true, error: PREVIEW_MESSAGE };
      }
      const { asset, amount } = DENOMINATION_ASSET[parsed.denomination];
      const res = await adapter.withdraw({ signer: this.signer, asset, amount, note, recipient: recipientAddress });
      if (!res?.txHash) {
        return { success: false, error: res?.error ?? 'Withdrawal did not confirm on-chain' };
      }
      return { success: true, txHash: res.txHash, amount };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Withdrawal failed' };
    }
  }

  async getPendingDeposits(): Promise<Array<{ commitment: string; denomination: VeilDenomination; timestamp: number }>> {
    return [];
  }

  /**
   * Real anonymity-set size = number of commitments in the pool's merkle tree
   * (pool.nextIndex()). Returns null when it can't be read (UI shows "—" rather
   * than a fabricated number).
   */
  async getAnonymitySetSize(denomination: VeilDenomination): Promise<number | null> {
    const { asset } = DENOMINATION_ASSET[denomination];
    const pool = VEIL_ASSETS[asset].pool;
    try {
      const provider = this.provider ?? (await this.readProvider());
      if (!provider) return null;
      const contract = new Contract(pool, POOL_READ_ABI, provider);
      const idx = await contract.nextIndex();
      return Number(idx);
    } catch {
      return null;
    }
  }

  private async readProvider(): Promise<Provider | null> {
    try {
      return new JsonRpcProvider('https://mainnet.base.org');
    } catch {
      return null;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.provider) return false;
    try {
      const network = await this.provider.getNetwork();
      return Number(network.chainId) === VEIL_CHAIN_ID;
    } catch {
      return false;
    }
  }

  /** Estimated protocol fee for an amount (0.3%). */
  estimateFee(amount: number): number {
    return (amount * VEIL_PROTOCOL_FEE_BPS) / 10_000;
  }

  async estimateDepositGas(): Promise<string> {
    return '0.002';
  }
}

/**
 * Lazily load the real @veil-cash/sdk adapter. Uses a runtime dynamic import so
 * the default build never bundles the (heavy, snarkjs-based) SDK. Returns null
 * if the SDK isn't installed — callers then stay in preview mode.
 */
interface VeilSdkAdapter {
  deposit(args: { signer: Signer; asset: VeilAsset; amount: string }): Promise<{ txHash?: string; commitment?: string; note?: string; error?: string }>;
  withdraw(args: { signer: Signer; asset: VeilAsset; amount: string; note: string; recipient: string }): Promise<{ txHash?: string; error?: string }>;
}

let sdkAdapterPromise: Promise<VeilSdkAdapter | null> | null = null;

async function loadVeilSdk(): Promise<VeilSdkAdapter | null> {
  if (!sdkAdapterPromise) {
    sdkAdapterPromise = (async () => {
      try {
        // Real integration point (src/integrations/veil/sdkAdapter.ts). Wire
        // @veil-cash/sdk there; the adapter returns a real txHash only after
        // on-chain confirmation. Code-split so proving deps stay out of the
        // main bundle.
        const mod = await import('@/integrations/veil/sdkAdapter');
        return mod.veilSdkAdapter as VeilSdkAdapter;
      } catch {
        return null;
      }
    })();
  }
  return sdkAdapterPromise;
}

export const veilCashClient = new VeilCashClient();
