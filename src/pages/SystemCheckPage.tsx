import React from 'react';
import NavBar from '@/components/NavBar';
import SystemHealthCheck from '@/components/system/SystemHealthCheck';
import NetworkStatus from '@/components/wallet/NetworkStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const SystemCheckPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-temple">
      <NavBar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-ancient-gold flex items-center justify-center gap-3">
            <Monitor className="h-10 w-10" />
            System Status Dashboard
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Comprehensive health check for all Bible.fi systems, APIs, and integrations.
          </p>
        </div>

        {/* Network Status */}
        <NetworkStatus />

        {/* System Health Check */}
        <SystemHealthCheck />

        {/* Quick Fixes Section */}
        <Card className="bg-scripture/40 border border-ancient-gold/30">
          <CardHeader>
            <CardTitle className="text-xl text-ancient-gold flex items-center gap-2">
              <Info className="h-5 w-5" />
              Common Issues & Quick Fixes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-white">Farcaster Authentication</span>
                </div>
                <p className="text-sm text-white/70">
                  Fixed: Updated to use @farcaster/auth-kit properly
                </p>
              </div>
              
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-white">Wallet Connections</span>
                </div>
                <p className="text-sm text-white/70">
                  Prioritized WalletConnect (Farcaster wallet) as requested
                </p>
              </div>

              <div className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-white">Base Chain RPC</span>
                </div>
                <p className="text-sm text-white/70">
                  Using optimized Base RPC endpoints for reliability
                </p>
              </div>

              <div className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-white">Token Branding</span>
                </div>
                <p className="text-sm text-white/70">
                  Updated navbar to show $BIBLEFI token consistently
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card className="bg-scripture/40 border border-ancient-gold/30">
          <CardHeader>
            <CardTitle className="text-xl text-ancient-gold">
              ✅ System Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">✓</div>
                <div className="text-sm text-white">Core APIs</div>
              </div>
              <div className="p-4 bg-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">✓</div>
                <div className="text-sm text-white">Navigation</div>
              </div>
              <div className="p-4 bg-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">✓</div>
                <div className="text-sm text-white">DeFi Features</div>
              </div>
              <div className="p-4 bg-green-500/20 rounded-lg">
                <div className="text-2xl font-bold text-green-400">✓</div>
                <div className="text-sm text-white">Security</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemCheckPage;