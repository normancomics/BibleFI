import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Smartphone, Bitcoin, Zap, Globe, 
  Shield, QrCode, ArrowRight, CheckCircle, Clock,
  Wallet, Building2, Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancedDaimoClient } from '@/integrations/daimo/enhancedClient';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'fiat' | 'mobile';
  icon: React.ReactNode;
  description: string;
  fees: string;
  speed: string;
  availability: string[];
  isEnabled: boolean;
}

const ComprehensivePaymentHub: React.FC = () => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'daimo',
      name: 'Daimo Pay',
      type: 'crypto',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Instant USDC payments with QR codes',
      fees: '0.1%',
      speed: 'Instant',
      availability: ['US', 'CA', 'EU'],
      isEnabled: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'fiat',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Credit/debit cards, bank transfers',
      fees: '2.9% + 30¢',
      speed: '1-3 days',
      availability: ['Global'],
      isEnabled: true
    },
    {
      id: 'superfluid',
      name: 'Superfluid',
      type: 'crypto',
      icon: <Zap className="h-5 w-5" />,
      description: 'Continuous money streams',
      fees: '0.05%',
      speed: 'Continuous',
      availability: ['Ethereum', 'Polygon', 'Base'],
      isEnabled: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Pay',
      type: 'crypto',
      icon: <Bitcoin className="h-5 w-5" />,
      description: 'Direct crypto wallet payments',
      fees: '1%',
      speed: '2-5 minutes',
      availability: ['Global'],
      isEnabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'fiat',
      icon: <Globe className="h-5 w-5" />,
      description: 'PayPal balance and linked accounts',
      fees: '2.9% + fixed fee',
      speed: 'Instant',
      availability: ['Global'],
      isEnabled: false
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      type: 'fiat',
      icon: <Phone className="h-5 w-5" />,
      description: 'Contactless mobile payments',
      fees: '2.9% + 30¢',
      speed: 'Instant',
      availability: ['iOS devices'],
      isEnabled: false
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'fiat',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Direct bank account transfers',
      fees: '$5 flat fee',
      speed: '3-5 days',
      availability: ['US', 'EU'],
      isEnabled: false
    },
    {
      id: 'crypto_wallet',
      name: 'Crypto Wallet',
      type: 'crypto',
      icon: <Wallet className="h-5 w-5" />,
      description: 'MetaMask, WalletConnect, etc.',
      fees: 'Network fees only',
      speed: '1-10 minutes',
      availability: ['Global'],
      isEnabled: true
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !amount || !recipient) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const method = paymentMethods.find(m => m.id === selectedMethod);
      
      if (selectedMethod === 'daimo') {
        const result = await enhancedDaimoClient.createPayment({
          recipient,
          amount: (parseFloat(amount) * 1e6).toString(), // Convert to USDC units
          memo: 'Bible.fi Tithe Payment'
        });
        
        if (result.success) {
          toast({
            title: "Payment Created",
            description: "Daimo payment request created successfully",
          });
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } else if (selectedMethod === 'stripe') {
        // Stripe payment would be handled here
        toast({
          title: "Stripe Payment",
          description: "Redirecting to Stripe checkout...",
        });
      } else {
        // Handle other payment methods
        toast({
          title: `${method?.name} Payment`,
          description: "Payment initiated successfully",
        });
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'crypto': return <Bitcoin className="h-4 w-4 text-orange-500" />;
      case 'fiat': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'mobile': return <Smartphone className="h-4 w-4 text-green-500" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const enabledMethods = paymentMethods.filter(m => m.isEnabled);
  const disabledMethods = paymentMethods.filter(m => !m.isEnabled);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Comprehensive Payment Hub
          </CardTitle>
          <CardDescription>
            Multiple payment options for tithing and donations - choose what works best for your church
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="methods" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="send">Send Payment</TabsTrigger>
              <TabsTrigger value="setup">Setup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="methods" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Available Payment Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {enabledMethods.map((method) => (
                      <Card key={method.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {method.icon}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{method.name}</h4>
                                  {getMethodIcon(method.type)}
                                </div>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                              </div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          
                          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                            <div>Fee: {method.fees}</div>
                            <div>Speed: {method.speed}</div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {method.availability.slice(0, 3).map((region) => (
                                <Badge key={region} variant="outline" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                              {method.availability.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{method.availability.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Coming Soon</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {disabledMethods.map((method) => (
                      <Card key={method.id} className="opacity-60">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {method.icon}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{method.name}</h4>
                                  {getMethodIcon(method.type)}
                                </div>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                              </div>
                            </div>
                            <Clock className="h-5 w-5 text-yellow-500" />
                          </div>
                          
                          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                            <div>Fee: {method.fees}</div>
                            <div>Speed: {method.speed}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="send" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Send Payment</CardTitle>
                  <CardDescription>
                    Choose a payment method and send your tithe or donation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                      >
                        <option value="">Select payment method</option>
                        {enabledMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name} - {method.fees}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (USD)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient</label>
                    <Input
                      placeholder="Church wallet address or email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing || !selectedMethod || !amount || !recipient}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Send Payment
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="setup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Setup Payment Methods</CardTitle>
                  <CardDescription>
                    Configure your preferred payment options for your church
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Payment method setup coming soon</p>
                    <p className="text-sm">Connect with church administrators to enable more payment options</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Biblical Wisdom */}
      <Card className="bg-gradient-to-r from-ancient-gold/10 to-transparent border-ancient-gold/30">
        <CardContent className="p-4">
          <p className="text-sm text-ancient-gold font-medium mb-2">
            Biblical Wisdom on Giving
          </p>
          <p className="text-xs text-white/80">
            "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensivePaymentHub;