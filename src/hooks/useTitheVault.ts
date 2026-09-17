/**
 * useTitheVault — real settlement against the deployed BWTYA tithe vault.
 *
 * "The tithe is the LORD's" — Leviticus 27:30 (KJV). The 10% tithe-on-yield is
 * transferred to the church/DAO treasury on-chain inside `claimYield()` before
 * the steward receives anything; this hook never simulates that split.
 *
 * When no vault address is registered for the active chain the hook reports
 * `deployed: false` and every action is disabled — the UI must say plainly that
 * nothing settles yet.
 */
import { useCallback, useEffect, useState } from "react";
import { Contract, JsonRpcProvider, formatUnits, parseUnits } from "ethers";
import { createBrowserProvider } from "@/lib/ethers-compat";
import {
  BWTYA_VAULT_READ_ABI,
  BWTYA_VAULT_WRITE_ABI,
  ERC20_ABI,
  activeBwtyaVault,
  isBwtyaVaultDeployed,
} from "@/config/bwtyaVault";

export interface TitheVaultPosition {
  principal: number;
  reserve: number;
  grossYield: number;
  titheAmount: number;
  netYield: number;
  effectiveApy: number;
}

export interface UseTitheVaultResult {
  deployed: boolean;
  chainLabel: string;
  chainId: number;
  address: string;
  explorerUrl: string | null;
  tokenSymbol: string;
  walletBalance: number;
  position: TitheVaultPosition | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  refresh: () => void;
  deposit: (amount: string) => Promise<string | null>;
  claimTitheAndYield: () => Promise<string | null>;
}

const ZERO_POSITION: TitheVaultPosition = {
  principal: 0,
  reserve: 0,
  grossYield: 0,
  titheAmount: 0,
  netYield: 0,
  effectiveApy: 0,
};

export function useTitheVault(userAddress?: string | null): UseTitheVaultResult {
  const vault = activeBwtyaVault();
  const deployed = isBwtyaVaultDeployed();

  const [decimals, setDecimals] = useState(6);
  const [tokenSymbol, setTokenSymbol] = useState("USDC");
  const [walletBalance, setWalletBalance] = useState(0);
  const [position, setPosition] = useState<TitheVaultPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!deployed) return;
    setLoading(true);
    setError(null);
    try {
      const provider = new JsonRpcProvider(vault.rpcUrl);
      const reader = new Contract(vault.address, BWTYA_VAULT_READ_ABI, provider);
      const tokenAddress: string = await reader.depositToken();
      const token = new Contract(tokenAddress, ERC20_ABI, provider);
      const dec = Number(await token.decimals());
      setDecimals(dec);
      setTokenSymbol(await token.symbol());

      if (userAddress) {
        const [bal, dep, preview, apy] = await Promise.all([
          token.balanceOf(userAddress),
          reader.deposits(userAddress),
          reader.previewYield(userAddress),
          reader.effectiveUserApy(userAddress),
        ]);
        setWalletBalance(Number(formatUnits(bal, dec)));
        setPosition({
          principal: Number(formatUnits(dep[0], dec)),
          reserve: Number(formatUnits(dep[1], dec)),
          grossYield: Number(formatUnits(preview[0], dec)),
          titheAmount: Number(formatUnits(preview[1], dec)),
          netYield: Number(formatUnits(preview[5] ?? preview[2], dec)),
          effectiveApy: Number(apy) / 100,
        });
      } else {
        setPosition(ZERO_POSITION);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [deployed, userAddress, vault.address, vault.rpcUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const getSigner = useCallback(async () => {
    const injected = (window as unknown as { ethereum?: unknown }).ethereum;
    if (!injected) throw new Error("No wallet was found in this browser.");
    const provider = createBrowserProvider(injected);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== vault.chainId) {
      throw new Error(`Switch your wallet to ${vault.label} to give through the vault.`);
    }
    return provider.getSigner();
  }, [vault.chainId, vault.label]);

  const deposit = useCallback(
    async (amount: string): Promise<string | null> => {
      if (!deployed) throw new Error("The tithe vault is not deployed on this network yet.");
      const value = parseFloat(amount);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('Enter an amount greater than zero — "Honour the LORD with thy substance" (Proverbs 3:9).');
      }
      setBusy(true);
      try {
        const signer = await getSigner();
        const reader = new Contract(vault.address, BWTYA_VAULT_READ_ABI, signer);
        const tokenAddress: string = await reader.depositToken();
        const token = new Contract(tokenAddress, ERC20_ABI, signer);
        const units = parseUnits(amount, decimals);
        const owner = await signer.getAddress();
        const allowance: bigint = await token.allowance(owner, vault.address);
        if (allowance < units) {
          const approval = await token.approve(vault.address, units);
          await approval.wait();
        }
        const writer = new Contract(vault.address, BWTYA_VAULT_WRITE_ABI, signer);
        const tx = await writer.deposit(units, 0n);
        const receipt = await tx.wait();
        await load();
        return receipt?.hash ?? tx.hash;
      } finally {
        setBusy(false);
      }
    },
    [deployed, decimals, getSigner, load, vault.address],
  );

  const claimTitheAndYield = useCallback(async (): Promise<string | null> => {
    if (!deployed) throw new Error("The tithe vault is not deployed on this network yet.");
    setBusy(true);
    try {
      const signer = await getSigner();
      const writer = new Contract(vault.address, BWTYA_VAULT_WRITE_ABI, signer);
      const tx = await writer.claimYield();
      const receipt = await tx.wait();
      await load();
      return receipt?.hash ?? tx.hash;
    } finally {
      setBusy(false);
    }
  }, [deployed, getSigner, load, vault.address]);

  return {
    deployed,
    chainLabel: vault.label,
    chainId: vault.chainId,
    address: vault.address,
    explorerUrl: deployed ? `${vault.explorer}/address/${vault.address}` : null,
    tokenSymbol,
    walletBalance,
    position,
    loading,
    busy,
    error,
    refresh: () => void load(),
    deposit,
    claimTitheAndYield,
  };
}
