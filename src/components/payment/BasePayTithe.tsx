import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { 
  Smartphone, 
  Nfc, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Coins,
  Heart,
  Zap
} from 'lucide-react';

// Supported tokens for Base Pay tithing
interface SupportedToken {
  symbol: string;
  name: string;
  icon: string;
  available: boolean;
  category: 'stablecoin' | 'native' | 'governance' | 'future';
}

const SUPPORTED_TOKENS: SupportedToken[] = [
  // Currently available stablecoins
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', available: true, category: 'stablecoin' },
  { symbol: 'DAI', name: 'Dai Stablecoin', icon: '🟡', available: true, category: 'stablecoin' },
  { symbol: 'USDT', name: 'Tether USD', icon: '💚', available: true, category: 'stablecoin' },
  
  // Future stablecoins
  { symbol: 'USD1', name: 'USD1 Stablecoin', icon: '💲', available: false, category: 'stablecoin' },
  { symbol: 'NERITE', name: 'Nerite USD', icon: '🐚', available: false, category: 'stablecoin' },
  
  // Native tokens
  { symbol: 'ETH', name: 'Ethereum', icon: '💎', available: true, category: 'native' },
  { symbol: 'WETH', name: 'Wrapped Ethereum', icon: '🔷', available: true, category: 'native' },
  { symbol: 'cbBTC', name: 'Coinbase BTC', icon: '🟠', available: false, category: 'native' },
  
  // Governance/Future tokens
  { symbol: 'BIBLEFI', name: 'Bible.fi Token', icon: '📖', available: false, category: 'governance' },
  { symbol: 'WISDOM', name: 'Wisdom Token', icon: '🧠', available: false, category: 'governance' },
  { symbol: 'SUP', name: 'Superfluid Token', icon: '💧', available: false, category: 'governance' },
  { symbol: 'VEIL', name: 'Veil Privacy', icon: '🔒', available: false, category: 'governance' },
];

interface BasePayTitheProps {
  recipientAddress?: string;
  recipientName?: string;
  onSuccess?: (paymentId: string) => void;
  testnet?: boolean;
}

type PaymentStatus = 'idle' | 'pending' | 'completed' | 'failed';

const BasePayTithe: React.FC<BasePayTitheProps> = ({
  recipientAddress = '0x0000000000000000000000000000000000000000', // Default placeholder
  recipientName = 'Church',
  onSuccess,
  testnet = true // Default to testnet for development
}) => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [collectEmail, setCollectEmail] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();

  const handleBasePay = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid tithe amount",
        variant: "destructive"
      });
      return;
    }

    setPaymentStatus('pending');
    playSound('coin');

    try {
      // Dynamic import for Base Pay SDK
      const { pay, getPaymentStatus } = await import('@base-org/account');

      // Build payerInfo if email collection is enabled
      const payerInfo = collectEmail ? {
        requests: [
          { type: 'email' as const },
          { type: 'name' as const, optional: true }
        ]
      } : undefined;

      // Initiate Base Pay transaction
      const payment = await pay({
        amount,
        to: recipientAddress,
        testnet,
        ...(payerInfo && { payerInfo })
      });

      setPaymentId(payment.id);

      // Poll for payment status
      const checkStatus = async () => {
        const status = await getPaymentStatus({
          id: payment.id,
          testnet
        });

        if (status.status === 'completed') {
          setPaymentStatus('completed');
          playSound('success');
          toast({
            title: "Tithe Sent Successfully! 🙏",
            description: `$${amount} USDC sent to ${recipientName}`,
          });
          onSuccess?.(payment.id);
        } else if (status.status === 'failed') {
          setPaymentStatus('failed');
          playSound('error');
          toast({
            title: "Payment Failed",
            description: "The transaction could not be completed",
            variant: "destructive"
          });
        } else {
          // Still pending, check again
          setTimeout(checkStatus, 2000);
        }
      };

      // Start polling
      checkStatus();

    } catch (error) {
      console.error('Base Pay error:', error);
      setPaymentStatus('failed');
      playSound('error');
      
      // Handle user cancellation vs actual error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isCancelled = errorMessage.toLowerCase().includes('cancel') || 
                          errorMessage.toLowerCase().includes('rejected');
      
      toast({
        title: isCancelled ? "Payment Cancelled" : "Payment Failed",
        description: isCancelled 
          ? "You cancelled the payment" 
          : `Error: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const resetPayment = () => {
    setPaymentStatus('idle');
    setPaymentId(null);
    setAmount('');
  };

  const availableTokens = SUPPORTED_TOKENS.filter(t => t.available);
  const futureTokens = SUPPORTED_TOKENS.filter(t => !t.available);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Clock className="h-5 w-5 animate-spin text-ancient-gold" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-eboy-green" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-ancient-gold/30 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Base Pay
                <Badge className="bg-eboy-blue text-white text-xs">Tap to Tithe</Badge>
              </CardTitle>
              <CardDescription>
                One-tap USDC payments • burner.pro ready
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Nfc className="h-5 w-5 text-ancient-gold" />
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scripture Quote */}
        <div className="p-3 rounded-lg bg-scripture/10 border border-scripture/20">
          <p className="text-sm italic text-muted-foreground">
            "Each of you should give what you have decided in your heart to give, 
            not reluctantly or under compulsion, for God loves a cheerful giver."
          </p>
          <p className="text-xs text-ancient-gold mt-1 text-right">— 2 Corinthians 9:7</p>
        </div>

        {paymentStatus === 'completed' ? (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-eboy-green/20">
                <CheckCircle2 className="h-12 w-12 text-eboy-green" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Tithe Complete!</h3>
              <p className="text-muted-foreground text-sm">
                ${amount} sent to {recipientName}
              </p>
              {paymentId && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  TX: {paymentId.slice(0, 10)}...{paymentId.slice(-8)}
                </p>
              )}
            </div>
            <Button onClick={resetPayment} variant="outline" className="gap-2">
              <Heart className="h-4 w-4" />
              Give Again
            </Button>
          </div>
        ) : (
          <>
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Tithe Amount (USD)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    disabled={paymentStatus === 'pending'}
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTokens.map(token => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2">
              {['10', '25', '50', '100', '250'].map(preset => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset)}
                  disabled={paymentStatus === 'pending'}
                  className="border-ancient-gold/30 hover:bg-ancient-gold/10"
                >
                  ${preset}
                </Button>
              ))}
            </div>

            {/* Pay Button */}
            <Button
              onClick={handleBasePay}
              disabled={!amount || paymentStatus === 'pending'}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
              size="lg"
            >
              {paymentStatus === 'pending' ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Pay with Base
                </>
              )}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-eboy-green" />
                &lt;2 sec settlement
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-eboy-green" />
                No extra fees
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-eboy-green" />
                Gas sponsored
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-eboy-green" />
                NFC ready
              </div>
            </div>

            {/* Future Tokens Preview */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Coins className="h-3 w-3" />
                Coming Soon: Additional Tokens
              </p>
              <div className="flex flex-wrap gap-1">
                {futureTokens.slice(0, 6).map(token => (
                  <Badge 
                    key={token.symbol} 
                    variant="outline" 
                    className="text-xs opacity-60"
                  >
                    {token.icon} {token.symbol}
                  </Badge>
                ))}
                {futureTokens.length > 6 && (
                  <Badge variant="outline" className="text-xs opacity-60">
                    +{futureTokens.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* burner.pro Integration Note */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
          <span className="flex items-center justify-center gap-1">
            <Nfc className="h-3 w-3" />
            Compatible with burner.pro terminals for in-church tap-to-tithe
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasePayTithe;
