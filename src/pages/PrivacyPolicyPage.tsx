import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, Shield, Database, Users, Globe } from 'lucide-react';
import { LegalFooter } from '@/components/legal/LegalFooter';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl">
              <Lock className="h-8 w-8 text-primary" />
              Privacy Policy
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At Bible.fi, we are committed to protecting your privacy and maintaining the highest 
                standards of data security. This Privacy Policy explains how we collect, use, and 
                safeguard your information.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>Biblical Principle:</strong> "Above all else, guard your heart, for everything 
                  you do flows from it." - Proverbs 4:23. We guard your data with the same care.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Automatically Collected:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Wallet addresses (public)</li>
                    <li>• Transaction hashes</li>
                    <li>• IP addresses (anonymized)</li>
                    <li>• Browser information</li>
                    <li>• Usage analytics</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">User Provided:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Farcaster profile data</li>
                    <li>• Church selection preferences</li>
                    <li>• Wisdom sharing content</li>
                    <li>• Support communications</li>
                    <li>• Optional profile information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Core Service Functions:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Processing DeFi transactions</li>
                    <li>• Facilitating digital tithing</li>
                    <li>• Calculating yield farming rewards</li>
                    <li>• Displaying portfolio analytics</li>
                    <li>• Enabling wisdom sharing features</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Platform Improvement:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Analytics and usage patterns</li>
                    <li>• Security monitoring</li>
                    <li>• Feature optimization</li>
                    <li>• Bug fixes and performance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400">Technical Safeguards:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• End-to-end encryption</li>
                    <li>• Secure data transmission (HTTPS)</li>
                    <li>• Regular security audits</li>
                    <li>• Access controls & monitoring</li>
                    <li>• Data minimization practices</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600 dark:text-green-400">Privacy by Design:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• No personal data on blockchain</li>
                    <li>• Optional user information</li>
                    <li>• Anonymous analytics</li>
                    <li>• Local data storage when possible</li>
                    <li>• Regular data purging</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Third-Party Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Bible.fi integrates with several third-party services to provide comprehensive functionality:
              </p>
              <div className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Blockchain Services:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Base Network (Coinbase)</li>
                    <li>• Wallet providers (Coinbase, WalletConnect)</li>
                    <li>• DeFi protocols (Uniswap, Superfluid)</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Social & Authentication:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Farcaster Protocol</li>
                    <li>• Payment processors (for fiat conversions)</li>
                    <li>• Analytics services (anonymized)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Rights & Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Data Rights:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Access your data</li>
                    <li>• Request corrections</li>
                    <li>• Data portability</li>
                    <li>• Deletion requests</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Control Options:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Wallet disconnection</li>
                    <li>• Analytics opt-out</li>
                    <li>• Communication preferences</li>
                    <li>• Feature customization</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Contact Us:</strong> For privacy-related requests, contact us at privacy@bible.fi 
                  or through our support channels.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Bible.fi is committed to compliance with applicable privacy laws and regulations:
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• CCPA (California Consumer Privacy Act)</li>
                <li>• GDPR considerations for international users</li>
                <li>• Financial privacy regulations</li>
                <li>• State-specific privacy laws</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <LegalFooter />
      </div>
    </div>
  );
};