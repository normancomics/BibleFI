import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Transaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

const RecentTransactions: React.FC = () => {
  const { isConnected } = useAccount();

  // Placeholder — in production these come from on-chain indexing or a local DB
  const transactions: Transaction[] = [];

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

  return (
    <Card className="border-ancient-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-ancient-gold" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="text-4xl">📜</div>
            <p className="text-sm text-muted-foreground">No swap transactions yet</p>
            <p className="text-xs text-muted-foreground italic">
              "The beginning of wisdom is this: Get wisdom." — Proverbs 4:7
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <span>{tx.fromAmount} {tx.fromToken}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-eboy-green">{tx.toAmount} {tx.toToken}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      tx.status === 'completed' ? 'default'
                      : tx.status === 'pending' ? 'secondary'
                      : 'destructive'
                    }
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{tx.timestamp}</span>
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
