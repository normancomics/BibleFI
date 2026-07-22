/**
 * SuperVault client — reads live vault state and builds non-custodial
 * deposit/redeem transactions for the Superfluid-native stable-yield vault.
 *
 * Reads always work (scoring/telemetry). Writes are gated behind
 * isSuperVaultLive() because the deployed vault is a technical demo; the
 * builders return standard { to, data, value } that the user's own wallet
 * signs — nothing here is custodial.
 */
import { Interface, parseUnits } from 'ethers';
import {
  SUPERVAULT_CONTRACTS,
  SUPERVAULT_CHAIN_ID,
  isSuperVaultLive,
} from '@/config/supervault';
import type { YieldOpportunity } from '@/services/bwsp/types';

// Base public RPCs (all CORS-open for browsers). Reads use raw JSON-RPC fetch
// (works in the browser where ethers' JsonRpcProvider does not reliably) and
// rotate across endpoints so a single rate-limited node doesn't zero the reads.
const BASE_RPCS = [
  'https://mainnet.base.org',
  'https://base-rpc.publicnode.com',
  'https://1rpc.io/base',
];

// Precomputed 4-byte selectors.
const SEL = {
  stableYieldRate: '0xa5414bd3',
  feeBps: '0xbf333f2c',
  totalManagedAssets: '0x05b2bfb0',
  balanceOf: '0x70a08231',
  previewRedeem: '0x4cdad506',
  receivedByMember: '0xdf9ad931',
  memberFlowRate: '0x539e8c1c',
} as const;

const ERC20_ABI = ['function approve(address spender, uint256 amount) returns (bool)'];
const VAULT_WRITE_ABI = [
  'function deposit(uint256 assets, address receiver) returns (uint256)',
  'function redeem(uint256 shares, address receiver, address owner) returns (uint256)',
];

function pad32(hexNo0x: string): string {
  return hexNo0x.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}
function encodeAddr(a: string): string {
  return pad32(a.replace(/^0x/, ''));
}
function encodeUint(v: bigint): string {
  return pad32(v.toString(16));
}
/** Raw eth_call, rotating across RPCs until one returns a real result. */
async function ethCall(to: string, data: string): Promise<string> {
  for (const rpc of BASE_RPCS) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] }),
      });
      const j = await res.json();
      if (typeof j.result === 'string' && j.result !== '0x') return j.result;
    } catch {
      // try next endpoint
    }
  }
  return '0x';
}
function toUint(hex: string): bigint {
  return hex && hex !== '0x' ? BigInt(hex) : 0n;
}
/** Two's-complement int96 from a 32-byte word. */
function toInt(hex: string): bigint {
  const n = toUint(hex);
  return n >= 1n << 95n ? n - (1n << 96n) : n;
}

export interface SuperVaultState {
  /** Promised stable yield rate (annual %, from stableYieldRate bps). */
  yieldRatePct: number;
  /** Protocol fee (%). */
  feePct: number;
  /** Reserve-inclusive NAV in USDC. */
  tvlUsd: number;
  live: boolean;
}

export interface SuperVaultPosition {
  shares: bigint;
  /** Redeemable value now, in USDC. */
  valueUsd: number;
  /** Yield streamed-so-far, in USDC-equivalent (from USDCx 18-dec). */
  earnedUsd: number;
  /** Current per-second stream, USDC-equivalent. */
  flowRatePerSec: number;
}

export class SuperVaultClient {
  isLive(): boolean {
    return isSuperVaultLive();
  }

  /** Live protocol-level state (rate, fee, TVL) via raw eth_call. */
  async getState(): Promise<SuperVaultState> {
    const fm = SUPERVAULT_CONTRACTS.fundManager;
    const [rate, fee, nav] = await Promise.all([
      ethCall(fm, SEL.stableYieldRate),
      ethCall(fm, SEL.feeBps),
      ethCall(fm, SEL.totalManagedAssets),
    ]);
    return {
      yieldRatePct: Number(toUint(rate)) / 100,
      feePct: Number(toUint(fee)) / 100,
      tvlUsd: Number(toUint(nav)) / 1e6,
      live: this.isLive(),
    };
  }

  /** A user's position + live streamed yield. */
  async getPosition(user: string): Promise<SuperVaultPosition> {
    const shares = toUint(await ethCall(SUPERVAULT_CONTRACTS.vault, SEL.balanceOf + encodeAddr(user)));
    const [valueHex, earnedHex, flowHex] = await Promise.all([
      shares > 0n
        ? ethCall(SUPERVAULT_CONTRACTS.vault, SEL.previewRedeem + encodeUint(shares))
        : Promise.resolve('0x'),
      ethCall(SUPERVAULT_CONTRACTS.yieldPool, SEL.receivedByMember + encodeAddr(user)),
      ethCall(SUPERVAULT_CONTRACTS.yieldPool, SEL.memberFlowRate + encodeAddr(user)),
    ]);
    return {
      shares,
      valueUsd: Number(toUint(valueHex)) / 1e6,
      earnedUsd: Number(toUint(earnedHex)) / 1e18, // USDCx is 18-dec
      flowRatePerSec: Number(toInt(flowHex)) / 1e18,
    };
  }

  /**
   * Build a SuperVault opportunity for BWTYA to score, from live on-chain
   * state (falls back to the vault's known static profile if reads fail).
   */
  async toYieldOpportunity(): Promise<YieldOpportunity> {
    let apy = 3;
    let tvlUsd = 0;
    try {
      const s = await this.getState();
      apy = s.yieldRatePct || 3;
      tvlUsd = s.tvlUsd;
    } catch { /* fall back to static profile */ }
    return {
      protocol: 'SuperVault',
      poolName: 'StableYieldSyncVault (USDC)',
      tokenSymbol: 'USDC',
      chain: 'base',
      apy,
      tvlUsd,
      // Conservative stable vault: low risk. Not audited (technical demo).
      riskScore: 28,
      category: 'stable-yield-streaming',
      biblicalAlignment:
        'Stable, transparent, real-time streaming yield — reserves and steady increase (Proverbs 21:20; 13:11).',
      isVerified: false,
      audited: false,
      transparent: true,
    };
  }

  // ── Non-custodial write builders (user wallet signs) ──────────────────────
  buildApprove(assetsHuman: string): { to: string; data: string } {
    const iface = new Interface(ERC20_ABI);
    return {
      to: SUPERVAULT_CONTRACTS.usdc,
      data: iface.encodeFunctionData('approve', [
        SUPERVAULT_CONTRACTS.vault,
        parseUnits(assetsHuman, 6),
      ]),
    };
  }

  buildDeposit(assetsHuman: string, receiver: string): { to: string; data: string } {
    const iface = new Interface(VAULT_WRITE_ABI);
    return {
      to: SUPERVAULT_CONTRACTS.vault,
      data: iface.encodeFunctionData('deposit', [parseUnits(assetsHuman, 6), receiver]),
    };
  }

  buildRedeem(shares: bigint, receiver: string, owner: string): { to: string; data: string } {
    const iface = new Interface(VAULT_WRITE_ABI);
    return {
      to: SUPERVAULT_CONTRACTS.vault,
      data: iface.encodeFunctionData('redeem', [shares, receiver, owner]),
    };
  }

  get chainId(): number {
    return SUPERVAULT_CHAIN_ID;
  }
}

export const superVaultClient = new SuperVaultClient();
