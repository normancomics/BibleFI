import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, AlertTriangle, Users } from 'lucide-react';
import { LegalFooter } from '@/components/legal/LegalFooter';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl">
              <FileText className="h-8 w-8 text-primary" />
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Acceptance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing or using Bible.fi ("the Service"), you covenant before God and agree to be bound by 
                these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use the Service.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Biblical Foundation:</strong> "Where no counsel is, the people fall: but in the multitude 
                  of counsellors there is safety." - Proverbs 11:14 (KJV). This platform operates on Biblical principles. 
                  Users agree to engage with integrity, honesty, and good stewardship.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Express Consent Required:</strong> By checking the agreement box during registration, 
                  you provide express consent to these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Bible.fi is a decentralized finance (DeFi) application that integrates Biblical financial 
                principles with modern blockchain technology on the Base network.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Services Include:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Digital tithing platform</li>
                    <li>• DeFi staking and yield farming</li>
                    <li>• Biblical financial education</li>
                    <li>• $BIBLEFI token ecosystem</li>
                    <li>• Community wisdom sharing</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Supported Wallets:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Coinbase Wallet</li>
                    <li>• Farcaster Wallet</li>
                    <li>• WalletConnect (Reown)</li>
                    <li>• Rainbow Wallet</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                3. Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Protected Materials</h4>
                <p className="text-sm">
                  All content, including smart contract architecture, algorithmic implementations, 
                  user interfaces, and the unique synthesis of Biblical principles with DeFi protocols, 
                  are protected under U.S. and international copyright laws.
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>© 2025 Bible.fi Holdings LLC. All rights reserved.</strong></p>
                <p>Bible.fi™, Biblefi.xyz™, Biblical DeFi™, and $BIBLEFI™ are trademarks of Bible.fi Holdings LLC.</p>
                <p>
                  Protected materials include: smart contract architecture, algorithmic implementations, 
                  Biblical principle → DeFi mechanism mapping, tithing algorithms, wisdom scoring methodology, 
                  and faith-based yield optimization formulas.
                </p>
                <p>
                  Users may not reproduce, distribute, modify, or create derivative works without 
                  explicit written permission from Bible.fi Holdings LLC.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                4. Risk Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-orange-600 dark:text-orange-400">Financial Risks</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cryptocurrency volatility</li>
                    <li>• Smart contract risks</li>
                    <li>• Impermanent loss in liquidity pools</li>
                    <li>• Regulatory changes</li>
                    <li>• Technology risks</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400">User Responsibilities</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Secure wallet management</li>
                    <li>• Tax compliance</li>
                    <li>• Due diligence</li>
                    <li>• Local law compliance</li>
                    <li>• Risk assessment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Terms */}
          <Card>
            <CardHeader>
              <CardTitle>5. $BIBLEFI Token Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The $BIBLEFI token is a utility token designed to facilitate ecosystem participation 
                and governance within the Bible.fi platform.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Token Utility:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Governance voting rights</li>
                  <li>• Staking rewards</li>
                  <li>• Access to premium features</li>
                  <li>• Community participation benefits</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>UTILITY TOKEN DISCLAIMER:</strong> $BIBLEFI tokens are utility tokens providing platform 
                  access and governance rights. They are NOT investments, securities, or promises of profit. 
                  Token value may fluctuate. Past wisdom does not guarantee future understanding. NOT FDIC insured. 
                  You may lose funds. Seek financial and Godly-spiritual counsel (Proverbs 11:14).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>6. Governing Law & Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the 
                State of Wyoming, United States, without regard to conflict of law principles.
              </p>
              <p className="text-sm text-muted-foreground">
                Any disputes arising from these Terms shall be resolved through binding arbitration 
                in Wyoming, or as otherwise required by applicable law.
              </p>
            </CardContent>
          </Card>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
};