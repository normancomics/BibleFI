import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { TaxReportingCenter } from '@/components/legal/TaxReportingCenter';

export const TaxCompliancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl">
              <Calculator className="h-8 w-8 text-primary" />
              Tax Compliance Center
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              "Render unto Caesar the things that are Caesar's" - Matthew 22:21
            </p>
          </CardHeader>
        </Card>

        {/* Tax Guidelines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Compliance Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Taxable Events</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Staking rewards received (ordinary income)</li>
                  <li>• Yield farming rewards (ordinary income)</li>
                  <li>• Token swaps (capital gains/losses)</li>
                  <li>• DeFi protocol interactions</li>
                  <li>• Liquidity pool rewards</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Tax-Deductible Activities</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Digital tithes to 501(c)(3) churches</li>
                  <li>• Charitable donations via platform</li>
                  <li>• Transaction fees (as investment expenses)</li>
                  <li>• Educational content subscriptions</li>
                  <li>• Platform usage fees</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                    Important Tax Considerations
                  </h4>
                  <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                    <li>• All DeFi activities are subject to U.S. tax obligations</li>
                    <li>• Keep detailed records of all transactions</li>
                    <li>• Consider estimated quarterly tax payments</li>
                    <li>• Consult qualified tax professionals</li>
                    <li>• State tax obligations may also apply</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Reporting Center */}
        <TaxReportingCenter />

        {/* IRS Form Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              IRS Form Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300">Form 1099-MISC</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Issued for staking rewards and DeFi income over $600
                </p>
                <div className="mt-3 text-xs text-blue-500 dark:text-blue-400">
                  Threshold: $600+ per year
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-700 dark:text-green-300">Form 8949</h4>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Required for reporting capital gains/losses from token sales
                </p>
                <div className="mt-3 text-xs text-green-500 dark:text-green-400">
                  All dispositions required
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">Schedule B</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                  Foreign account reporting if crypto held on foreign exchanges
                </p>
                <div className="mt-3 text-xs text-purple-500 dark:text-purple-400">
                  $10,000+ threshold
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-8 border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700 dark:text-red-400">
                  Tax Professional Disclaimer
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  This information is provided for educational purposes only and does not constitute 
                  tax advice. Cryptocurrency taxation is complex and rapidly evolving. Always consult 
                  with a qualified tax professional or CPA who specializes in cryptocurrency taxation 
                  before making any tax-related decisions.
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 italic">
                  "Plans fail for lack of counsel, but with many advisers they succeed." - Proverbs 15:22
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <LegalFooter />
      </div>
    </div>
  );
};