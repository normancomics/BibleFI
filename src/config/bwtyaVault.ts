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
    // Deployed 2026-09-18. Registry: 0x1Da78755fd94c58a2852E5EcB15CB466Dbd3B430.
    // Treasury (10% tithe-on-yield): 0x7bEda57074AA917FF0993fb329E16C2c188baF08.
    address:
      env("VITE_BWTYA_VAULT_BASE_SEPOLIA") || "0xf07674e05fFC3691fec0e1eb06F8b536F66dC12e",
  },
};

/**
 * Active vault chain. Explicit VITE_BWTYA_VAULT_CHAIN wins; otherwise a
 * registered Base mainnet address promotes the app to real Base money, and
 * failing that we stay on testnet. Mainnet must only be registered after audit.
 */
const explicitChain = env("VITE_BWTYA_VAULT_CHAIN") as BwtyaChain | "";
export const ACTIVE_BWTYA_CHAIN: BwtyaChain =
  explicitChain === "base" || explicitChain === "base-sepolia"
    ? explicitChain
    : /^0x[a-fA-F0-9]{40}$/.test(env("VITE_BWTYA_VAULT_BASE"))
      ? "base"
      : "base-sepolia";

export const activeBwtyaVault = (): BwtyaVaultDeployment => BWTYA_VAULTS[ACTIVE_BWTYA_CHAIN];

export const isBwtyaVaultDeployed = (): boolean =>
  /^0x[a-fA-F0-9]{40}$/.test(activeBwtyaVault().address);

/**
 * Read ABI for settlement figures. `previewYield` returns the on-chain
 * YieldDistribution struct, so it decodes as a 6-field tuple.
 */
export const BWTYA_VAULT_READ_ABI = [
  "function previewYield(address user) view returns ((uint256 grossYield,uint256 titheAmount,uint256 netYield,uint256 wisdomBonus,uint256 titheBlessingBonus,uint256 finalAmount))",
  "function effectiveUserApy(address user) view returns (uint256)",
  "function depositToken() view returns (address)",
  "function treasury() view returns (address)",
  "function deposits(address) view returns (uint256 amount,uint256 reserveAmount,uint256 depositTime,uint256 lastClaimTime,uint256 pausedSnapshot,uint256 wisdomTwapStart,uint256 wisdomTwapAccum,uint256 twapWindowStart,uint256 twapLastUpdated,bool inRebalanceLock,uint256 rebalanceLockEnds)",
] as const;

/**
 * Write ABI — real settlement. `deposit` pulls the token (approve first),
 * `claimYield` sends the mandatory 10% tithe to the treasury on-chain before
 * releasing the steward's share, and `withdraw` returns principal.
 */
export const BWTYA_VAULT_WRITE_ABI = [
  "function deposit(uint256 amount, uint256 portfolioTotalUsd)",
  "function claimYield()",
  "function withdraw()",
] as const;

/** Minimal ERC-20 ABI for the approve step before depositing. */
export const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

/** Protocol-mandated tithe on all yield (Leviticus 27:30). Never configurable. */
export const BWTYA_TITHE_BPS = 1000;
