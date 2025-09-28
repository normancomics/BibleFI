
import React, { useEffect } from "react";
import UniversalWalletConnect from "./UniversalWalletConnect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEIP5792 } from "@/hooks/useEIP5792";
import { Zap, CheckCircle } from "lucide-react";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onCancel?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onCancel }) => {
  const { capabilities, isCheckingCapabilities, checkWalletCapabilities, isEIP5792Supported } = useEIP5792();

  const handleConnect = async (provider: string, address: string) => {
    if (onConnect) {
      onConnect(address);
    }
    
    // Check wallet capabilities after connection
    await checkWalletCapabilities();
  };

  useEffect(() => {
    // Check capabilities when component mounts if already connected
    checkWalletCapabilities();
  }, [checkWalletCapabilities]);

  return (
    <div className="space-y-4">
      {/* EIP-5792 Support Badge */}
      {isEIP5792Supported && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Advanced Wallet Features Detected</span>
          </div>
          <p className="text-xs text-green-300 mt-1">
            Your wallet supports batch transactions for smoother DeFi interactions
          </p>
        </div>
      )}

      <UniversalWalletConnect 
        onConnect={handleConnect}
        buttonText="Connect Wallet"
        buttonClassName="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      />

      {/* Wallet Features Display */}
      {capabilities && (
        <div className="bg-royal-purple/20 border border-ancient-gold/30 rounded-lg p-3">
          <h4 className="text-sm font-medium text-ancient-gold mb-2">Wallet Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(capabilities).map(([method, capability]) => (
              <Badge 
                key={method} 
                variant={capability.supported ? "default" : "secondary"}
                className={capability.supported ? "bg-green-900/30 text-green-400" : "bg-gray-900/30 text-gray-400"}
              >
                {capability.supported && <CheckCircle className="w-3 h-3 mr-1" />}
                {method.replace('wallet_', '')}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {onCancel && (
        <Button 
          variant="ghost"
          onClick={onCancel}
          className="w-full text-white/70 hover:text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;
