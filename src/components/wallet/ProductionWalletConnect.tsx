import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PixelButton from '@/components/PixelButton';
import useRealTimeData from '@/hooks/useRealTimeData';

const ProductionWalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { stats, loading: portfolioLoading } = useRealTimeData();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isOnBase = chainId === base.id;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  useEffect(() => {
    if (isConnected && !isOnBase) {
      toast({
        title: "Switch to Base Network",
        description: "Bible.fi runs on Base chain for optimal DeFi features",
        variant: "destructive",
      });
    }
  }, [isConnected, isOnBase]);

  const handleConnect = async (connector: any) => {
    setIsConnecting(true);
    try {
      await connect({ connector });
      toast({
        title: "🙏 Wallet Connected",
        description: "Welcome to Bible.fi - Biblical wisdom meets DeFi",
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Please try again or use a different wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchToBase = async () => {
    try {
      await switchChain({ chainId: base.id });
      toast({
        title: "✅ Switched to Base",
        description: "Now ready for DeFi features on Base chain",
      });
    } catch (error) {
      console.error('Switch chain error:', error);
      toast({
        title: "Network Switch Failed",
        description: "Please manually switch to Base network in your wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Come back soon for more biblical wisdom!",
    });
  };

  if (!isConnected) {
    return (
      <Card className="bg-scripture/20 border border-ancient-gold">
        <CardHeader>
          <CardTitle className="text-ancient-gold flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/80 text-sm">
            Connect your wallet to access tithing, staking, and DeFi features on Base chain
          </p>

          <div className="space-y-3">
            {connectors.map((connector) => {
              const isReady = connector.name !== 'WalletConnect' || typeof window !== 'undefined';
              const isFarcasterWallet = connector.name === 'WalletConnect';
              
              return (
                <PixelButton
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={!isReady || isConnecting}
                  className="w-full bg-ancient-gold/20 border border-ancient-gold text-ancient-gold hover:bg-ancient-gold/30"
                >
                  {connector.name === 'Coinbase Wallet' && '🟦'}
                  {connector.name === 'WalletConnect' && '🟣'}
                  {connector.name === 'Browser Wallet' && '🌐'}
                  {' '}
                  {connector.name}
                  {isFarcasterWallet && (
                    <Badge className="ml-2 bg-purple-900 text-purple-200">Recommended</Badge>
                  )}
                </PixelButton>
              );
            })}
          </div>

          {connectError && (
            <Alert className="border-red-500/50 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {connectError.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-white/60 space-y-1">
            <p>• Supports Coinbase Wallet, WalletConnect, and browser wallets</p>
            <p>• Your keys, your crypto - Bible.fi never holds your funds</p>
            <p>• Base chain optimized for low fees and fast transactions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-scripture/20 border border-ancient-gold">
      <CardHeader>
        <CardTitle className="text-ancient-gold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connected Wallet
          </div>
          <Badge className={isOnBase ? "bg-green-900 text-green-200" : "bg-yellow-900 text-yellow-200"}>
            {isOnBase ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Base Network
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Wrong Network
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Info */}
        <div className="bg-black/40 p-3 rounded border border-ancient-gold/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Address:</span>
            <div className="flex items-center gap-2">
              <code className="text-ancient-gold text-sm">{shortAddress}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(address || '')}
                className="h-6 w-6 p-0 text-ancient-gold hover:bg-ancient-gold/20"
              >
                📋
              </Button>
            </div>
          </div>
          
          {stats && !portfolioLoading && (
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-ancient-gold/30">
              <div>
                <span className="text-white/70 text-xs">Gas Price:</span>
                <p className="text-ancient-gold font-medium">
                  {stats.gasPrice} ETH
                </p>
              </div>
              <div>
                <span className="text-white/70 text-xs">TVL:</span>
                <p className="text-ancient-gold font-medium">
                  {stats.totalValueLocked}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Network Status */}
        {!isOnBase && (
          <Alert className="border-yellow-500/50 bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              Please switch to Base network to access all DeFi features
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isOnBase && (
            <PixelButton
              onClick={handleSwitchToBase}
              className="w-full bg-blue-900 text-blue-200 border border-blue-500"
            >
              🔄 Switch to Base Network
            </PixelButton>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <PixelButton
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="bg-purple-900 text-purple-200 border border-purple-500"
            >
              ⚙️ Advanced
            </PixelButton>
            
            <PixelButton
              onClick={handleDisconnect}
              className="bg-red-900 text-red-200 border border-red-500"
            >
              🔌 Disconnect
            </PixelButton>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-4 p-3 bg-black/20 rounded border border-ancient-gold/20">
            <h4 className="text-ancient-gold text-sm font-medium mb-2">Advanced Options</h4>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                View on BaseScan
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open('https://bridge.base.org', '_blank')}
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Bridge to Base
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Get Coinbase Wallet
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-white/60 italic text-center mt-4">
          "Trust in the Lord with all your heart" - Proverbs 3:5
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionWalletConnect;