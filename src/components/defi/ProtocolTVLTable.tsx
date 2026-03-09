import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';
import type { ProtocolData } from '@/hooks/useDefiScanner';

interface ProtocolTVLTableProps {
  protocols: ProtocolData[];
  totalScanned: number;
}

const TYPE_COLORS: Record<string, string> = {
  dex: 'bg-blue-500/20 text-blue-300',
  lending: 'bg-green-500/20 text-green-300',
  yield: 'bg-yellow-500/20 text-yellow-300',
  perpetual: 'bg-red-500/20 text-red-300',
  bridge: 'bg-purple-500/20 text-purple-300',
  cdp: 'bg-orange-500/20 text-orange-300',
};

type SortKey = 'name' | 'tvl' | 'change';

const ProtocolTVLTable: React.FC<ProtocolTVLTableProps> = ({ protocols, totalScanned }) => {
  const [sortKey, setSortKey] = useState<SortKey>('tvl');
  const [sortAsc, setSortAsc] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredSorted = useMemo(() => {
    let result = [...protocols];
    if (typeFilter) result = result.filter(p => p.type === typeFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.protocol.localeCompare(b.protocol);
      else if (sortKey === 'tvl') cmp = a.tvl - b.tvl;
      else cmp = a.change_1d - b.change_1d;
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [protocols, sortKey, sortAsc, typeFilter]);

  const types = useMemo(() => Array.from(new Set(protocols.map(p => p.type))).sort(), [protocols]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const totalTVL = protocols.reduce((sum, p) => sum + p.tvl, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-3">
        <Card className="border-border/50 flex-1 min-w-[200px]">
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">
                ${(totalTVL / 1e9).toFixed(2)}B
              </p>
              <p className="text-[11px] text-muted-foreground">Total TVL ({totalScanned} protocols)</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-1.5 flex-wrap">
          <Badge
            variant={typeFilter === null ? 'default' : 'outline'}
            className="cursor-pointer text-[10px]"
            onClick={() => setTypeFilter(null)}
          >
            All
          </Badge>
          {types.map(t => (
            <Badge
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              className={`cursor-pointer text-[10px] capitalize ${typeFilter === t ? '' : TYPE_COLORS[t] || ''}`}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <span className="flex items-center gap-1">Protocol <SortIcon k="name" /></span>
                </th>
                <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                <th className="text-right p-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => handleSort('tvl')}>
                  <span className="flex items-center justify-end gap-1">TVL <SortIcon k="tvl" /></span>
                </th>
                <th className="text-right p-3 text-muted-foreground font-medium cursor-pointer select-none" onClick={() => handleSort('change')}>
                  <span className="flex items-center justify-end gap-1">24h <SortIcon k="change" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((p, i) => {
                const isUp = p.change_1d >= 0;
                return (
                  <tr key={`${p.protocol}-${i}`} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono font-medium text-foreground">{p.protocol}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] capitalize ${TYPE_COLORS[p.type] || ''}`}>
                        {p.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono text-foreground">
                      {p.tvl > 1e9
                        ? `$${(p.tvl / 1e9).toFixed(2)}B`
                        : p.tvl > 1e6
                          ? `$${(p.tvl / 1e6).toFixed(1)}M`
                          : p.tvl > 1e3
                            ? `$${(p.tvl / 1e3).toFixed(1)}K`
                            : `$${p.tvl.toFixed(0)}`
                      }
                    </td>
                    <td className="p-3 text-right">
                      <span className={`flex items-center justify-end gap-0.5 font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(p.change_1d).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProtocolTVLTable;
