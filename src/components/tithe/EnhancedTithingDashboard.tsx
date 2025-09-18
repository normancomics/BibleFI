import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, DollarSign, TrendingUp, Users, Clock, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { realTimeDataService } from '@/services/realTimeDataService';

interface TithingStats {
  totalTithed: number;
  monthlyGoal: number;
  churchesSupported: number;
  lastTithe: string;
  yearlyTotal: number;
  impactScore: number;
}

interface Church {
  id: string;
  name: string;
  denomination: string;
  location: string;
  cryptoEnabled: boolean;
  fiatEnabled: boolean;
  impactScore: number;
  membersCount: number;
}

const EnhancedTithingDashboard: React.FC = () => {
  const [tithingStats, setTithingStats] = useState<TithingStats>({
    totalTithed: 2450.75,
    monthlyGoal: 500,
    churchesSupported: 3,
    lastTithe: '2024-01-15',
    yearlyTotal: 5820.40,
    impactScore: 87
  });

  const [churches] = useState<Church[]>([
    {
      id: '1',
      name: 'Grace Community Church',
      denomination: 'Non-denominational',
      location: 'Austin, TX',
      cryptoEnabled: true,
      fiatEnabled: true,
      impactScore: 95,
      membersCount: 1250
    },
    {
      id: '2',
      name: 'First Baptist Downtown',
      denomination: 'Baptist',
      location: 'Nashville, TN',
      cryptoEnabled: false,
      fiatEnabled: true,
      impactScore: 88,
      membersCount: 2100
    },
    {
      id: '3',
      name: 'New Life Fellowship',
      denomination: 'Pentecostal',
      location: 'Phoenix, AZ',
      cryptoEnabled: true,
      fiatEnabled: true,
      impactScore: 92,
      membersCount: 850
    }
  ]);

  const [selectedChurch, setSelectedChurch] = useState<string>('');
  const [tithingAmount, setTithingAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleTithe = async () => {
    if (!selectedChurch || !tithingAmount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const church = churches.find(c => c.id === selectedChurch);
      setTithingStats(prev => ({
        ...prev,
        totalTithed: prev.totalTithed + parseFloat(tithingAmount),
        yearlyTotal: prev.yearlyTotal + parseFloat(tithingAmount),
        lastTithe: new Date().toISOString().split('T')[0]
      }));

      toast({
        title: "Tithe Successful! 🙏",
        description: `Your tithe of $${tithingAmount} to ${church?.name} has been processed.`,
      });

      setTithingAmount('');
      setIsProcessing(false);
    }, 2000);
  };

  const monthlyProgress = (tithingStats.totalTithed / tithingStats.monthlyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tithed</p>
                <p className="text-2xl font-bold">${tithingStats.totalTithed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Goal</p>
                <p className="text-2xl font-bold">{monthlyProgress.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churches Supported</p>
                <p className="text-2xl font-bold">{tithingStats.churchesSupported}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impact Score</p>
                <p className="text-2xl font-bold">{tithingStats.impactScore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tithe" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tithe">Give Tithe</TabsTrigger>
          <TabsTrigger value="churches">Churches</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="tithe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Digital Tithing</span>
              </CardTitle>
              <CardDescription>
                "Give, and it will be given to you..." - Luke 6:38
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="church">Select Church</Label>
                  <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a church..." />
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map(church => (
                        <SelectItem key={church.id} value={church.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{church.name}</span>
                            <div className="flex space-x-1 ml-2">
                              {church.cryptoEnabled && (
                                <Badge variant="secondary" className="text-xs">Crypto</Badge>
                              )}
                              {church.fiatEnabled && (
                                <Badge variant="outline" className="text-xs">Fiat</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={tithingAmount}
                    onChange={(e) => setTithingAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment method..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usdc">USDC (Stable)</SelectItem>
                      <SelectItem value="eth">ETH</SelectItem>
                      <SelectItem value="dai">DAI (Stable)</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Progress</Label>
                  <Progress value={monthlyProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    ${tithingStats.totalTithed} of ${tithingStats.monthlyGoal} monthly goal
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleTithe} 
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Give Tithe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churches" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {churches.map(church => (
              <Card key={church.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{church.name}</CardTitle>
                  <CardDescription>{church.denomination} • {church.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Impact Score</span>
                      <Badge variant={church.impactScore >= 90 ? "default" : "secondary"}>
                        {church.impactScore}/100
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Members</span>
                      <span className="text-sm">{church.membersCount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {church.cryptoEnabled && (
                        <Badge variant="secondary">Crypto Enabled</Badge>
                      )}
                      {church.fiatEnabled && (
                        <Badge variant="outline">Fiat Enabled</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Giving Impact</CardTitle>
              <CardDescription>See how your tithes are making a difference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">${tithingStats.yearlyTotal.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total This Year</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{tithingStats.churchesSupported}</p>
                    <p className="text-sm text-muted-foreground">Churches Supported</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{tithingStats.impactScore}</p>
                    <p className="text-sm text-muted-foreground">Impact Score</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <h4 className="font-semibold mb-2">Biblical Principle</h4>
                  <p className="text-sm text-muted-foreground">
                    "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, 
                    for God loves a cheerful giver." - 2 Corinthians 9:7
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTithingDashboard;