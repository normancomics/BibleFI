/**
 * SuperBoring client — reads TOREX DCA markets and builds non-custodial
 * DCA open/stop transactions.
 *
 * DCA open (per docs/integrate): SBMacro.getParams(...) → bytes, then
 * MacroForwarder.runMacro(SBMacro, params) opens the Superfluid stream into the
 * TOREX. DCA stop: CFAv1Forwarder.deleteFlow(inToken, sender, torex).
 *
 * Reads always work (scoring). Writes are gated behind isSuperBoringLive();
 * the builders return standard { to, data } that the user's wallet signs —
 * nothing here is custodial.
 */
import { Interface } from 'ethers';
import {
  SUPERBORING_CONTRACTS,
  SUPERBORING_CHAIN_ID,
  TOREX_MARKETS,
  isSuperBoringLive,
  type TorexMarket,
} from '@/config/superboring';
import type { YieldOpportunity } from '@/services/bwsp/types';

const BASE_RPCS = [
  'https://mainnet.base.org',
  'https://base-rpc.publicnode.com',
  'https://1rpc.io/base',
];

const IFACE = new Interface([
  'function getPairedTokens() view returns (address inToken, address outToken)',
  'function getParams(address torexAddr, int96 flowRate, address distributor, address referrer, uint256 upgradeAmount) pure returns (bytes)',
  'function runMacro(address macro, bytes params)',
  'function deleteFlow(address token, address sender, address receiver, bytes userData) returns (bool)',
]);

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
    } catch { /* next endpoint */ }
  }
  return '0x';
}

export interface TorexPair {
  inToken: string;
  outToken: string;
}

export class SuperBoringClient {
  readonly markets: TorexMarket[] = TOREX_MARKETS;

  isLive(): boolean {
    return isSuperBoringLive();
  }

  /** Read a TOREX market's in/out super tokens (confirms the market is live). */
  async getPairedTokens(torex: string): Promise<TorexPair | null> {
    const data = IFACE.encodeFunctionData('getPairedTokens', []);
    const res = await ethCall(torex, data);
    if (res === '0x') return null;
    try {
      const [inToken, outToken] = IFACE.decodeFunctionResult('getPairedTokens', res);
      return { inToken, outToken };
    } catch {
      return null;
    }
  }

  /**
   * Build the encoded DCA params via SBMacro.getParams (a pure fn, read on-chain).
   * flowRate is int96 wei/sec of the in-token super token. upgradeAmount is how
   * much underlying to wrap up-front (0 to skip). referrer/distributor optional.
   */
  async getDcaParams(opts: {
    torex: string;
    flowRate: bigint;
    upgradeAmount?: bigint;
    referrer?: string;
    distributor?: string;
  }): Promise<string | null> {
    const zero = '0x0000000000000000000000000000000000000000';
    const data = IFACE.encodeFunctionData('getParams', [
      opts.torex,
      opts.flowRate,
      opts.distributor ?? zero,
      opts.referrer ?? zero,
      opts.upgradeAmount ?? 0n,
    ]);
    const res = await ethCall(SUPERBORING_CONTRACTS.sbMacro, data);
    if (res === '0x') return null;
    try {
      const [params] = IFACE.decodeFunctionResult('getParams', res);
      return params as string;
    } catch {
      return null;
    }
  }

  /** Build the runMacro tx that opens the DCA stream (user wallet signs). */
  buildDcaOpen(params: string): { to: string; data: string } {
    return {
      to: SUPERBORING_CONTRACTS.macroForwarder,
      data: IFACE.encodeFunctionData('runMacro', [SUPERBORING_CONTRACTS.sbMacro, params]),
    };
  }

  /** Build the CFAv1Forwarder.deleteFlow tx that stops a DCA position. */
  buildDcaStop(inToken: string, sender: string, torex: string): { to: string; data: string } {
    return {
      to: SUPERBORING_CONTRACTS.cfaForwarder,
      data: IFACE.encodeFunctionData('deleteFlow', [inToken, sender, torex, '0x']),
    };
  }

  /**
   * Expose SuperBoring DCA markets as BWTYA-scorable opportunities. DCA is a
   * biblical stewardship strategy (Proverbs 13:11), so these read as steady,
   * transparent, Superfluid-native accumulation rails rather than yield pools.
   */
  toDcaOpportunities(): YieldOpportunity[] {
    return this.markets.map((m) => ({
      protocol: 'SuperBoring',
      poolName: `DCA ${m.label}`,
      tokenSymbol: m.inSymbol.replace(/x$/, ''),
      chain: 'base',
      // DCA is an accumulation strategy, not a yield rate; model a modest
      // effective benefit (BORING + SUP emissions + entry optimisation).
      apy: 0,
      tvlUsd: 0,
      riskScore: 35,
      category: 'streaming-dca',
      biblicalAlignment:
        'Gather little by little (Proverbs 13:11) — steady, disciplined, real-time accumulation with no lump-sum timing risk.',
      isVerified: false,
      audited: true, // Superfluid TOREX contracts are audited
      transparent: true,
    }));
  }

  get chainId(): number {
    return SUPERBORING_CHAIN_ID;
  }
}

export const superBoringClient = new SuperBoringClient();
