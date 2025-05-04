
import React from "react";
import WalletConnect from "../wallet/WalletConnect";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (address: string) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onWalletConnected }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Connect Wallet</h3>
        <WalletConnect onConnect={onWalletConnected} onCancel={onClose} />
      </div>
    </div>
  );
};

export default WalletModal;
