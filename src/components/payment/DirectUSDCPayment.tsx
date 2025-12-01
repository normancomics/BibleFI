import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { base } from 'wagmi/chains';

/**
 * Direct USDC Payment Component
 * Replaces DaimoPay with direct wallet-to-wallet USDC transfers
 */

// USDC contract address on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

interface DirectUSDCPaymentProps {
  recipientAddress: string;
  recipientName: string;
  suggestedAmount?: number;
  onSuccess?: (txHash: string) => void;
}

const DirectUSDCPayment: React.FC<DirectUSDCPaymentProps> = ({
  recipientAddress,
  recipientName,
  suggestedAmount,
  onSuccess
}) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState(suggestedAmount?.toString() || '');
  
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSendUSDC = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // USDC has 6 decimals
      const amountInWei = parseUnits(amount, 6);

      writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`, amountInWei],
        account: address,
        chain: base,
      });

      toast({
        title: "Transaction Submitted",
        description: "Sending USDC...",
      });
    } catch (error) {
      console.error('USDC transfer error:', error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send USDC",
        variant: "destructive",
      });
    }
  };

  // Handle successful transaction
  React.useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: "Payment Successful!",
        description: `Sent $${amount} USDC to ${recipientName}`,
      });
      
      if (onSuccess) {
        onSuccess(hash);
      }
    }
  }, [isSuccess, hash]);

  return (
    <Card className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border-green-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span className="text-green-400">Direct USDC Payment</span>
        </CardTitle>
        <p className="text-sm text-white/70">Send USDC directly to {recipientName}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm">
          <p className="text-white/80">
            <span className="font-semibold">Recipient:</span> {recipientName}
          </p>
          <p className="text-white/60 text-xs mt-1 break-all">
            {recipientAddress}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="usdcAmount">Amount (USDC)</Label>
          <Input
            id="usdcAmount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50"
            disabled={isPending || isConfirming}
          />
        </div>

        {suggestedAmount && parseFloat(amount) !== suggestedAmount && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAmount(suggestedAmount.toString())}
            className="w-full"
          >
            Use Suggested Amount (${suggestedAmount})
          </Button>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSendUSDC}
            disabled={!isConnected || isPending || isConfirming || !amount}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isPending || isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {isPending ? 'Confirming...' : 'Processing...'}
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Sent!
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send ${amount || '0'} USDC
              </>
            )}
          </Button>
        </div>

        {!isConnected && (
          <p className="text-xs text-center text-yellow-400">
            ⚠️ Please connect your wallet to continue
          </p>
        )}

        {isSuccess && hash && (
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Transaction completed!
            </p>
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline block mt-1"
            >
              View on BaseScan →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DirectUSDCPayment;
