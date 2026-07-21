/**
 * Real Veil.cash SDK integration point.
 *
 * This is where the live @veil-cash/sdk gets wired in. It is loaded lazily
 * (only when VITE_VEIL_LIVE=true) so the heavy snarkjs/circomlib proving stack
 * never bloats the default browser bundle.
 *
 * To go live:
 *   1. `npm install @veil-cash/sdk`
 *   2. Implement deposit()/withdraw() below against the SDK, returning a real
 *      `txHash` ONLY after the on-chain transaction confirms. Handle the Veil
 *      compliance screen (Coinbase EAS / Binance BABT / Ethos / 0xbow) and the
 *      derived Veil keypair per the SDK guide.
 *   3. Set VITE_VEIL_LIVE=true.
 *
 * SAFETY: never return a `txHash` for a transaction that did not actually
 * execute and confirm. Returning `{ error }` (no txHash) keeps the caller in a
 * safe state — the donor is told the transfer did not happen.
 */
import type { Signer } from '@/lib/ethers-compat';
import type { VeilAsset } from '@/config/veil';

export interface VeilDepositArgs {
  signer: Signer;
  asset: VeilAsset;
  amount: string;
}

export interface VeilWithdrawArgs {
  signer: Signer;
  asset: VeilAsset;
  amount: string;
  note: string;
  recipient: string;
}

export interface VeilSdkAdapter {
  deposit(args: VeilDepositArgs): Promise<{ txHash?: string; commitment?: string; note?: string; error?: string }>;
  withdraw(args: VeilWithdrawArgs): Promise<{ txHash?: string; error?: string }>;
}

const NOT_WIRED =
  'Veil live mode is enabled but the @veil-cash/sdk has not been wired in sdkAdapter.ts yet — no transfer was made.';

/**
 * Placeholder adapter. Until the real SDK is wired, every method returns an
 * error (no txHash), so the client reports failure honestly instead of moving
 * funds or implying success.
 */
export const veilSdkAdapter: VeilSdkAdapter = {
  async deposit() {
    return { error: NOT_WIRED };
  },
  async withdraw() {
    return { error: NOT_WIRED };
  },
};
