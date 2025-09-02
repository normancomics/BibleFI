import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { base } from 'wagmi/chains';

const NetworkStatus: React.FC = () => {
  const { isConnected, isOnBaseChain, switchToBase, chainId } = useWallet();

  if (!isConnected) return null;

  if (isOnBaseChain) {
    return (
      <Card className="border-green-500/30 bg-green-500/10">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Connected to Base</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/30 bg-orange-500/10">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-400">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <div className="text-sm font-medium">Wrong Network</div>
              <div className="text-xs text-white/70">
                Please switch to Base (Chain ID: {base.id})
              </div>
            </div>
          </div>
          <Button 
            onClick={switchToBase}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Switch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkStatus;