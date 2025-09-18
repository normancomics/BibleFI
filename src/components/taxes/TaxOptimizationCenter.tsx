import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingDown, TrendingUp, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaxEvent {
  id: string;
  date: string;
  type: 'trade' | 'stake' | 'defi' | 'tithe';
  description: string;
  amount: number;
  gainLoss: number;
  category: string;
}

interface TaxOptimization {
  strategy: string;
  description: string;
  potentialSavings: number;
  timeframe: string;
  biblicalReference: string;
  actionRequired: string;
}

interface TaxSummary {
  totalGains: number;
  totalLosses: number;
  netPosition: number;
  titheDeductions: number;
  estimatedTax: number;
  optimizationPotential: number;
}

const TaxOptimizationCenter: React.FC = () => {
  const [taxYear, setTaxYear] = useState('2024');
  const [taxSummary, setTaxSummary] = useState<TaxSummary>({
    totalGains: 8450.75,
    totalLosses: -2340.25,
    netPosition: 6110.50,
    titheDeductions: 2850.00,
    estimatedTax: 1527.63,
    optimizationPotential: 485.20
  });

  const [taxEvents] = useState<TaxEvent[]>([
    {
      id: '1',
      date: '2024-01-15',
      type: 'trade',
      description: 'ETH to USDC Swap',
      amount: 5000,
      gainLoss: 850.50,
      category: 'Short-term Capital Gain'
    },
    {
      id: '2',
      date: '2024-02-20',
      type: 'stake',
      description: 'USDC Staking Rewards',
      amount: 2500,
      gainLoss: 125.30,
      category: 'Ordinary Income'
    },
    {
      id: '3',
      date: '2024-03-10',
      type: 'tithe',
      description: 'Digital Tithe to Grace Church',
      amount: 500,
      gainLoss: -500,
      category: 'Charitable Deduction'
    },
    {
      id: '4',
      date: '2024-04-05',
      type: 'defi',
      description: 'Liquidity Pool Rewards',
      amount: 1200,
      gainLoss: 320.75,
      category: 'DeFi Income'
    }
  ]);

  const [optimizations] = useState<TaxOptimization[]>([
    {
      strategy: 'Tax Loss Harvesting',
      description: 'Realize losses to offset gains before year-end',
      potentialSavings: 285.40,
      timeframe: 'Before December 31st',
      biblicalReference: 'Be as shrewd as snakes and as innocent as doves - Matthew 10:16',
      actionRequired: 'Review underwater positions'
    },
    {
      strategy: 'Tithe Maximization',
      description: 'Increase charitable giving for additional deductions',
      potentialSavings: 142.80,
      timeframe: 'Ongoing',
      biblicalReference: 'Give, and it will be given to you - Luke 6:38',
      actionRequired: 'Schedule regular tithing'
    },
    {
      strategy: 'Long-term Holding',
      description: 'Hold positions >1 year for better tax rates',
      potentialSavings: 57.00,
      timeframe: 'Next tax year',
      biblicalReference: 'Patience is better than pride - Ecclesiastes 7:8',
      actionRequired: 'Review holding periods'
    }
  ]);

  const { toast } = useToast();

  const generateTaxReport = () => {
    toast({
      title: "Tax Report Generated! 📊",
      description: "Your comprehensive tax report has been prepared for download.",
    });
  };

  const applyOptimization = (strategy: string) => {
    toast({
      title: "Optimization Applied! 💡",
      description: `${strategy} strategy has been implemented for your portfolio.`,
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'trade': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'stake': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'defi': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'tithe': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-100 dark:from-green-950 dark:to-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <span>Tax Optimization Center</span>
          </CardTitle>
          <CardDescription>
            "Render unto Caesar what is Caesar's" - Matthew 22:21
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Capital Gains</p>
              <p className="text-2xl font-bold text-green-600">${taxSummary.netPosition.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tithe Deductions</p>
              <p className="text-2xl font-bold text-orange-600">${taxSummary.titheDeductions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Tax</p>
              <p className="text-2xl font-bold text-red-600">${taxSummary.estimatedTax.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Savings Potential</p>
              <p className="text-2xl font-bold text-blue-600">${taxSummary.optimizationPotential.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Tax Events</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Year Summary</CardTitle>
                <CardDescription>Your {taxYear} tax position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Gains</span>
                    <span className="text-green-600 font-bold">${taxSummary.totalGains.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Losses</span>
                    <span className="text-red-600 font-bold">${Math.abs(taxSummary.totalLosses).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Position</span>
                      <span className="text-lg font-bold">${taxSummary.netPosition.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tax Efficiency Score</Label>
                  <Progress value={75} className="w-full" />
                  <p className="text-sm text-muted-foreground">75% - Good with room for improvement</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Biblical Tax Wisdom</CardTitle>
                <CardDescription>Scriptural guidance for tax matters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Matthew 22:21</h4>
                  <p className="text-sm text-muted-foreground">
                    "Render unto Caesar the things that are Caesar's, and unto God the things that are God's."
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                  <h4 className="font-semibold mb-2">Romans 13:7</h4>
                  <p className="text-sm text-muted-foreground">
                    "Pay to all what is owed to them: taxes to whom taxes are owed, revenue to whom revenue is owed."
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
                  <h4 className="font-semibold mb-2">Proverbs 27:23</h4>
                  <p className="text-sm text-muted-foreground">
                    "Be diligent to know the state of your flocks, and look well to your herds."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Tax Events ({taxYear})</span>
              </CardTitle>
              <CardDescription>All taxable events for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                    <div className="flex items-center space-x-4">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">{event.date} • {event.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${event.amount.toLocaleString()}</p>
                      <p className={`text-sm ${event.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {event.gainLoss >= 0 ? '+' : ''}${event.gainLoss.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {optimizations.map((opt, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{opt.strategy}</span>
                    <Badge variant="secondary" className="text-green-600">
                      Save ${opt.potentialSavings}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{opt.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Timeframe</p>
                      <p className="font-medium">{opt.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Action Required</p>
                      <p className="font-medium">{opt.actionRequired}</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
                    <p className="text-sm font-medium mb-1">Biblical Wisdom</p>
                    <p className="text-sm text-muted-foreground">{opt.biblicalReference}</p>
                  </div>

                  <Button 
                    onClick={() => applyOptimization(opt.strategy)}
                    className="w-full"
                    variant="outline"
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Apply Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Tax Reports & Documents</span>
              </CardTitle>
              <CardDescription>Generate and download tax documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Form 8949 (Capital Gains)</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete capital gains and losses report for Schedule D
                  </p>
                  <Button onClick={generateTaxReport} variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Form 8949
                  </Button>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Charitable Deductions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Summary of all tithe and charitable contributions
                  </p>
                  <Button onClick={generateTaxReport} variant="outline" className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Generate Deduction Report
                  </Button>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">DeFi Activity Summary</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Staking, lending, and yield farming income report
                  </p>
                  <Button onClick={generateTaxReport} variant="outline" className="w-full">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate DeFi Report
                  </Button>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Complete Tax Package</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    All tax documents in one comprehensive package
                  </p>
                  <Button onClick={generateTaxReport} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Full Package
                  </Button>
                </Card>
              </div>

              <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Notice</p>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  These reports are generated for informational purposes. Please consult with a qualified tax professional 
                  for official tax advice and preparation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxOptimizationCenter;