import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield, Scale, Coins } from 'lucide-react';

export const BusinessStructure: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Business Structure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Corporate Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">BibleFi Holdings LLC (Wyoming)</h4>
            <div className="space-y-2 text-sm text-muted-foreground ml-4">
              <div>├── BibleFi Operations LLC (Series A)</div>
              <div>├── BibleFi IP Holdings LLC (Series B)</div>
              <div>└── BibleFi Treasury LLC (Series C)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Framework */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-4 w-4" />
              IP Protection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">USPTO Applications Filed:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• "BibleFi" (Classes 9, 36, 42)</li>
                <li>• "$BIBLEFI" (Classes 9, 36)</li>
                <li>• "Biblical DeFi" (Classes 36, 42)</li>
                <li>• Logo designs (stylized cross/blockchain)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-4 w-4" />
              Regulatory Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Compliance Framework:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Third-party security audits</li>
                <li>• Multi-sig treasury (3/5)</li>
                <li>• Time-locked admin functions</li>
                <li>• Emergency pause mechanisms</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Legal Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            $BIBLEFI Token Legal Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 dark:text-green-400">Utility Classification</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Governance voting rights</li>
                <li>• Premium Biblical content access</li>
                <li>• Wisdom staking multipliers</li>
                <li>• Transaction fee reductions</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">Howey Test Compliance</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• No investment promises</li>
                <li>• No passive income guarantees</li>
                <li>• Functional at launch</li>
                <li>• Decentralized control structure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Insurance Coverage</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Crypto Crime Insurance ($10M)</li>
                <li>• E&O/Professional Liability ($5M)</li>
                <li>• Smart Contract Coverage (Nexus Mutual)</li>
                <li>• Directors & Officers (if applicable)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Safety Mechanisms</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Maximum slippage protection (3%)</li>
                <li>• Withdrawal cooldown periods</li>
                <li>• Daily withdrawal limits</li>
                <li>• Emergency pause functionality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};