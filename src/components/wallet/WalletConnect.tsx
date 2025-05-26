
import React from "react";
import UniversalWalletConnect from "./UniversalWalletConnect";

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
        buttonText="Connect to Bible.fi"
        buttonClassName="w-full"
      />
      
      {onCancel && (
        <button 
          onClick={onCancel}
          className="w-full text-sm text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
