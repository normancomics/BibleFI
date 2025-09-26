import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, CheckCircle, AlertTriangle, Globe, FileText, Building2, Scale, Coins } from 'lucide-react';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { BusinessStructure } from '@/components/legal/BusinessStructure';

export const CompliancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl">
              <Users className="h-8 w-8 text-primary" />
              Regulatory Compliance
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Our commitment to legal and regulatory compliance
            </p>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <BusinessStructure />
          
          {/* Compliance Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Real-Time Compliance Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">AML Monitoring</h4>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Continuous transaction monitoring for suspicious activity patterns
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">KYC Verification</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Identity verification for transactions above regulatory thresholds
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300">Jurisdiction Checks</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Automated geo-blocking for restricted territories
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Framework */}
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">Federal Compliance</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• FinCEN Money Service Business (MSB) registration</li>
                    <li>• Bank Secrecy Act (BSA) compliance</li>
                    <li>• Anti-Money Laundering (AML) programs</li>
                    <li>• Suspicious Activity Report (SAR) filing</li>
                    <li>• OFAC sanctions screening</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary">State Compliance</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Money Transmitter License (MTL) where required</li>
                    <li>• State-specific disclosure requirements</li>
                    <li>• Consumer protection compliance</li>
                    <li>• Regulatory reporting and audits</li>
                    <li>• Data protection and privacy laws</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>$BIBLEFI Token Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Utility Token Classification</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  $BIBLEFI has been structured as a utility token to avoid securities classification under the Howey Test:
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-green-600 dark:text-green-400">Utility Functions</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Platform governance voting rights</li>
                    <li>• Access to premium Biblical content</li>
                    <li>• Staking rewards and yield farming</li>
                    <li>• Transaction fee discounts</li>
                    <li>• Community features and benefits</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-blue-600 dark:text-blue-400">Securities Avoidance</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• No investment promises or guarantees</li>
                    <li>• No passive income expectations</li>
                    <li>• Functional utility from day one</li>
                    <li>• Decentralized governance structure</li>
                    <li>• Clear utility-focused messaging</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Regulatory Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>Biblical Foundation:</strong> "Let everyone be subject to the governing authorities, 
                  for there is no authority except that which God has established." - Romans 13:1. 
                  Bible.fi implements proactive compliance protocols demonstrating good stewardship.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Enhanced Compliance:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Proactive FinCEN compliance</li>
                    <li>• State-by-state MSB analysis</li>
                    <li>• SEC no-action letter consideration</li>
                    <li>• Wyoming Utility Token Exemption</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Risk Management:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Crypto Crime Insurance ($10M)</li>
                    <li>• Smart Contract Coverage</li>
                    <li>• Multi-sig treasury (3/5)</li>
                    <li>• Emergency pause mechanisms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* US Federal Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                United States Federal Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Financial Regulations:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• SEC guidance on digital assets</li>
                    <li>• CFTC commodity regulations</li>
                    <li>• FinCEN AML/KYC requirements</li>
                    <li>• IRS tax reporting guidelines</li>
                    <li>• Bank Secrecy Act compliance</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Technology & Privacy:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• CCPA privacy requirements</li>
                    <li>• COPPA child protection</li>
                    <li>• Section 508 accessibility</li>
                    <li>• FTC fair practice standards</li>
                    <li>• GDPR considerations for EU users</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* State Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                State-Level Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Wyoming LLC Structure:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Wyoming Digital Asset Laws</li>
                    <li>• LLC operating requirements</li>
                    <li>• State tax compliance</li>
                    <li>• Business registration maintenance</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Multi-State Considerations:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Florida business activity (if applicable)</li>
                    <li>• California user privacy (CCPA)</li>
                    <li>• New York BitLicense monitoring</li>
                    <li>• Texas digital asset regulations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DeFi Specific Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DeFi Protocol Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Smart Contract Standards:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• ERC-20 token compliance</li>
                    <li>• Security audit requirements</li>
                    <li>• Upgrade governance mechanisms</li>
                    <li>• Emergency pause functionality</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Operational Compliance:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Liquidity pool disclosures</li>
                    <li>• Yield farming risk warnings</li>
                    <li>• Token economics transparency</li>
                    <li>• Governance participation rules</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* $BIBLEFI Token Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>$BIBLEFI Token Regulatory Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Utility Token Classification</h4>
                <p className="text-sm">
                  $BIBLEFI is designed as a utility token to facilitate platform governance, 
                  staking rewards, and ecosystem participation. It is not intended as a security 
                  or investment instrument.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Compliance Measures:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• No investment promises or guarantees</li>
                  <li>• Clear utility function documentation</li>
                  <li>• Decentralized governance structure</li>
                  <li>• Fair distribution mechanisms</li>
                  <li>• Transparent tokenomics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* International Considerations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Geographic Restrictions</h4>
                  <p className="text-sm">
                    Services may not be available in all jurisdictions. Users are responsible 
                    for ensuring compliance with their local laws and regulations.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Monitoring Jurisdictions:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• European Union (MiCA regulation)</li>
                      <li>• United Kingdom (FCA guidance)</li>
                      <li>• Canada (CSA frameworks)</li>
                      <li>• Australia (ASIC requirements)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Restricted Regions:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• OFAC sanctioned countries</li>
                      <li>• High-risk jurisdictions</li>
                      <li>• Areas with crypto bans</li>
                      <li>• Regulatory gray zones</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Ongoing Compliance Efforts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Regular Activities:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Legal counsel consultation</li>
                  <li>• Regulatory update monitoring</li>
                  <li>• Compliance policy updates</li>
                  <li>• Staff training programs</li>
                  <li>• Third-party compliance audits</li>
                </ul>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Commitment:</strong> Bible.fi is committed to maintaining the highest 
                  standards of legal and regulatory compliance as the regulatory landscape evolves.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
};