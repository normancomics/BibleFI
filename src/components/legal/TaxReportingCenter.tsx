import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Calculator, 
  DollarSign, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TaxableEvent {
  id: string;
  type: 'stake' | 'unstake' | 'yield' | 'tithe' | 'swap' | 'transfer';
  amount: string;
  usdValue: string;
  timestamp: string;
  txHash: string;
  description: string;
}

interface TaxSummary {
  totalIncome: string;
  totalTithes: string;
  capitalGains: string;
  capitalLosses: string;
  form1099Required: boolean;
  estimatedTax: string;
}

export const TaxReportingCenter: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [taxEvents, setTaxEvents] = useState<TaxableEvent[]>([]);
  const [taxSummary, setTaxSummary] = useState<TaxSummary>({
    totalIncome: '0',
    totalTithes: '0',
    capitalGains: '0',
    capitalLosses: '0',
    form1099Required: false,
    estimatedTax: '0',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadTaxData(selectedYear);
  }, [selectedYear]);

  const loadTaxData = async (year: number) => {
    try {
      // Simulated tax data loading
      const mockEvents: TaxableEvent[] = [
        {
          id: '1',
          type: 'yield',
          amount: '150.0',
          usdValue: '2,250.00',
          timestamp: `${year}-03-15T10:30:00Z`,
          txHash: '0x1234...5678',
          description: 'Staking rewards received',
        },
        {
          id: '2',
          type: 'tithe',
          amount: '50.0',
          usdValue: '750.00',
          timestamp: `${year}-04-10T14:20:00Z`,
          txHash: '0x2345...6789',
          description: 'Digital tithe to local church',
        },
        {
          id: '3',
          type: 'swap',
          amount: '100.0',
          usdValue: '1,500.00',
          timestamp: `${year}-06-22T09:15:00Z`,
          txHash: '0x3456...7890',
          description: 'BIBLEFI to USDC swap',
        },
      ];

      setTaxEvents(mockEvents);

      // Calculate tax summary
      const totalIncome = mockEvents
        .filter(e => e.type === 'yield' || e.type === 'stake')
        .reduce((sum, e) => sum + parseFloat(e.usdValue.replace(/,/g, '')), 0);

      const totalTithes = mockEvents
        .filter(e => e.type === 'tithe')
        .reduce((sum, e) => sum + parseFloat(e.usdValue.replace(/,/g, '')), 0);

      setTaxSummary({
        totalIncome: totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        totalTithes: totalTithes.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        capitalGains: '0.00',
        capitalLosses: '0.00',
        form1099Required: totalIncome >= 600,
        estimatedTax: (totalIncome * 0.22).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      });

    } catch (error) {
      console.error('Error loading tax data:', error);
    }
  };

  const generateTaxReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would generate and download actual tax reports
      const reportData = {
        year: selectedYear,
        events: taxEvents,
        summary: taxSummary,
        generatedAt: new Date().toISOString(),
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bible-fi-tax-report-${selectedYear}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating tax report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'yield': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'tithe': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'swap': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'stake': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const availableYears = [2025, 2024, 2023];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Tax Reporting Center
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive tax reports for your DeFi activities
          </p>
        </CardHeader>
      </Card>

      {/* Year Selection and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tax Year:</span>
              </div>
              <div className="flex gap-2">
                {availableYears.map(year => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
            <Button 
              onClick={generateTaxReport}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Income</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${taxSummary.totalIncome}
            </div>
            <p className="text-xs text-muted-foreground">
              Staking & yield rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Tithes</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${taxSummary.totalTithes}
            </div>
            <p className="text-xs text-muted-foreground">
              Tax-deductible donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Estimated Tax</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${taxSummary.estimatedTax}
            </div>
            <p className="text-xs text-muted-foreground">
              22% marginal rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Form 1099</span>
            </div>
            <div className={`text-2xl font-bold ${
              taxSummary.form1099Required ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {taxSummary.form1099Required ? 'Required' : 'Not Required'}
            </div>
            <p className="text-xs text-muted-foreground">
              $600+ threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Guidelines */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important Tax Information:</strong> This report is for informational purposes only. 
          Consult a qualified tax professional for tax advice. DeFi activities may have complex tax implications. 
          "Render unto Caesar the things that are Caesar's" - Matthew 22:21
        </AlertDescription>
      </Alert>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Taxable Events ({selectedYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taxEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Badge className={getEventTypeColor(event.type)}>
                    {event.type.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{event.amount} BIBLEFI</p>
                  <p className="text-sm text-muted-foreground">${event.usdValue}</p>
                </div>
              </div>
            ))}
            
            {taxEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>No taxable events found for {selectedYear}</p>
                <p className="text-xs">Start using the platform to see activity here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">
                Tax Disclaimer
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                This tool provides estimates and summaries for informational purposes only. 
                Tax laws are complex and vary by jurisdiction. Always consult with a qualified 
                tax professional or CPA familiar with cryptocurrency taxation before making 
                tax-related decisions.
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 italic">
                "In all labor there is profit, but idle chatter leads only to poverty." - Proverbs 14:23
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};