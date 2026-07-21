/**
 * Veil.cash configuration — REAL, verified Base mainnet deployment.
 *
 * Addresses confirmed on-chain (Base, chainId 8453) 2026-07. Source:
 * https://docs.veil.cash/technical/deployments
 *
 * Veil v2 is a UTXO privacy protocol (Poseidon + Groth16) supporting
 * arbitrary-amount ETH and USDC deposits/withdrawals, gated by a one-time
 * compliance screen (Coinbase EAS / Binance BABT / Ethos / 0xbow).
 *
 * LIVE vs PREVIEW
 * ───────────────
 * Real deposits/withdrawals require the @veil-cash/sdk (Groth16 proving) plus a
 * derived Veil keypair and the compliance screen. Until that is installed and a
 * deployment opts in, anonymous giving runs in PREVIEW mode: the UI is fully
 * functional for exploration but NO on-chain transaction is ever sent and the
 * app never claims funds moved. Set VITE_VEIL_LIVE=true (and install the SDK)
 * to enable real transfers.
 */

export const VEIL_CHAIN_ID = 8453; // Base mainnet

/** Verified live Veil.cash contracts on Base. */
export const VEIL_CONTRACTS = {
  entry: '0xc2535c547B64b997A4BD9202E1663deaF11c78a5',
  ethPool: '0x293dCda114533FF8f477271c5cA517209FFDEEe7',
  usdcPool: '0x5c50d58E49C59d112680c187De2Bf989d2a91242',
  ethQueue: '0xA4a926A2E7a22c38e8DFC6744A61a6aA8b06B230',
  usdcQueue: '0x5530241b24504bF05C9a22e95A1F5458888e6a9B',
  hasher: '0x2460da3AcdA8A3BDbB2149c948363233D3453ac2',
  verifier2: '0x69013e62EF76BF1A7B980957607c944C9BD4FDF5',
  verifier16: '0xB5e025044b09cAe75bace1c8dB9701aE383792e4',
  onchainVerify: '0xb5B3C6192E1871c613e0C415108Ba3934237F360',
  veilToken: '0x767A739D1A152639e9Ea1D8c1BD55FDC5B217D7f',
} as const;

export type VeilAsset = 'ETH' | 'USDC';

/** Underlying token addresses (USDC on Base; ETH is native). */
export const VEIL_ASSETS: Record<VeilAsset, { pool: string; underlying: string | null; decimals: number }> = {
  ETH: { pool: VEIL_CONTRACTS.ethPool, underlying: null, decimals: 18 },
  USDC: { pool: VEIL_CONTRACTS.usdcPool, underlying: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
};

/** Protocol fee added on top of the deposit amount (0.3%). */
export const VEIL_PROTOCOL_FEE_BPS = 30;

/**
 * Whether real on-chain Veil transfers are enabled for this build.
 * Requires VITE_VEIL_LIVE=true AND the @veil-cash/sdk installed. Defaults to
 * PREVIEW (false) so no deployment can silently move funds or imply privacy
 * that isn't actually happening.
 */
export function isVeilLive(): boolean {
  try {
    return import.meta.env?.VITE_VEIL_LIVE === 'true';
  } catch {
    return false;
  }
}
