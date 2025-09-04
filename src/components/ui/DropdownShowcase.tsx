import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedSound } from '@/components/enhanced/SoundSystemManager';
import { baseTokens } from '@/data/baseTokens';
import { Coins, Filter, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface TokenSelectDropdownProps {
  selectedToken: string;
  onTokenSelect: (token: string) => void;
  placeholder?: string;
  className?: string;
}

const TokenSelectDropdown: React.FC<TokenSelectDropdownProps> = ({
  selectedToken,
  onTokenSelect,
  placeholder = "Select token",
  className = ""
}) => {
  const { playActionSound } = useEnhancedSound();
  const tokenList = Object.keys(baseTokens);

  const getTokenLogo = (symbol: string) => {
    const token = baseTokens[symbol];
    return token?.logoURI || '/coin-pixel.png';
  };

  return (
    <Select 
      value={selectedToken} 
      onValueChange={(value) => {
        onTokenSelect(value);
        playActionSound();
      }}
    >
      <SelectTrigger className={`isometric-card bg-black/30 border-eboy-green/30 ${className}`}>
        <SelectValue placeholder={placeholder}>
          {selectedToken && (
            <div className="flex items-center gap-2">
              <img 
                src={getTokenLogo(selectedToken)} 
                alt={selectedToken}
                className="w-4 h-4 rounded-full pixelated"
              />
              <span className="font-pixel">{selectedToken}</span>
              <Badge variant="outline" className="text-xs bg-eboy-green/10">
                {baseTokens[selectedToken]?.name}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-gradient-to-br from-iso-wall-light to-iso-wall-dark border-eboy-green/30 backdrop-blur-md">
        {tokenList.map((token) => (
          <SelectItem key={token} value={token} className="focus:bg-eboy-green/20 hover:bg-eboy-green/10">
            <div className="flex items-center gap-3 w-full">
              <img 
                src={getTokenLogo(token)} 
                alt={token}
                className="w-5 h-5 rounded-full pixelated flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-sm">{token}</span>
                  <Badge variant="outline" className="text-xs bg-black/20">
                    {baseTokens[token].name}
                  </Badge>
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Demo component showing fixed dropdown
const DropdownShowcase: React.FC = () => {
  const [selectedFromToken, setSelectedFromToken] = React.useState('');
  const [selectedToToken, setSelectedToToken] = React.useState('');
  const [sortOption, setSortOption] = React.useState('price');
  const { toast } = useToast();
  const { playActionSound, playAchievementSound } = useEnhancedSound();

  const handleSwap = () => {
    if (!selectedFromToken || !selectedToToken) {
      toast({
        title: "Select Tokens",
        description: "Please select both FROM and TO tokens",
        variant: "destructive"
      });
      return;
    }

    playAchievementSound();
    toast({
      title: "✨ Swap Initiated",
      description: `Swapping ${selectedFromToken} → ${selectedToToken}`,
    });
  };

  return (
    <Card className="isometric-card bg-gradient-to-br from-iso-wall-light/90 to-iso-wall-dark/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-eboy-green">
          <Coins className="h-5 w-5" />
          Enhanced Token Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Token */}
        <div className="space-y-2">
          <label className="block text-sm font-pixel text-white/80">From Token</label>
          <TokenSelectDropdown
            selectedToken={selectedFromToken}
            onTokenSelect={setSelectedFromToken}
            placeholder="Select source token"
          />
        </div>

        {/* Swap Direction Icon */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const temp = selectedFromToken;
              setSelectedFromToken(selectedToToken);
              setSelectedToToken(temp);
              playActionSound();
            }}
            className="rounded-full p-2 border-eboy-yellow bg-eboy-yellow/10 hover:bg-eboy-yellow/20"
          >
            <TrendingDown className="h-4 w-4 rotate-180" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="block text-sm font-pixel text-white/80">To Token</label>
          <TokenSelectDropdown
            selectedToken={selectedToToken}
            onTokenSelect={setSelectedToToken}
            placeholder="Select destination token"
          />
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="block text-sm font-pixel text-white/80">Sort By</label>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="isometric-card bg-black/30 border-eboy-green/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gradient-to-br from-iso-wall-light to-iso-wall-dark border-eboy-green/30">
              <SelectItem value="price">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Best Price</span>
                </div>
              </SelectItem>
              <SelectItem value="liquidity">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>Highest Liquidity</span>
                </div>
              </SelectItem>
              <SelectItem value="rating">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Best Rating</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Swap Button */}
        <Button 
          onClick={handleSwap}
          className="w-full eboy-button"
          disabled={!selectedFromToken || !selectedToToken}
        >
          <Filter className="mr-2 h-4 w-4" />
          Execute Biblical Swap
        </Button>

        {/* Display Selected Info */}
        {(selectedFromToken || selectedToToken) && (
          <div className="mt-4 p-3 bg-black/20 rounded border border-ancient-gold/20">
            <p className="text-xs font-pixel text-ancient-gold mb-2">Selected Tokens:</p>
            <div className="flex justify-between text-sm">
              <span>From: {selectedFromToken || 'None'}</span>
              <span>To: {selectedToToken || 'None'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DropdownShowcase;