import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { baseTokens } from '@/data/baseTokens';

interface TokenSelectDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TokenSelectDropdown: React.FC<TokenSelectDropdownProps> = ({
  value,
  onValueChange,
  placeholder = "Select token",
  disabled = false,
  className = ""
}) => {
  const getTokenLogo = (symbol: string) => {
    const token = baseTokens[symbol];
    return token?.logoURI || '/coin-pixel.png';
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm border-eboy-green/30 hover:border-eboy-green/60 ${className}`}>
        <div className="flex items-center gap-2">
          {value && (
            <img 
              src={getTokenLogo(value)} 
              alt={value}
              className="w-5 h-5 rounded-full pixelated"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/coin-pixel.png';
              }}
            />
          )}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gradient-to-br from-slate-700 to-slate-800 border-eboy-green/30 backdrop-blur-sm z-50">
        {Object.entries(baseTokens).map(([symbol, token]) => (
          <SelectItem 
            key={symbol} 
            value={symbol}
            className="hover:bg-eboy-green/20 focus:bg-eboy-green/20 text-white"
          >
            <div className="flex items-center gap-2">
              <img 
                src={token.logoURI} 
                alt={symbol}
                className="w-5 h-5 rounded-full pixelated"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/coin-pixel.png';
                }}
              />
              <div className="flex flex-col">
                <span className="font-medium">{symbol}</span>
                <span className="text-xs text-white/60">{token.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TokenSelectDropdown;