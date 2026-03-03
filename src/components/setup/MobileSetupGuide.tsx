
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, Copy, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PixelButton from '@/components/PixelButton';

const MobileSetupGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  const steps = [
    {
      id: 1,
      title: 'Get WalletConnect Project ID',
      description: 'Visit cloud.walletconnect.com to create a project and get your ID',
      action: 'Open WalletConnect',
      url: 'https://cloud.walletconnect.com'
    },
    {
      id: 2,
      title: 'Update Configuration',
      description: 'Replace the Project ID in wagmi.ts with your actual ID',
      action: 'Copy Frame URL',
      copyText: window.location.origin + '/frame.html'
    },
    {
      id: 3,
      title: 'Test Farcaster Frame',
      description: 'Share your BibleFi frame on Warpcast to test the mini-app',
      action: 'Open Frame',
      url: '/frame.html'
    },
    {
      id: 4,
      title: 'Share on Farcaster',
      description: 'Cast your BibleFi frame to the Farcaster community',
      action: 'Compose Cast',
      url: `https://warpcast.com/~/compose?text=Check out BibleFi - Biblical wisdom for DeFi on Base Chain!&embeds[]=${encodeURIComponent(window.location.origin + '/frame.html')}`
    }
  ];

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleAction = (step: typeof steps[0]) => {
    if (step.url) {
      window.open(step.url, '_blank');
    } else if (step.copyText) {
      navigator.clipboard.writeText(step.copyText);
      toast({
        title: 'Copied!',
        description: 'Frame URL copied to clipboard',
      });
    }
    markStepComplete(step.id);
  };

  return (
    <Card className="border-ancient-gold/30 bg-black/40 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ancient-gold">
          <Smartphone className="h-5 w-5" />
          iPad Setup Guide for BibleFi
        </CardTitle>
        <p className="text-white/70">
          Follow these steps to get your Farcaster mini-app running
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                completedSteps.includes(step.id) 
                  ? 'border-green-500/30 bg-green-900/20' 
                  : 'border-ancient-gold/20 bg-purple-900/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  completedSteps.includes(step.id)
                    ? 'border-green-500 bg-green-500'
                    : 'border-ancient-gold'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold text-ancient-gold">{step.id}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{step.title}</h3>
                  <p className="text-sm text-white/70">{step.description}</p>
                </div>
              </div>
              <PixelButton
                size="sm"
                onClick={() => handleAction(step)}
                className="flex items-center gap-1"
                farcasterStyle
              >
                {step.copyText ? <Copy className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                {step.action}
              </PixelButton>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
          <h4 className="font-medium text-purple-300 mb-2">📱 iPad Pro Tips:</h4>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• Use Safari for all web interactions</li>
            <li>• Install Warpcast app for easy Farcaster access</li>
            <li>• Install Coinbase Wallet & Rainbow for testing</li>
            <li>• Copy-paste works between apps on iPad</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-white/60">
            Your BibleFi Frame URL: <br />
            <code className="bg-black/40 px-2 py-1 rounded text-ancient-gold">
              {window.location.origin}/frame.html
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileSetupGuide;
