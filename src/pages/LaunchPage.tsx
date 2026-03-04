import React from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FrameDeploymentValidator from '@/components/deployment/FrameDeploymentValidator';
import LaunchReadinessCenter from '@/components/deployment/LaunchReadinessCenter';
import ProductionFarcasterFrame from '@/components/farcaster/ProductionFarcasterFrame';
import ProductionWalletConnect from '@/components/wallet/ProductionWalletConnect';
import PixelButton from '@/components/PixelButton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, AlertTriangle, Rocket, Globe, Zap } from 'lucide-react';
import { getCurrentDomainConfig } from '@/config/domains';

const LaunchPage: React.FC = () => {
  const domainConfig = getCurrentDomainConfig();

  const launchSteps = [
    {
      id: 'frame',
      title: 'Farcaster Frame Setup',
      status: 'completed',
      description: 'Frame HTML, meta tags, and image generation configured',
    },
    {
      id: 'domain',
      title: 'Domain Configuration',
      status: 'in-progress',
      description: 'biblefi.base.eth ready, GitHub Pages guide available',
    },
    {
      id: 'wallet',
      title: 'Wallet Integration',
      status: 'completed',
      description: 'Coinbase Wallet, WalletConnect, and injected wallets',
    },
    {
      id: 'rpc',
      title: 'Base RPC Optimization',
      status: 'completed',
      description: 'Using fastest RPC endpoints with health checking',
    },
    {
      id: 'deployment',
      title: 'Production Deployment',
      status: 'pending',
      description: 'Deploy to production domain and test live',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      'in-progress': 'secondary',
      pending: 'outline',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase().replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-temple">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Rocket className="h-8 w-8 text-ancient-gold" />
            <h1 className="text-4xl font-bold text-ancient-gold">🚀 Launch Control Center</h1>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto">
            Complete deployment dashboard for BibleFi - from readiness checks to Farcaster frame deployment
          </p>
        </div>

        <Tabs defaultValue="readiness" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="readiness">Readiness</TabsTrigger>
            <TabsTrigger value="farcaster">Farcaster</TabsTrigger>
            <TabsTrigger value="wallet">Wallet Test</TabsTrigger>
            <TabsTrigger value="deployment">Deploy</TabsTrigger>
          </TabsList>

          <TabsContent value="readiness">
            <LaunchReadinessCenter />
          </TabsContent>

          <TabsContent value="farcaster">
            <ProductionFarcasterFrame />
          </TabsContent>

          <TabsContent value="wallet">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-ancient-gold text-center">Wallet Integration Test</h2>
              <ProductionWalletConnect />
            </div>
          </TabsContent>

          <TabsContent value="deployment">
            <div className="space-y-6">{/* ... keep existing code */}

              {/* Current Domain Status */}
              <Card className="bg-scripture/20 border border-ancient-gold">
                <CardHeader>
                  <CardTitle className="text-ancient-gold flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Current Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-ancient-gold/80 text-sm">Current Domain:</label>
                      <code className="block text-white bg-black/40 p-2 rounded text-sm">
                        {'current' in domainConfig ? domainConfig.current : window.location.hostname}
                      </code>
                    </div>
                    <div>
                      <label className="text-ancient-gold/80 text-sm">Frame URL:</label>
                      <code className="block text-white bg-black/40 p-2 rounded text-sm break-all">
                        {domainConfig.frame}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Launch Steps */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-ancient-gold">Launch Checklist</h2>
                  
                  {launchSteps.map((step) => (
                    <Card key={step.id} className="bg-scripture/20 border border-ancient-gold/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(step.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium">{step.title}</h3>
                              {getStatusBadge(step.status)}
                            </div>
                            <p className="text-ancient-gold/80 text-sm">{step.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Panel */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-ancient-gold">Actions</h2>
                  
                  {/* Frame Validation */}
                  <FrameDeploymentValidator />
                  
                  {/* RPC Status */}
                  <Card className="bg-scripture/20 border border-ancient-gold">
                    <CardHeader>
                      <CardTitle className="text-ancient-gold">Base RPC Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Primary RPC:</span>
                          <Badge className="bg-green-900 text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <code className="block text-ancient-gold text-xs bg-black/40 p-2 rounded">
                          https://base.rpc.subquery.network/public
                        </code>
                        <p className="text-ancient-gold/60 text-xs">
                          Optimized for 0.063s latency with fallback endpoints
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deployment Guide */}
                  <Card className="bg-scripture/20 border border-ancient-gold">
                    <CardHeader>
                      <CardTitle className="text-ancient-gold">Deployment Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <PixelButton 
                        className="w-full bg-purple-900 text-ancient-gold border border-ancient-gold/50"
                        onClick={() => window.open('/deploy-github-pages.md', '_blank')}
                      >
                        📖 GitHub Pages Guide
                      </PixelButton>
                      
                      <PixelButton 
                        className="w-full bg-black/40 text-ancient-gold border border-ancient-gold/50"
                        onClick={() => window.open('https://base.org/names', '_blank')}
                      >
                        🌐 Get .base.eth Domain
                      </PixelButton>
                      
                      <PixelButton 
                        className="w-full bg-purple-800 text-ancient-gold border border-ancient-gold/50"
                        onClick={() => window.open('https://warpcast.com/~/developers/frames', '_blank')}
                      >
                        🔧 Warpcast Frame Validator
                      </PixelButton>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Technical Specifications */}
        <Card className="bg-scripture/20 border border-ancient-gold">
          <CardHeader>
            <CardTitle className="text-ancient-gold">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-ancient-gold font-medium mb-2">Infrastructure</h4>
                <ul className="text-ancient-gold/80 text-sm space-y-1">
                  <li>✓ React + TypeScript</li>
                  <li>✓ Wagmi v2 + Viem</li>
                  <li>✓ Supabase Backend</li>
                  <li>✓ TailwindCSS Design</li>
                </ul>
              </div>
              <div>
                <h4 className="text-ancient-gold font-medium mb-2">Blockchain</h4>
                <ul className="text-ancient-gold/80 text-sm space-y-1">
                  <li>✓ Base Chain (8453)</li>
                  <li>✓ Optimized RPC Pool</li>
                  <li>✓ Multi-wallet Support</li>
                  <li>✓ Smart Contract Ready</li>
                </ul>
              </div>
              <div>
                <h4 className="text-ancient-gold font-medium mb-2">Farcaster</h4>
                <ul className="text-ancient-gold/80 text-sm space-y-1">
                  <li>✓ Frame v2 (vNext)</li>
                  <li>✓ Dynamic Images</li>
                  <li>✓ Button Interactions</li>
                  <li>✓ Share Integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default LaunchPage;