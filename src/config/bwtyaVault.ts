/**
 * BWTYA Yield Vault deployment registry.
 *
 * The vault settles real funds: yield accrues in the vault, the mandatory 10%
 * tithe-on-yield is routed to the church treasury, and the remainder is claimed
 * by the steward. Until a vault address is registered for a chain, the church
 * dashboard shows OFF-CHAIN ESTIMATES ONLY and must say so plainly.
 *
 * "Owe no man any thing" — Romans 13:8 (KJV): never imply funds have settled
 * when they have not.
 */

export type BwtyaChain = "base" | "base-sepolia";

export interface BwtyaVaultDeployment {
  chain: BwtyaChain;
  chainId: number;
  label: string;
  rpcUrl: string;
  explorer: string;
  /** Empty string until the vault is deployed and verified on that chain. */
  address: string;
}

const env = (key: string): string =>
  (import.meta.env?.[key as keyof ImportMetaEnv] as string | undefined)?.trim() ?? "";

export const BWTYA_VAULTS: Record<BwtyaChain, BwtyaVaultDeployment> = {
  base: {
    chain: "base",
    chainId: 8453,
    label: "Base Mainnet",
    rpcUrl: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    address: env("VITE_BWTYA_VAULT_BASE"),
  },
  "base-sepolia": {
    chain: "base-sepolia",
    chainId: 84532,
    label: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    address: env("VITE_BWTYA_VAULT_BASE_SEPOLIA"),
  },
};

/** Active vault chain — testnet first until the mainnet vault is audited. */
export const ACTIVE_BWTYA_CHAIN: BwtyaChain =
  (env("VITE_BWTYA_VAULT_CHAIN") as BwtyaChain) || "base-sepolia";

export const activeBwtyaVault = (): BwtyaVaultDeployment => BWTYA_VAULTS[ACTIVE_BWTYA_CHAIN];

export const isBwtyaVaultDeployed = (): boolean =>
  /^0x[a-fA-F0-9]{40}$/.test(activeBwtyaVault().address);

/** Minimal read ABI for dashboard settlement figures. */
export const BWTYA_VAULT_READ_ABI = [
  "function previewYield(address user) view returns (uint256 grossYield, uint256 titheAmount, uint256 netYield, uint256 effectiveApyBps)",
  "function effectiveUserApy(address user) view returns (uint256)",
] as const;

/** Protocol-mandated tithe on all yield (Leviticus 27:30). Never configurable. */
export const BWTYA_TITHE_BPS = 1000;
