/**
 * useBWTYAVault — reads real on-chain BWTYA vault settlement figures.
 *
 * When no vault address is registered for the active chain the hook reports
 * `deployed: false` so the UI can label its numbers as estimates instead of
 * pretending funds have settled.
 */
import { useCallback, useEffect, useState } from "react";
import { Contract, JsonRpcProvider, formatUnits } from "ethers";
import {
  BWTYA_VAULT_READ_ABI,
  activeBwtyaVault,
  isBwtyaVaultDeployed,
} from "@/config/bwtyaVault";

export interface BwtyaVaultYield {
  grossYield: number;
  titheAmount: number;
  netYield: number;
  effectiveApy: number;
}

export interface UseBwtyaVaultResult {
  deployed: boolean;
  loading: boolean;
  error: string | null;
  chainLabel: string;
  address: string;
  explorerUrl: string | null;
  onChain: BwtyaVaultYield | null;
  refresh: () => void;
}

export function useBWTYAVault(userAddress?: string | null, decimals = 6): UseBwtyaVaultResult {
  const vault = activeBwtyaVault();
  const deployed = isBwtyaVaultDeployed();
  const [onChain, setOnChain] = useState<BwtyaVaultYield | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!deployed || !userAddress) return;
    setLoading(true);
    setError(null);
    try {
      const provider = new JsonRpcProvider(vault.rpcUrl);
      const contract = new Contract(vault.address, BWTYA_VAULT_READ_ABI, provider);
      const res = await contract.previewYield(userAddress);
      setOnChain({
        grossYield: Number(formatUnits(res[0], decimals)),
        titheAmount: Number(formatUnits(res[1], decimals)),
        netYield: Number(formatUnits(res[2], decimals)),
        effectiveApy: Number(res[3]) / 10_000,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [deployed, userAddress, vault.address, vault.rpcUrl, decimals]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    deployed,
    loading,
    error,
    chainLabel: vault.label,
    address: vault.address,
    explorerUrl: deployed ? `${vault.explorer}/address/${vault.address}` : null,
    onChain,
    refresh: () => void load(),
  };
}
