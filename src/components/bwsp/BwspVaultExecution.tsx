/**
 * BwspVaultExecution — puts an approved BWSP/BWTYA strategy to work for real.
 *
 * Only rendered once the three-way Scripture check has permitted execution.
 * The mandatory 10% tithe-on-yield is taken by the vault contract itself inside
 * `claimYield()`; this panel never simulates that split.
 *
 * "The tithe is the LORD's" — Leviticus 27:30 (KJV)
 */
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, Vault } from 'lucide-react';
import { toast } from 'sonner';
import { useTitheVault } from '@/hooks/useTitheVault';

interface BwspVaultExecutionProps {
  /** Amount the strategy says may be deployed, in whole units of the deposit token. */
  suggestedAmount: number;
  /** Strategy name, shown so the giver knows what the money is being put into. */
  strategyName: string;
}

const BwspVaultExecution: React.FC<BwspVaultExecutionProps> = ({
  suggestedAmount,
  strategyName,
}) => {
  const { address, isConnected } = useAccount();
  const vault = useTitheVault(address ?? null);
  const [amount, setAmount] = useState(
    suggestedAmount > 0 ? suggestedAmount.toFixed(2) : '',
  );

  useEffect(() => {
    if (suggestedAmount > 0) setAmount(suggestedAmount.toFixed(2));
  }, [suggestedAmount]);

  const run = async (action: () => Promise<string | null>, success: string) => {
    try {
      const hash = await action();
      toast.success(success, {
        description: hash ? `Confirmed on ${vault.chainLabel}: ${hash.slice(0, 10)}…` : undefined,
      });
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
            Putting this to work — not live yet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            The plan above is real and based on live Base pools, but no yield vault is registered on{' '}
            {vault.chainLabel} yet, so no money can be placed from here.
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
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Vault className="h-4 w-4 text-primary" />
          Put this strategy to work
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
        <p className="text-sm text-muted-foreground">
          {strategyName} — the vault takes the 10% tithe out of every gain itself, before you receive
          anything.
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Your principal</p>
            <p className="font-semibold">
              {(position?.principal ?? 0).toFixed(2)} {vault.tokenSymbol}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Earned so far</p>
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
          <Label htmlFor="bwsp-vault-amount">Amount to put to work ({vault.tokenSymbol})</Label>
          <div className="flex gap-2">
            <Input
              id="bwsp-vault-amount"
              inputMode="decimal"
              placeholder="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))}
            />
            <Button
              onClick={() =>
                run(() => vault.deposit(amount), 'Your funds are working in the vault.')
              }
              disabled={!isConnected || vault.busy || !amount}
            >
              {vault.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Put to work'}
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
          {vault.busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Settle tithe + claim my share'
          )}
        </Button>

        {!isConnected && (
          <p className="text-xs text-muted-foreground">
            Connect your wallet to put funds to work or to settle.
          </p>
        )}
        {vault.error && <p className="text-xs text-destructive">{vault.error}</p>}
        <p className="text-xs italic text-muted-foreground">
          "The tithe is the LORD's" — Leviticus 27:30
        </p>
      </CardContent>
    </Card>
  );
};

export default BwspVaultExecution;
