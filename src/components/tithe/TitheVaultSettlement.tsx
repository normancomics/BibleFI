/**
 * TitheVaultSettlement — settles real funds through the BWTYA tithe vault.
 *
 * "Bring ye all the tithes into the storehouse" — Malachi 3:10 (KJV)
 *
 * Honesty rules enforced here:
 *  - When no vault address is registered for the active chain, nothing settles
 *    and the card says so plainly instead of showing hopeful numbers.
 *  - The 10% tithe is transferred on-chain by the vault itself; this UI only
 *    reports what the contract will do.
 */
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Vault, AlertTriangle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useSound } from '@/contexts/SoundContext';
import { useTitheVault } from '@/hooks/useTitheVault';

const TitheVaultSettlement: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { playSound } = useSound();
  const vault = useTitheVault(address ?? null);
  const [amount, setAmount] = useState('');

  const run = async (action: () => Promise<string | null>, success: string) => {
    try {
      const hash = await action();
      playSound('success');
      toast.success(success, {
        description: hash ? `Confirmed on ${vault.chainLabel}: ${hash.slice(0, 10)}…` : undefined,
      });
      setAmount('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The transaction did not go through.');
    }
  };

  if (!vault.deployed) {
    return (
      <Card className="border-amber-500/40 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Vault className="h-4 w-4 text-amber-500" />
            Tithe vault — not live yet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            No vault is registered for {vault.chainLabel}, so nothing settles through it yet.
            Continuous Giving above still sends real streams directly to your church's wallet.
          </p>
          <p>
            Once the vault is deployed, paste its address into{' '}
            <code className="rounded bg-muted px-1">VITE_BWTYA_VAULT_BASE_SEPOLIA</code> and this card
            turns into live settlement automatically.
          </p>
          <p className="italic">"Owe no man any thing" — Romans 13:8</p>
        </CardContent>
      </Card>
    );
  }

  const position = vault.position;

  return (
    <Card className="border-primary/30 bg-card/60">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Vault className="h-4 w-4 text-primary" />
          Tithe vault settlement
          <Badge variant="outline">{vault.chainLabel}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={vault.refresh} disabled={vault.loading}>
            <RefreshCw className={`h-4 w-4 ${vault.loading ? 'animate-spin' : ''}`} />
          </Button>
          {vault.explorerUrl && (
            <a
              href={vault.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Your principal</p>
            <p className="font-semibold">
              {(position?.principal ?? 0).toFixed(2)} {vault.tokenSymbol}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Yield so far</p>
            <p className="font-semibold">{(position?.grossYield ?? 0).toFixed(4)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tithe (10%)</p>
            <p className="font-semibold text-primary">{(position?.titheAmount ?? 0).toFixed(4)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Your share</p>
            <p className="font-semibold">{(position?.netYield ?? 0).toFixed(4)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vault-amount">
            Amount to place in the vault ({vault.tokenSymbol})
          </Label>
          <div className="flex gap-2">
            <Input
              id="vault-amount"
              inputMode="decimal"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button
              onClick={() => run(() => vault.deposit(amount), 'Your gift is in the vault.')}
              disabled={!isConnected || vault.busy || !amount}
            >
              {vault.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Give'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Wallet balance: {vault.walletBalance.toFixed(2)} {vault.tokenSymbol}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          disabled={!isConnected || vault.busy || (position?.grossYield ?? 0) <= 0}
          onClick={() =>
            run(
              () => vault.claimTitheAndYield(),
              'Settled: the 10% tithe went to the treasury, the rest to you.',
            )
          }
        >
          {vault.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Settle tithe + claim my share'}
        </Button>

        {!isConnected && (
          <p className="text-xs text-muted-foreground">Connect your wallet to give or settle.</p>
        )}
        {vault.error && <p className="text-xs text-destructive">{vault.error}</p>}
        <p className="text-xs italic text-muted-foreground">"The tithe is the LORD's" — Leviticus 27:30</p>
      </CardContent>
    </Card>
  );
};

export default TitheVaultSettlement;
