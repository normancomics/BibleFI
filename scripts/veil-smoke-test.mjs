#!/usr/bin/env node
/**
 * Veil.cash real-funds smoke test (Base MAINNET — Veil is not on any testnet).
 *
 * ⚠️  This moves REAL money on Base mainnet. Veil.cash has no Base Sepolia
 *     deployment, so there is no free/testnet way to exercise the real flow.
 *     Use a BURNER wallet with a tiny amount (e.g. 0.001–0.005 ETH) that you
 *     are willing to lose. YOU supply the key; it is read from env and never
 *     leaves your machine.
 *
 * What it does (real, on-chain):
 *   1. Derives your Veil keypair from the wallet (Keypair.fromSigner).
 *   2. Registers the deposit key on-chain if the account is new.
 *   3. Deposits AMOUNT of ETH into the Veil pool (real tx).
 *   4. If RECIPIENT is set, withdraws the same amount privately to it via the
 *      Veil relayer (requires the Groth16 proving artifacts, see PROVING_KEY_PATH).
 *   Prints every transaction hash with a BaseScan link.
 *
 * Prereqs:
 *   npm install @veil-cash/sdk ethers
 *   # withdraw also needs transaction2/16.wasm + .zkey reachable via PROVING_KEY_PATH
 *
 * Usage:
 *   WALLET_KEY=0xyourBurnerKey \
 *   AMOUNT=0.001 \
 *   [RECIPIENT=0xChurchAddress] \
 *   [PROVING_KEY_PATH=./keys] \
 *   [RPC_URL=https://mainnet.base.org] \
 *   node scripts/veil-smoke-test.mjs
 */

import { Wallet, JsonRpcProvider, formatEther } from 'ethers';

const WALLET_KEY = process.env.WALLET_KEY;
const AMOUNT = process.env.AMOUNT || '0.001';
const RECIPIENT = process.env.RECIPIENT || null;
const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';
const PROVING_KEY_PATH = process.env.PROVING_KEY_PATH || undefined;

if (!WALLET_KEY) {
  console.error('Refusing to run: set WALLET_KEY to a BURNER private key holding a small amount of real Base ETH.');
  console.error('Veil.cash is mainnet-only — there is no testnet deployment to use instead.');
  process.exit(1);
}

const scan = (h) => `https://basescan.org/tx/${h}`;

async function sendTx(signer, tx, label) {
  console.log(`→ ${label} …`);
  const sent = await signer.sendTransaction({ to: tx.to, data: tx.data, value: tx.value ?? 0n });
  console.log(`  submitted: ${sent.hash}`);
  const receipt = await sent.wait();
  console.log(`  confirmed in block ${receipt?.blockNumber}: ${scan(sent.hash)}`);
  return sent.hash;
}

async function main() {
  let veil;
  try {
    veil = await import('@veil-cash/sdk');
  } catch {
    console.error('@veil-cash/sdk is not installed. Run:  npm install @veil-cash/sdk');
    process.exit(1);
  }

  const provider = new JsonRpcProvider(RPC_URL);
  const net = await provider.getNetwork();
  if (Number(net.chainId) !== 8453) {
    console.error(`Refusing: RPC is chainId ${net.chainId}, not Base mainnet (8453). Veil is only on 8453.`);
    process.exit(1);
  }
  const signer = new Wallet(WALLET_KEY, provider);
  const owner = await signer.getAddress();
  const bal = await provider.getBalance(owner);
  console.log(`Wallet ${owner} — balance ${formatEther(bal)} ETH on Base mainnet`);
  console.log(`Depositing ${AMOUNT} ETH into Veil${RECIPIENT ? `, then withdrawing to ${RECIPIENT}` : ''}.\n`);

  // 1. Veil keypair
  const keypair = await veil.Keypair.fromSigner((msg) => signer.signMessage(msg));
  const depositKey = keypair.depositKey();

  // 2. Register if needed
  const { isRegistered } = await veil.checkRecipientRegistration(owner, RPC_URL);
  if (!isRegistered) {
    await sendTx(signer, veil.buildRegisterTx(depositKey, owner), 'register deposit key');
  } else {
    console.log('deposit key already registered');
  }

  // 3. Deposit ETH (real)
  const depositHash = await sendTx(
    signer,
    veil.buildDepositETHTx({ depositKey, amount: AMOUNT }),
    `deposit ${AMOUNT} ETH`,
  );

  // 4. Optional withdraw to recipient (needs proving keys)
  let withdrawHash = null;
  if (RECIPIENT) {
    console.log(`→ withdraw ${AMOUNT} ETH to ${RECIPIENT} (Groth16 proving; may take ~10–30s) …`);
    const res = await veil.withdraw({
      amount: AMOUNT,
      recipient: RECIPIENT,
      keypair,
      pool: 'eth',
      rpcUrl: RPC_URL,
      provingKeyPath: PROVING_KEY_PATH,
      onProgress: (stage, detail) => console.log(`  [${stage}] ${detail ?? ''}`),
    });
    if (!res?.success || !res.transactionHash) throw new Error('withdraw did not confirm');
    withdrawHash = res.transactionHash;
    console.log(`  withdrawn: ${scan(withdrawHash)}`);
  }

  console.log('\n✅ Done.');
  console.log('  deposit :', scan(depositHash));
  if (withdrawHash) console.log('  withdraw:', scan(withdrawHash));
  else console.log('  (set RECIPIENT + PROVING_KEY_PATH to also test the anonymous withdrawal)');
}

main().catch((e) => {
  console.error('\n❌ Smoke test failed:', e?.message ?? e);
  process.exit(1);
});
