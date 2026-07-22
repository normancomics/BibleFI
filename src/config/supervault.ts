/**
 * SuperVault configuration — Superfluid-native stable-yield vault on Base.
 *
 * Deposit USDC → receive ERC-4626 shares → a portion of the underlying Morpho
 * yield streams back to your wallet every second as USDCx (Superfluid GDA).
 * Addresses verified on-chain (Base mainnet, chainId 8453) 2026-07.
 * Docs: https://supervault.suplabs.org/docs
 *
 * ⚠️ EXPERIMENTAL: the deployed vault self-identifies as a "Technical Demo"
 * (share token symbol SVTD). BibleFi surfaces it as an experimental yield
 * venue — scored by BWTYA and readable live — NOT as a vetted production
 * savings product. Real-funds deposits are gated behind an explicit opt-in.
 */
export const SUPERVAULT_CHAIN_ID = 8453; // Base mainnet

export const SUPERVAULT_CONTRACTS = {
  /** ERC-4626 vault face (deposit/redeem, shares). */
  vault: '0x8C60503C0353ED12c3Eebc3036BF033A3BbB95Aa',
  /** Capital custodian + Superfluid streaming engine. */
  fundManager: '0x904103dfE7231e2534e0Be29E6086CB0FF7d76bd',
  /** Superfluid GDA pool distributing the yield stream. */
  yieldPool: '0xcaF84DACEd15AC4543cb4a94BfE9B5070d910Be0',
  /** Underlying deposit asset. */
  usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  /** Streamed super token (canonical Base USDCx — same one BibleFi uses). */
  usdcx: '0xD04383398dD2426297da660F9CCA3d439AF9ce1b',
  /** External yield source (Morpho Steakhouse Prime USDC). */
  morphoVault: '0xbeef0e0834849aCC03f0089F01f4F1Eeb06873C9',
} as const;

/** USDC has 6 decimals; USDCx (the stream) has 18. 10^12 bridges them. */
export const SUPERVAULT_SCALING_FACTOR = 10n ** 12n;

/**
 * Whether real-funds SuperVault deposits are enabled for this build. Off by
 * default because the vault is a technical demo — reads/scoring always work,
 * but moving real USDC requires an explicit opt-in.
 */
export function isSuperVaultLive(): boolean {
  try {
    return import.meta.env?.VITE_SUPERVAULT_LIVE === 'true';
  } catch {
    return false;
  }
}
