/**
 * Real Veil.cash SDK adapter (@veil-cash/sdk).
 *
 * Wires the live Veil protocol (UTXO model, Poseidon + Groth16) into the app.
 * Loaded lazily (only when VITE_VEIL_LIVE=true) and it imports @veil-cash/sdk
 * via a runtime dynamic import with `@vite-ignore`, so the heavy snarkjs/
 * circomlib proving stack NEVER enters the default browser bundle and the app
 * builds fine without the package installed.
 *
 * TO GO LIVE
 * ──────────
 *   1. `npm install @veil-cash/sdk`
 *   2. Host the Groth16 proving artifacts at same-origin `/keys/`:
 *        /keys/transaction2.wasm  /keys/transaction2.zkey
 *        /keys/transaction16.wasm /keys/transaction16.zkey
 *      (or set VITE_VEIL_PROVING_KEY_PATH to a base URL / CDN).
 *   3. Set VITE_VEIL_LIVE=true.
 *
 * SAFETY: every method returns a real `txHash` ONLY after an on-chain
 * transaction (deposit) or relayer receipt (withdraw) confirms. If the SDK is
 * not installed, or anything fails, it returns `{ error }` with NO txHash so
 * the caller reports failure honestly — a donor is never told a tithe was sent
 * unless it actually was.
 *
 * Veil account model: the user's Veil identity is derived deterministically
 * from their wallet signature (Keypair.fromSigner), so deposits and later
 * withdrawals both re-derive the same keypair from the connected wallet — no
 * separate secret note is required to move the private balance.
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

// ── Minimal local typing of the @veil-cash/sdk surface we use ────────────────
// (Declared locally so tsc stays green when the optional package isn't present.)
type TransactionData = { to: string; data: string; value?: bigint };
interface VeilKeypair {
  depositKey(): string;
}
interface VeilSdkModule {
  Keypair: {
    fromSigner(signer: (message: string) => Promise<string>): Promise<VeilKeypair>;
  };
  checkRecipientRegistration(address: `0x${string}`, rpcUrl?: string): Promise<{ isRegistered: boolean }>;
  buildRegisterTx(depositKey: string, ownerAddress: `0x${string}`): TransactionData;
  buildApproveUSDCTx(opts: { amount: string }): TransactionData;
  buildDepositETHTx(opts: { depositKey: string; amount: string }): TransactionData;
  buildDepositUSDCTx(opts: { depositKey: string; amount: string }): TransactionData;
  withdraw(opts: {
    amount: string;
    recipient: `0x${string}`;
    keypair: VeilKeypair;
    pool?: 'eth' | 'usdc';
    rpcUrl?: string;
    provingKeyPath?: string;
    onProgress?: (stage: string, detail?: string) => void;
  }): Promise<{ success: boolean; transactionHash: string; blockNumber: string }>;
}

const BASE_RPC = 'https://mainnet.base.org';

function provingKeyPath(): string | undefined {
  try {
    const p = import.meta.env?.VITE_VEIL_PROVING_KEY_PATH;
    return typeof p === 'string' && p.length ? p : undefined;
  } catch {
    return undefined;
  }
}

// Non-literal specifier: keeps TypeScript from resolving the optional package
// at compile time (it isn't installed in the default build) and stops Vite from
// bundling it. Resolved only at runtime when a live deployment has installed it.
const VEIL_SDK_MODULE = '@veil-cash/sdk';

async function loadSdk(): Promise<VeilSdkModule> {
  const mod = await import(/* @vite-ignore */ VEIL_SDK_MODULE);
  return mod as unknown as VeilSdkModule;
}

async function deriveKeypair(sdk: VeilSdkModule, signer: Signer): Promise<VeilKeypair> {
  return sdk.Keypair.fromSigner((message: string) => signer.signMessage(message));
}

/** Send a built Veil transaction with the wallet signer and wait for confirmation. */
async function sendTx(signer: Signer, tx: TransactionData): Promise<string> {
  const sent = await signer.sendTransaction({ to: tx.to, data: tx.data, value: tx.value ?? 0n });
  const receipt = await sent.wait();
  const hash = receipt?.hash ?? sent.hash;
  if (!hash) throw new Error('Transaction did not return a hash');
  return hash;
}

export const veilSdkAdapter: VeilSdkAdapter = {
  async deposit({ signer, asset, amount }) {
    try {
      const sdk = await loadSdk();
      const keypair = await deriveKeypair(sdk, signer);
      const owner = (await signer.getAddress()) as `0x${string}`;

      // One-time: register the deposit key on-chain if the account is new.
      const { isRegistered } = await sdk.checkRecipientRegistration(owner, BASE_RPC);
      if (!isRegistered) {
        await sendTx(signer, sdk.buildRegisterTx(keypair.depositKey(), owner));
      }

      if (asset === 'USDC') {
        // Approve, then deposit USDC.
        await sendTx(signer, sdk.buildApproveUSDCTx({ amount }));
        const txHash = await sendTx(signer, sdk.buildDepositUSDCTx({ depositKey: keypair.depositKey(), amount }));
        return { txHash };
      }

      const txHash = await sendTx(signer, sdk.buildDepositETHTx({ depositKey: keypair.depositKey(), amount }));
      return { txHash };
    } catch (error) {
      // Includes the case where @veil-cash/sdk is not installed.
      return { error: error instanceof Error ? error.message : 'Veil deposit failed' };
    }
  },

  async withdraw({ signer, asset, amount, recipient }) {
    try {
      const sdk = await loadSdk();
      const keypair = await deriveKeypair(sdk, signer);
      const pool = asset === 'USDC' ? 'usdc' : 'eth';
      const result = await sdk.withdraw({
        amount,
        recipient: recipient as `0x${string}`,
        keypair,
        pool,
        rpcUrl: BASE_RPC,
        provingKeyPath: provingKeyPath(),
      });
      if (!result?.success || !result.transactionHash) {
        return { error: 'Withdrawal did not confirm on-chain' };
      }
      return { txHash: result.transactionHash };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Veil withdrawal failed' };
    }
  },
};
