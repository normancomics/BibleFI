import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, BookOpen, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LendingPool {
  id: string;
  name: string;
  token: string;
  apy: number;
  totalSupplied: number;
  availableLiquidity: number;
  utilizationRate: number;
  biblicalPrinciple: string;
  riskLevel: 'low' | 'medium' | 'high';
  collateralRatio: number;
}

interface BorrowingOption {
  id: string;
  token: string;
  borrowRate: number;
  availableAmount: number;
  requiredCollateral: number;
  biblicalWarning: string;
  maxLTV: number;
}

interface UserPosition {
  supplied: { token: string; amount: number; apy: number }[];
  borrowed: { token: string; amount: number; rate: number }[];
  totalCollateral: number;
  borrowingPower: number;
  healthFactor: number;
}

const EnhancedBiblicalLending: React.FC = () => {
  const [userPosition, setUserPosition] = useState<UserPosition>({
    supplied: [
      { token: 'USDC', amount: 5000, apy: 4.2 },
      { token: 'ETH', amount: 2.5, apy: 3.8 }
    ],
    borrowed: [
      { token: 'DAI', amount: 2000, rate: 5.1 }
    ],
    totalCollateral: 12500,
    borrowingPower: 8750,
    healthFactor: 2.1
  });

  const [lendingPools] = useState<LendingPool[]>([
    {
      id: '1',
      name: 'Stable Steward Pool',
      token: 'USDC',
      apy: 4.2,
      totalSupplied: 2450000,
      availableLiquidity: 850000,
      utilizationRate: 65,
      biblicalPrinciple: "A faithful steward manages resources wisely - Proverbs 27:23",
      riskLevel: 'low',
      collateralRatio: 85
    },
    {
      id: '2',
      name: 'Prudent Provision Pool',
      token: 'ETH',
      apy: 3.8,
      totalSupplied: 15420,
      availableLiquidity: 5280,
      utilizationRate: 72,
      biblicalPrinciple: "Store up treasures where moth and rust do not destroy - Matthew 6:20",
      riskLevel: 'medium',
      collateralRatio: 75
    },
    {
      id: '3',
      name: 'Wisdom Wealth Pool',
      token: 'DAI',
      apy: 4.5,
      totalSupplied: 1800000,
      availableLiquidity: 420000,
      utilizationRate: 77,
      biblicalPrinciple: "The wise store up choice food and olive oil - Proverbs 21:20",
      riskLevel: 'low',
      collateralRatio: 80
    }
  ]);

  const [borrowingOptions] = useState<BorrowingOption[]>([
    {
      id: '1',
      token: 'USDC',
      borrowRate: 5.2,
      availableAmount: 850000,
      requiredCollateral: 1.18,
      biblicalWarning: "The borrower is slave to the lender - Proverbs 22:7",
      maxLTV: 85
    },
    {
      id: '2',
      token: 'DAI',
      borrowRate: 4.8,
      availableAmount: 420000,
      requiredCollateral: 1.25,
      biblicalWarning: "Be careful not to be ensnared by debt - Proverbs 6:1-5",
      maxLTV: 80
    },
    {
      id: '3',
      token: 'ETH',
      borrowRate: 6.1,
      availableAmount: 240,
      requiredCollateral: 1.33,
      biblicalWarning: "Count the cost before building - Luke 14:28",
      maxLTV: 75
    }
  ]);

  const [activeTab, setActiveTab] = useState('lend');
  const [selectedPool, setSelectedPool] = useState('');
  const [amount, setAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState([150]);
  const { toast } = useToast();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthFactorColor = (factor: number) => {
    if (factor >= 2) return 'text-green-600';
    if (factor >= 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleLend = () => {
    if (!selectedPool || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select a pool and enter an amount.",
        variant: "destructive"
      });
      return;
    }

    const pool = lendingPools.find(p => p.id === selectedPool);
    toast({
      title: "Lending Successful! 📈",
      description: `You've supplied ${amount} ${pool?.token} to ${pool?.name}`,
    });
    setAmount('');
  };

  const handleBorrow = () => {
    if (!selectedPool || !amount) {
      toast({
        title: "Missing Information", 
        description: "Please select a token and enter an amount.",
        variant: "destructive"
      });
      return;
    }

    const option = borrowingOptions.find(o => o.id === selectedPool);
    if (userPosition.healthFactor < 1.5) {
      toast({
        title: "Warning: Low Health Factor",
        description: "Consider the biblical wisdom: 'The prudent see danger and take refuge' - Proverbs 27:12",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Borrowing Successful! 💰",
      description: `You've borrowed ${amount} ${option?.token}. Remember: ${option?.biblicalWarning}`,
    });
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* User Position Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Your Position Overview</span>
          </CardTitle>
          <CardDescription>
            "Be diligent to know the state of your flocks" - Proverbs 27:23
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Collateral</p>
              <p className="text-2xl font-bold">${userPosition.totalCollateral.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Borrowing Power</p>
              <p className="text-2xl font-bold">${userPosition.borrowingPower.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Health Factor</p>
              <p className={`text-2xl font-bold ${getHealthFactorColor(userPosition.healthFactor)}`}>
                {userPosition.healthFactor.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
              <p className="text-2xl font-bold text-green-600">
                ${(userPosition.totalCollateral - userPosition.borrowed.reduce((sum, b) => sum + b.amount, 0)).toLocaleString()}
              </p>
            </div>
          </div>

          {userPosition.healthFactor < 1.5 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Biblical Wisdom: "The prudent see danger and take refuge" - Proverbs 27:12
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Lending/Borrowing Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lend">Supply (Lend)</TabsTrigger>
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="lend" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Supply Assets</span>
                </CardTitle>
                <CardDescription>Earn yield by supplying liquidity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lend-pool">Select Pool</Label>
                  <Select value={selectedPool} onValueChange={setSelectedPool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lending pool..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lendingPools.map(pool => (
                        <SelectItem key={pool.id} value={pool.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{pool.name} ({pool.token})</span>
                            <Badge variant="secondary" className="ml-2">
                              {pool.apy}% APY
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lend-amount">Amount</Label>
                  <Input
                    id="lend-amount"
                    type="number"
                    placeholder="Enter amount to supply"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button onClick={handleLend} className="w-full" size="lg">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Supply Assets
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {lendingPools.map(pool => (
                <Card key={pool.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">{pool.name}</h4>
                        <Badge variant="secondary">{pool.apy}% APY</Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3 inline mr-1" />
                        {pool.biblicalPrinciple}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Supplied</p>
                          <p className="font-medium">${pool.totalSupplied.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-medium">{pool.utilizationRate}%</p>
                        </div>
                      </div>
                      
                      <Progress value={pool.utilizationRate} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant={pool.riskLevel === 'low' ? 'secondary' : pool.riskLevel === 'medium' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {pool.riskLevel.toUpperCase()} RISK
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {pool.collateralRatio}% Collateral Ratio
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="borrow" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5" />
                  <span>Borrow Assets</span>
                </CardTitle>
                <CardDescription>Borrow against your collateral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="borrow-token">Select Token</Label>
                  <Select value={selectedPool} onValueChange={setSelectedPool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a token to borrow..." />
                    </SelectTrigger>
                    <SelectContent>
                      {borrowingOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.token}</span>
                            <Badge variant="outline" className="ml-2">
                              {option.borrowRate}% APR
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borrow-amount">Amount</Label>
                  <Input
                    id="borrow-amount"
                    type="number"
                    placeholder="Enter amount to borrow"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Collateral Safety ({collateralAmount[0]}%)</Label>
                  <Slider
                    value={collateralAmount}
                    onValueChange={setCollateralAmount}
                    max={300}
                    min={110}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher collateral = Lower liquidation risk
                  </p>
                </div>

                <Button onClick={handleBorrow} className="w-full" size="lg">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Borrow Assets
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {borrowingOptions.map(option => (
                <Card key={option.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">{option.token}</h4>
                        <Badge variant="outline">{option.borrowRate}% APR</Badge>
                      </div>
                      
                      <div className="text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        {option.biblicalWarning}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium">${option.availableAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Max LTV</p>
                          <p className="font-medium">{option.maxLTV}%</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Required Collateral Ratio: {option.requiredCollateral}x
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplied Assets</CardTitle>
                <CardDescription>Your lending positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userPosition.supplied.map((position, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div>
                        <p className="font-medium">{position.token}</p>
                        <p className="text-sm text-muted-foreground">Earning {position.apy}% APY</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{position.amount} {position.token}</p>
                        <p className="text-sm text-green-600">+{(position.amount * position.apy / 100 / 365).toFixed(4)} daily</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Borrowed Assets</CardTitle>
                <CardDescription>Your borrowing positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userPosition.borrowed.map((position, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div>
                        <p className="font-medium">{position.token}</p>
                        <p className="text-sm text-muted-foreground">Paying {position.rate}% APR</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{position.amount} {position.token}</p>
                        <p className="text-sm text-red-600">-{(position.amount * position.rate / 100 / 365).toFixed(4)} daily</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedBiblicalLending;