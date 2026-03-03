
import React from 'react';
import NavBar from '@/components/NavBar';
import DeploymentStatus from '@/components/deployment/DeploymentStatus';
import FrameValidator from '@/components/deployment/FrameValidator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Globe, Smartphone, Database, Shield, Zap } from 'lucide-react';
import PixelButton from '@/components/PixelButton';

const DeploymentPage: React.FC = () => {
  const deploymentSteps = [
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Database Ready',
      description: 'Supabase integration configured with all tables and functions',
      status: 'complete'
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: 'Web App Ready',
      description: 'React application built and optimized for production',
      status: 'complete'
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: 'Farcaster Frame',
      description: 'Mini-app configured for Farcaster deployment',
      status: 'complete'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Security Configured',
      description: 'RLS policies and authentication systems in place',
      status: 'complete'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Integrations Active',
      description: 'Base Chain, Daimo, Superfluid, and other services connected',
      status: 'complete'
    }
  ];

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-block relative px-8 py-4 bg-gradient-to-r from-ancient-gold via-yellow-600 to-ancient-gold border-2 border-red-800 shadow-lg transform hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-black/10 opacity-30"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-red-700"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-red-700"></div>
            <div className="absolute -left-2 -top-2 w-4 h-4 border-t-2 border-l-2 border-red-800"></div>
            <div className="absolute -right-2 -top-2 w-4 h-4 border-t-2 border-r-2 border-red-800"></div>
            <div className="absolute -left-2 -bottom-2 w-4 h-4 border-b-2 border-l-2 border-red-800"></div>
            <div className="absolute -right-2 -bottom-2 w-4 h-4 border-b-2 border-r-2 border-red-800"></div>
            <h1 className="text-4xl font-scroll text-ancient-temple drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] tracking-wider uppercase relative z-10">
              Deployment Ready
            </h1>
          </div>
          <p className="text-xl max-w-2xl mx-auto mt-4 text-white/80">
            BibleFi is configured and ready for seamless deployment as a Farcaster mini-app on Base Chain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <DeploymentStatus showDetails={true} />
          <FrameValidator />
        </div>

        {/* Deployment Checklist */}
        <Card className="border-ancient-gold/30 bg-black/40 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-ancient-gold">
              <Rocket className="h-5 w-5" />
              Deployment Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deploymentSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border border-green-500/30 bg-green-900/20 rounded-lg">
                  <div className="text-green-400">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-green-300">{step.title}</h3>
                    <p className="text-sm text-white/70">{step.description}</p>
                  </div>
                  <div className="text-green-400">
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Deploy Actions */}
        <Card className="border-purple-500/30 bg-purple-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-purple-300">Quick Deploy Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PixelButton 
                className="w-full"
                onClick={() => window.open('/frame.html', '_blank')}
                farcasterStyle
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Preview Frame
              </PixelButton>
              
              <PixelButton 
                className="w-full"
                onClick={() => {
                  const frameUrl = `${window.location.origin}/frame.html`;
                  navigator.clipboard.writeText(frameUrl);
                }}
                farcasterStyle
              >
                <Globe className="mr-2 h-4 w-4" />
                Copy Frame URL
              </PixelButton>
              
              <PixelButton 
                className="w-full"
                onClick={() => window.open('https://warpcast.com/~/compose', '_blank')}
                farcasterStyle
              >
                <Zap className="mr-2 h-4 w-4" />
                Share on Farcaster
              </PixelButton>
            </div>
            
            <div className="p-4 bg-black/30 border border-purple-500/20 rounded-lg">
              <h4 className="font-medium mb-2">Frame URL</h4>
              <code className="text-sm bg-black/40 p-2 rounded block">
                {typeof window !== 'undefined' ? `${window.location.origin}/frame.html` : 'https://biblefi.app/frame.html'}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card className="border-ancient-gold/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-ancient-gold">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Frontend</h4>
                <ul className="space-y-1 text-sm text-white/80">
                  <li>• React 18 with TypeScript</li>
                  <li>• Vite for fast builds</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Shadcn/ui components</li>
                  <li>• Responsive design</li>
                  <li>• PWA ready</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Blockchain</h4>
                <ul className="space-y-1 text-sm text-white/80">
                  <li>• Base Chain integration</li>
                  <li>• Wallet Connect support</li>
                  <li>• Rainbow Wallet compatible</li>
                  <li>• Coinbase Wallet ready</li>
                  <li>• Daimo payments</li>
                  <li>• Superfluid streaming</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Backend</h4>
                <ul className="space-y-1 text-sm text-white/80">
                  <li>• Supabase database</li>
                  <li>• Row Level Security</li>
                  <li>• Edge functions</li>
                  <li>• Real-time subscriptions</li>
                  <li>• Authentication system</li>
                  <li>• Vector search (RAG)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Farcaster</h4>
                <ul className="space-y-1 text-sm text-white/80">
                  <li>• Frame v2 compatible</li>
                  <li>• Interactive buttons</li>
                  <li>• Social sharing</li>
                  <li>• Cast integration</li>
                  <li>• Mini-app architecture</li>
                  <li>• SEO optimized</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DeploymentPage;
