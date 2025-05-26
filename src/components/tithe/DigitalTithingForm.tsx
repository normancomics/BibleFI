
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CreditCard, Coins, Building2, Smartphone } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import PixelCharacter from "@/components/PixelCharacter";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import WalletConnect from "@/components/wallet/WalletConnect";
import FiatPaymentForm from "./FiatPaymentForm";
import { FiatPaymentService } from "@/services/fiatPaymentService";

const DigitalTithingForm: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [paymentType, setPaymentType] = useState<"crypto" | "fiat">("crypto");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock church data - in real app, this would come from selected church
  const mockChurch = {
    id: "mock-church-1",
    name: "Sample Community Church",
    location: "New York, NY",
    acceptsCrypto: true,
    payment_methods: ["credit_card", "paypal", "bank_transfer", "crypto"]
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const calculateFee = () => {
    if (!amount || isNaN(Number(amount))) return 0;
    return Number(amount) * 0.02; // 2% fee for crypto
  };

  const handleTithe = () => {
    playSound("select");
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount for your tithe",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handleWalletConnected = (address: string) => {
    toast({
      title: "Wallet Connected",
      description: `Connected with ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    });
    
    setTimeout(() => {
      toast({
        title: "Tithing Successful",
        description: `Your tithe of ${amount} ${selectedToken} has been processed. God bless you!`,
        variant: "default",
      });
      
      setAmount("");
      setShowPaymentModal(false);
      playSound("success");
    }, 1500);
  };

  const handleFiatPaymentComplete = (transactionId: string) => {
    toast({
      title: "Donation Successful",
      description: `Transaction ID: ${transactionId}. Thank you for your generosity!`,
    });
    setAmount("");
    setShowPaymentModal(false);
  };

  const supportedFiatMethods = FiatPaymentService.getPaymentMethodsByCurrency("USD");

  return (
    <>
      <Card className="pixel-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins size={24} className="text-ancient-gold" />
            Digital Tithing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-6">
            <PixelCharacter 
              character="solomon" 
              message="Honor the LORD with your wealth, with the firstfruits of all your crops. - Proverbs 3:9"
              size="md"
              soundEffect={true}
            />
          </div>

          <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as "crypto" | "fiat")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Coins size={16} />
                Cryptocurrency
              </TabsTrigger>
              <TabsTrigger value="fiat" className="flex items-center gap-2">
                <CreditCard size={16} />
                Traditional Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="crypto" className="space-y-4">
              <div>
                <Label htmlFor="amount" className="font-scroll">Amount to Tithe</Label>
                <Input 
                  id="amount" 
                  placeholder="0.00" 
                  className="mt-1 font-scroll" 
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>
              
              <div>
                <Label htmlFor="token" className="font-scroll">Select Cryptocurrency</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="DAI">DAI</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="WETH">WETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                <div className="border-t border-border pt-4 mt-4 font-scroll">
                  <div className="flex justify-between mb-2">
                    <span>Amount:</span>
                    <span>{amount} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Network Fee:</span>
                    <span>{calculateFee().toFixed(4)} {selectedToken}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{(Number(amount) + calculateFee()).toFixed(4)} {selectedToken}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fiat" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Traditional Payment Methods</h4>
                <div className="grid grid-cols-2 gap-2">
                  {supportedFiatMethods.slice(0, 6).map(method => (
                    <div key={method.id} className="flex items-center gap-2 text-sm text-blue-700">
                      {method.icon === 'CreditCard' && <CreditCard size={16} />}
                      {method.icon === 'Building2' && <Building2 size={16} />}
                      {method.icon === 'Smartphone' && <Smartphone size={16} />}
                      {method.icon === 'Wallet' && <CreditCard size={16} />}
                      <span>{method.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Supports major currencies: USD, EUR, GBP, CAD, AUD
                </p>
              </div>

              <div>
                <Label htmlFor="fiat-amount" className="font-scroll">Donation Amount</Label>
                <Input 
                  id="fiat-amount" 
                  placeholder="0.00" 
                  className="mt-1 font-scroll" 
                  value={amount}
                  onChange={handleAmountChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose currency and payment method in the next step
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <PixelButton 
            className="w-full flex items-center justify-center font-scroll" 
            onClick={handleTithe}
            disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
          >
            Continue to Payment <ArrowRight size={16} className="ml-2" />
          </PixelButton>
        </CardContent>
      </Card>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-0 max-w-md w-full max-h-[90vh] overflow-auto">
            {paymentType === "crypto" ? (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 font-scroll">Complete Your Tithe</h3>
                <p className="mb-4 text-sm font-scroll">
                  Connect your wallet to complete your tithe of {amount} {selectedToken}.
                </p>
                <WalletConnect 
                  onConnect={handleWalletConnected} 
                  onCancel={() => setShowPaymentModal(false)} 
                />
              </div>
            ) : (
              <FiatPaymentForm
                church={mockChurch}
                onPaymentComplete={handleFiatPaymentComplete}
                onCancel={() => setShowPaymentModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DigitalTithingForm;
