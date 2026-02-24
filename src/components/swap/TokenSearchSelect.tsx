import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search } from 'lucide-react';
import { baseTokens, TokenInfo } from '@/data/baseTokens';

interface TokenSearchSelectProps {
  value: string;
  onValueChange: (symbol: string) => void;
  excludeToken?: string;
  className?: string;
}

const TokenSearchSelect: React.FC<TokenSearchSelectProps> = ({
  value,
  onValueChange,
  excludeToken,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch('');
    }
  }, [open]);

  const tokens = useMemo(() => {
    return Object.entries(baseTokens)
      .filter(([symbol]) => symbol !== excludeToken)
      .filter(([symbol, token]) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          symbol.toLowerCase().includes(q) ||
          token.name.toLowerCase().includes(q) ||
          token.address.toLowerCase().includes(q)
        );
      });
  }, [search, excludeToken]);

  const selectedToken = baseTokens[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-32 justify-between border-border/50 bg-muted/30 hover:bg-muted/50 ${className}`}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedToken && (
              <img
                src={selectedToken.logoURI}
                alt={value}
                className="w-5 h-5 rounded-full shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span className="truncate font-medium">{value || 'Select'}</span>
          </div>
          <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 bg-card border-border z-[100]"
        align="start"
        sideOffset={4}
      >
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/30 border-border/50"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {tokens.length === 0 ? (
            <p className="text-center py-4 text-sm text-muted-foreground">No tokens found</p>
          ) : (
            tokens.map(([symbol, token]) => (
              <button
                key={symbol}
                onClick={() => {
                  onValueChange(symbol);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-left text-sm transition-colors hover:bg-muted/50 ${
                  value === symbol ? 'bg-muted/40 text-eboy-green' : 'text-foreground'
                }`}
              >
                <img
                  src={token.logoURI}
                  alt={symbol}
                  className="w-6 h-6 rounded-full shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="min-w-0">
                  <p className="font-medium">{symbol}</p>
                  <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                </div>
                {value === symbol && (
                  <span className="ml-auto text-eboy-green text-xs">✓</span>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TokenSearchSelect;
