import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BWTYA_ABI = [
  'function investWithAttestation(string poolName,uint256 amount,string reasoning,bytes32 attestationHash,uint256 deadline,bytes32 nonce,bytes gatewaySignature) external returns (bool)',
];

interface ExecuteParams {
  poolName: string;
  strategyId: string;
  amountWei: string;
  reasoning: string;
  x402PaymentHash: string;
  bwtyaContract: `0x${string}`;
}

/**
 * Gates BWTYA strategy execution behind:
 *   1. x402 USDC payment (already paid by caller; tx hash passed in)
 *   2. Theological attestation (verified server-side)
 *   3. Gateway-signed EIP-712 permit (server returns signature)
 *   4. User wallet signs the on-chain tx — no custodial executor.
 *
 * Proverbs 11:14 — "in the multitude of counsellors there is safety."
 */
export function useX402StrategyExecute() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);

  const execute = async (params: ExecuteParams): Promise<`0x${string}` | null> => {
    if (!address || !walletClient) {
      toast.error('Connect wallet first');
      return null;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('x402-bwtya-execute', {
        body: {
          userWallet: address,
          poolName: params.poolName,
          strategyId: params.strategyId,
          amount: params.amountWei,
          reasoning: params.reasoning,
          x402PaymentHash: params.x402PaymentHash,
          bwtyaContract: params.bwtyaContract,
        },
      });
      if (error || !data?.ok) {
        const msg = error?.message ?? data?.error ?? 'Gateway rejected request';
        toast.error(msg);
        return null;
      }

      const { permit, signature } = data;
      const iface = new ethers.Interface(BWTYA_ABI);
      const calldata = iface.encodeFunctionData('investWithAttestation', [
        permit.poolName,
        BigInt(permit.amount),
        permit.reasoning,
        permit.attestationHash,
        BigInt(permit.deadline),
        permit.nonce,
        signature,
      ]) as `0x${string}`;

      const txHash = await walletClient.sendTransaction({
        to: params.bwtyaContract,
        data: calldata,
        account: address,
        chain: walletClient.chain,
      } as any);
      toast.success('Strategy execution submitted');
      await publicClient?.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    } catch (e) {
      console.error('useX402StrategyExecute', e);
      toast.error((e as Error).message ?? 'Execution failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}