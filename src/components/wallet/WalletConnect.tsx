
import React from "react";
import UniversalWalletConnect from "./UniversalWalletConnect";
import { Button } from "@/components/ui/button";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onCancel?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onCancel }) => {
  const handleConnect = (provider: string, address: string) => {
    if (onConnect) {
      onConnect(address);
    }
  };

  return (
    <div className="space-y-4">
      <UniversalWalletConnect 
        onConnect={handleConnect}
        buttonText="Connect Wallet"
        buttonClassName="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      />
      
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
