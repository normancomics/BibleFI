
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { APP_CONFIG } from '@/farcaster/config';

const ContractDeploymentGuide: React.FC = () => {
  return (
    <Card className="border-ancient-gold/30 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ancient-gold">
          <Code className="h-5 w-5" />
          $BIBLE Token Deployment Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The $BIBLE token contracts are code-ready but not yet deployed to Base Chain.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-white mb-2">Contract Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <span>BibleToken.sol</span>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  Ready to Deploy
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <span>WisdomRewardsPool.sol</span>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  Ready to Deploy
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-2">Treasury Configuration</h3>
            <div className="p-4 bg-black/20 border border-ancient-gold/20 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">ENS Name:</span>
                  <span className="text-ancient-gold">{APP_CONFIG.treasury.ensName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Current Address:</span>
                  <span className="text-red-400">Not Set (Placeholder)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Fee Rate:</span>
                  <span className="text-green-400">10% (Automatic)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-2">Deployment Steps Required</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <div className="w-6 h-6 rounded-full border-2 border-ancient-gold text-xs flex items-center justify-center">1</div>
                <span className="text-sm">Resolve biblefi.base.eth ENS to actual address</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <div className="w-6 h-6 rounded-full border-2 border-ancient-gold text-xs flex items-center justify-center">2</div>
                <span className="text-sm">Deploy BibleToken contract with treasury address</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <div className="w-6 h-6 rounded-full border-2 border-ancient-gold text-xs flex items-center justify-center">3</div>
                <span className="text-sm">Deploy WisdomRewardsPool contract</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <div className="w-6 h-6 rounded-full border-2 border-ancient-gold text-xs flex items-center justify-center">4</div>
                <span className="text-sm">Configure contract interactions</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <div className="w-6 h-6 rounded-full border-2 border-ancient-gold text-xs flex items-center justify-center">5</div>
                <span className="text-sm">Update frontend with actual contract addresses</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-2">Automatic Fee Distribution</h3>
            <div className="p-3 bg-scripture/10 border border-scripture/30 rounded-lg">
              <div className="text-sm text-white/80 space-y-1">
                <p>✅ 10% of every mint goes to treasury</p>
                <p>✅ 10% of every burn goes to treasury</p>
                <p>✅ 10% of every transfer goes to treasury</p>
                <p>✅ Treasury fees automatically distributed to wisdom rewards pool</p>
                <p>✅ Stakers and farmers earn rewards based on wisdom scores</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/60 text-center">
              Contracts designed for Base Chain deployment with biblefi.base.eth treasury
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractDeploymentGuide;
