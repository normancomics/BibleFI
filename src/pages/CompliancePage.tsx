import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, CheckCircle, AlertTriangle, Globe, FileText } from 'lucide-react';
import { LegalFooter } from '@/components/legal/LegalFooter';

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
          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Bible.fi operates within a comprehensive compliance framework designed to meet 
                regulatory requirements while serving our global community of users.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>Biblical Foundation:</strong> "Let everyone be subject to the governing authorities, 
                  for there is no authority except that which God has established." - Romans 13:1
                </p>
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