import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowUpRight, ArrowDownLeft, Clock, ExternalLink, RefreshCw, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  type: 'swap' | 'send' | 'receive';
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  counterparty?: string;
}

const RecentTransactions: React.FC = () => {
  const { isConnected, address } = useAccount();

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['basescan-history', address],
    queryFn: async () => {
      if (!address) return [];
      const { data, error } = await supabase.functions.invoke('basescan-history', {
        body: { address, page: 1, offset: 15 },
      });
      if (error) throw error;
      return (data?.transactions || []) as Transaction[];
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  if (!isConnected) {
    return (
      <Card className="border-ancient-gold/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Connect wallet to view transaction history</p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'swap') return <Repeat className="h-4 w-4 text-ancient-gold" />;
    if (type === 'send') return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    return <ArrowDownLeft className="h-4 w-4 text-eboy-green" />;
  };

  return (
    <Card className="border-ancient-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-ancient-gold" />
          Recent Transactions
          {transactions.length > 0 && (
            <Badge variant="secondary" className="text-xs">{transactions.length}</Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading} className="text-muted-foreground hover:text-ancient-gold">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && transactions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <RefreshCw className="h-8 w-8 text-ancient-gold/50 mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Loading from Basescan...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="text-4xl">📜</div>
            <p className="text-sm text-muted-foreground">No transactions found on Base</p>
            <p className="text-xs text-muted-foreground italic">
              "The beginning of wisdom is this: Get wisdom." — Proverbs 4:7
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TypeIcon type={tx.type} />
                  <div className="min-w-0">
                    {tx.type === 'swap' ? (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <span className="truncate">{tx.fromAmount} {tx.fromToken}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-eboy-green truncate">{tx.toAmount} {tx.toToken}</span>
                      </div>
                    ) : (
                      <div className="text-sm font-medium">
                        <span className={tx.type === 'receive' ? 'text-eboy-green' : 'text-foreground'}>
                          {tx.type === 'send' ? '-' : '+'}{tx.fromAmount} {tx.fromToken}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground capitalize">{tx.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      tx.status === 'completed' ? 'default'
                      : tx.status === 'pending' ? 'secondary'
                      : 'destructive'
                    }
                    className="text-[10px] h-5 px-1.5"
                  >
                    {tx.status === 'completed' ? '✓' : tx.status === 'failed' ? '✗' : '⏳'}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(tx.timestamp)}</span>
                  {tx.txHash && (
                    <a
                      href={`https://basescan.org/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-eboy-green transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
