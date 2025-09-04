import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Banknote, TrendingUp, Shield, AlertTriangle, BookOpen, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedSound } from '@/components/enhanced/SoundSystemManager';
import PixelBackground from '@/components/graphics/PixelBackground';
import PixelCoin from '@/components/graphics/PixelCoin';
import { baseTokens } from '@/data/baseTokens';

interface EnhancedLendingPool {
  id: string;
  token: string;
  name: string;
  supplyAPY: string;
  borrowAPY: string;
  totalSupplied: string;
  totalBorrowed: string;
  mySupplied: string;
  myBorrowed: string;
  collateralFactor: string;
  liquidationThreshold: string;
  risk: 'low' | 'medium' | 'high';
  isStable: boolean;
  protocolName: string;
  biblicalPrinciple: {
    verse: string;
    reference: string;
    principle: string;
  };
}

const EnhancedDefiLending: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [lendAmount, setLendAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState<EnhancedLendingPool | null>(null);
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'risk'>('apy');
  const { toast } = useToast();
  const { playActionSound, playAchievementSound, playErrorSound } = useEnhancedSound();

  const enhancedLendingPools: EnhancedLendingPool[] = [
    {
      id: 'usdc-compound',
      token: 'USDC',
      name: 'USDC Stewardship Pool',
      supplyAPY: '4.2%',
      borrowAPY: '6.5%',
      totalSupplied: '2,400,000',
      totalBorrowed: '1,800,000',
      mySupplied: '0',
      myBorrowed: '0',
      collateralFactor: '75%',
      liquidationThreshold: '80%',
      risk: 'low',
      isStable: true,
      protocolName: 'BiblicalDeFi',
      biblicalPrinciple: {
        verse: "Whoever can be trusted with very little can also be trusted with much",
        reference: "Luke 16:10",
        principle: "Faithful in Little, Faithful in Much"
      }
    },
    {
      id: 'eth-aave',
      token: 'ETH',
      name: 'ETH Treasure Vault',
      supplyAPY: '2.1%',
      borrowAPY: '4.2%',
      totalSupplied: '8,900,000',
      totalBorrowed: '5,600,000',
      mySupplied: '0',
      myBorrowed: '0',
      collateralFactor: '80%',
      liquidationThreshold: '85%',
      risk: 'medium',
      isStable: false,
      protocolName: 'BiblicalDeFi',
      biblicalPrinciple: {
        verse: "Store up for yourselves treasures in heaven",
        reference: "Matthew 6:20",
        principle: "Eternal Investment Mindset"
      }
    },
    {
      id: 'dai-maker',
      token: 'DAI',
      name: 'DAI Wisdom Pool',
      supplyAPY: '3.8%',
      borrowAPY: '5.9%',
      totalSupplied: '1,800,000',
      totalBorrowed: '1,260,000',
      mySupplied: '0',
      myBorrowed: '0',
      collateralFactor: '70%',
      liquidationThreshold: '75%',
      risk: 'low',
      isStable: true,
      protocolName: 'BiblicalDeFi',
      biblicalPrinciple: {
        verse: "The wise store up choice food and olive oil",
        reference: "Proverbs 21:20",
        principle: "Wise Resource Management"
      }
    },
    {
      id: 'wbtc-compound',
      token: 'WBTC',
      name: 'WBTC Foundation Pool',
      supplyAPY: '1.5%',
      borrowAPY: '3.8%',
      totalSupplied: '156,000,000',
      totalBorrowed: '98,000,000',
      mySupplied: '0',
      myBorrowed: '0',
      collateralFactor: '70%',
      liquidationThreshold: '75%',
      risk: 'medium',
      isStable: false,
      protocolName: 'BiblicalDeFi',
      biblicalPrinciple: {
        verse: "Unless the LORD builds the house, the builders labor in vain",
        reference: "Psalm 127:1",
        principle: "Build on Solid Foundation"
      }
    }
  ];

  const tokenOptions = Object.keys(baseTokens);

  const getFilteredPools = () => {
    let filtered = enhancedLendingPools;
    
    if (selectedToken) {
      filtered = filtered.filter(pool => pool.token === selectedToken);
    }
    
    // Sort pools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'apy':
          return parseFloat(b.supplyAPY) - parseFloat(a.supplyAPY);
        case 'tvl':
          return parseFloat(b.totalSupplied.replace(/,/g, '')) - parseFloat(a.totalSupplied.replace(/,/g, ''));
        case 'risk':
          const riskOrder = { 'low': 0, 'medium': 1, 'high': 2 };
          return riskOrder[a.risk] - riskOrder[b.risk];
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getTokenLogo = (symbol: string) => {
    const token = baseTokens[symbol];
    return token?.logoURI || '/coin-pixel.png';
  };

  const handleLend = () => {
    if (!selectedPool || !lendAmount) {
      playErrorSound();
      toast({
        title: "Missing Information",
        description: "Please select a pool and enter an amount to lend.",
        variant: "destructive",
      });
      return;
    }

    playAchievementSound();
    toast({
      title: "🏛️ Lending Position Created",
      description: `Successfully lent ${lendAmount} ${selectedPool.token} earning ${selectedPool.supplyAPY} APY`,
    });
    setLendAmount('');
  };

  const handleBorrow = () => {
    if (!selectedPool || !borrowAmount) {
      playErrorSound();
      toast({
        title: "Missing Information", 
        description: "Please select a pool and enter an amount to borrow.",
        variant: "destructive",
      });
      return;
    }

    playActionSound();
    toast({
      title: "⚠️ Borrowing Position Created",
      description: `Successfully borrowed ${borrowAmount} ${selectedPool.token} at ${selectedPool.borrowAPY} rate`,
      variant: "default",
    });
    setBorrowAmount('');
  };

  return (
    <div className="relative min-h-screen">
      <PixelBackground theme="temple" animated />
      
      <div className="relative z-10 space-y-6 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="eboy-title text-4xl mb-2">Biblical Lending Pools</h1>
          <p className="text-scripture font-scroll">Where faithful stewardship meets decentralized finance</p>
        </div>

        {/* Filters */}
        <Card className="isometric-card bg-gradient-to-br from-iso-wall-light/90 to-iso-wall-dark/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-eboy-green">
              <Star className="h-5 w-5" />
              Filter & Sort Pools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-pixel text-white/80 mb-2">Token</label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="isometric-card bg-black/30 border-eboy-green/30">
                    <SelectValue placeholder="All tokens" />
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-to-br from-iso-wall-light to-iso-wall-dark border-eboy-green/30">
                    <SelectItem value="">All Tokens</SelectItem>
                    {tokenOptions.map((token) => (
                      <SelectItem key={token} value={token}>
                        <div className="flex items-center gap-2">
                          <img src={getTokenLogo(token)} alt={token} className="w-4 h-4 rounded-full pixelated" />
                          <span>{token}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-pixel text-white/80 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={(value: 'apy' | 'tvl' | 'risk') => setSortBy(value)}>
                  <SelectTrigger className="isometric-card bg-black/30 border-eboy-green/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-to-br from-iso-wall-light to-iso-wall-dark border-eboy-green/30">
                    <SelectItem value="apy">Highest APY</SelectItem>
                    <SelectItem value="tvl">Highest TVL</SelectItem>
                    <SelectItem value="risk">Lowest Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSelectedToken('');
                    setSortBy('apy');
                    playActionSound();
                  }}
                  variant="outline"
                  className="eboy-button w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pool Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {getFilteredPools().map((pool) => (
            <Card 
              key={pool.id}
              className={`cursor-pointer transition-all duration-300 isometric-card bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm ${
                selectedPool?.id === pool.id 
                  ? 'border-ancient-gold eboy-glow' 
                  : 'border-eboy-green/30 hover:border-eboy-green/60'
              }`}
              onClick={() => {
                setSelectedPool(pool);
                playActionSound();
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <img 
                      src={getTokenLogo(pool.token)} 
                      alt={pool.token}
                      className="w-8 h-8 rounded-full pixelated"
                    />
                    <div>
                      <CardTitle className="text-lg text-white font-bold">{pool.name}</CardTitle>
                      <p className="text-sm text-white/80 font-medium">{pool.protocolName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <PixelCoin type={pool.isStable ? "gold" : "crypto"} size="sm" animated />
                    <Badge className={`${getRiskColor(pool.risk)} bg-black/30`}>
                      {pool.risk.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/80 font-medium">Supply APY</p>
                    <p className="text-lg font-bold text-green-400">{pool.supplyAPY}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/80 font-medium">Borrow APY</p>
                    <p className="text-lg font-bold text-red-400">{pool.borrowAPY}</p>
                  </div>
                </div>

                <div className="bg-black/20 p-2 rounded border border-ancient-gold/20">
                  <div className="flex items-center gap-1 text-ancient-gold text-xs mb-1">
                    <BookOpen className="h-3 w-3" />
                    <span className="font-pixel">{pool.biblicalPrinciple.principle}</span>
                  </div>
                  <p className="text-xs italic text-white/80">"{pool.biblicalPrinciple.verse}"</p>
                  <p className="text-xs text-ancient-gold/70 text-right mt-1">
                    - {pool.biblicalPrinciple.reference}
                  </p>
                </div>

                <div className="text-xs text-white/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Supplied:</span>
                    <span className="text-white font-bold">${pool.totalSupplied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Borrowed:</span>
                    <span className="text-white font-bold">${pool.totalBorrowed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Panel */}
        {selectedPool && (
          <Card className="isometric-card bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-sm animate-entrance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ancient-gold">
                <img 
                  src={getTokenLogo(selectedPool.token)} 
                  alt={selectedPool.token}
                  className="w-6 h-6 rounded-full pixelated"
                />
                {selectedPool.name} Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="lend">
                <TabsList className="grid w-full grid-cols-2 bg-black/30">
                  <TabsTrigger value="lend" className="data-[state=active]:bg-green-600/30">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Supply/Lend
                  </TabsTrigger>
                  <TabsTrigger value="borrow" className="data-[state=active]:bg-red-600/30">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Borrow
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="lend" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder={`Amount to supply (${selectedPool.token})`}
                      value={lendAmount}
                      onChange={(e) => setLendAmount(e.target.value)}
                      className="bg-black/30 border-eboy-green/30"
                    />
                    <Button onClick={handleLend} className="w-full eboy-button">
                      <Banknote className="mr-2 h-4 w-4" />
                      Supply {selectedPool.token} & Earn {selectedPool.supplyAPY}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="borrow" className="space-y-4 mt-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-pixel text-sm">Biblical Wisdom</span>
                    </div>
                    <p className="text-xs text-amber-200/80 italic">
                      "The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7
                    </p>
                    <p className="text-xs text-amber-200/80 mt-1">
                      Borrow responsibly and within your means. Collateral Factor: {selectedPool.collateralFactor}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder={`Amount to borrow (${selectedPool.token})`}
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="bg-black/30 border-eboy-green/30"
                    />
                    <Button onClick={handleBorrow} className="w-full bg-orange-600 hover:bg-orange-700">
                      <Shield className="mr-2 h-4 w-4" />
                      Borrow {selectedPool.token} at {selectedPool.borrowAPY}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedDefiLending;