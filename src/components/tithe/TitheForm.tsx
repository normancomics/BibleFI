import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRight, Wallet, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import PixelCharacter from "@/components/PixelCharacter";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import WalletConnect from "@/components/wallet/WalletConnect";

const TitheForm: React.FC = () => {
  const { playSound } = useSound();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "fiat">("crypto");
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: ""
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };
  
  const calculateFee = () => {
    if (!amount || isNaN(Number(amount))) return 0;
    
    // 2% fee for calculation purposes
    return Number(amount) * 0.02;
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
    
    setIsPaymentModalOpen(true);
  };
  
  const handleWalletConnected = (address: string) => {
    toast({
      title: "Wallet Connected",
      description: `Connected with ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    });
    
    // Simulate successful tithing
    setTimeout(() => {
      toast({
        title: "Tithing Successful",
        description: `Your tithe of ${amount} ${selectedToken} has been processed. God bless you!`,
        variant: "default",
      });
      
      setAmount("");
      setIsPaymentModalOpen(false);
      playSound("success");
    }, 1500);
  };
  
  const handleCardPayment = () => {
    // Simple validation
    if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
      toast({
        title: "Missing information",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    playSound("coin");
    
    // Simulate card processing
    toast({
      title: "Processing Payment",
      description: "Please wait while we process your payment",
    });
    
    setTimeout(() => {
      toast({
        title: "Tithing Successful",
        description: `Your tithe of $${amount} has been processed. God bless you!`,
        variant: "default",
      });
      
      setAmount("");
      setIsPaymentModalOpen(false);
      playSound("success");
    }, 2000);
  };
  
  return (
    <>
      <h2 className="text-2xl font-scroll mb-4">Give Your Tithe</h2>
      <Card className="pixel-card mb-6">
        <CardContent className="pt-6">
          <div className="mb-6">
            <PixelCharacter 
              character="solomon" 
              message="Honor the LORD with your wealth, with the firstfruits of all your crops. - Proverbs 3:9"
              size="md"
              soundEffect={true}
            />
          </div>
          
          <div className="space-y-4">
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
              <div className="flex justify-between mb-2">
                <Label htmlFor="token" className="font-scroll">Select Payment Method</Label>
                <button 
                  onClick={() => {
                    setShowAdvancedOptions(!showAdvancedOptions);
                    playSound("select");
                  }}
                  className="text-xs flex items-center text-scripture hover:text-scripture-dark font-scroll"
                >
                  {showAdvancedOptions ? (
                    <>Less Options <ChevronUp size={12} className="ml-1" /></>
                  ) : (
                    <>More Options <ChevronDown size={12} className="ml-1" /></>
                  )}
                </button>
              </div>
              <select 
                id="token" 
                className="w-full border border-input rounded px-3 py-2 mt-1 font-scroll"
                value={selectedToken}
                onChange={(e) => {
                  setSelectedToken(e.target.value);
                  playSound("select");
                }}
              >
                <option>USDC</option>
                <option>DAI</option>
                <option>ETH</option>
                {showAdvancedOptions && (
                  <>
                    <option>USDT</option>
                    <option>WETH</option>
                    <option>WBTC</option>
                  </>
                )}
              </select>
            </div>
            
            {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
              <div className="border-t border-border pt-4 mt-4 font-scroll">
                <div className="flex justify-between mb-2">
                  <span>Amount:</span>
                  <span>{amount} {selectedToken}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Conversion Fee:</span>
                  <span>{calculateFee().toFixed(2)} {selectedToken}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{(Number(amount) + calculateFee()).toFixed(2)} {selectedToken}</span>
                </div>
              </div>
            )}
            
            <PixelButton 
              className="w-full flex items-center justify-center font-scroll" 
              onClick={handleTithe}
              disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
            >
              Give Tithe <ArrowRight size={16} className="ml-2" />
            </PixelButton>
          </div>
        </CardContent>
      </Card>
      
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 font-scroll">Complete Your Tithe</h3>
            
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 font-scroll ${paymentMethod === "crypto" ? "border-b-2 border-scripture font-bold" : "text-muted-foreground"}`}
                onClick={() => {
                  setPaymentMethod("crypto");
                  playSound("select");
                }}
              >
                <div className="flex items-center">
                  <Wallet size={16} className="mr-2" />
                  Crypto
                </div>
              </button>
              <button
                className={`px-4 py-2 font-scroll ${paymentMethod === "fiat" ? "border-b-2 border-scripture font-bold" : "text-muted-foreground"}`}
                onClick={() => {
                  setPaymentMethod("fiat");
                  playSound("select");
                }}
              >
                <div className="flex items-center">
                  <CreditCard size={16} className="mr-2" />
                  Card
                </div>
              </button>
            </div>
            
            {paymentMethod === "crypto" ? (
              <div>
                <p className="mb-4 text-sm font-scroll">Connect your wallet to complete your tithe of {amount} {selectedToken}.</p>
                <WalletConnect onConnect={handleWalletConnected} onCancel={() => setIsPaymentModalOpen(false)} />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-name" className="font-scroll">Name on Card</Label>
                  <Input 
                    id="card-name" 
                    placeholder="John Doe" 
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    className="font-scroll"
                  />
                </div>
                <div>
                  <Label htmlFor="card-number" className="font-scroll">Card Number</Label>
                  <Input 
                    id="card-number" 
                    placeholder="0000 0000 0000 0000" 
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/[^\d]/g, '')})}
                    className="font-scroll"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="card-expiry" className="font-scroll">Expiry Date</Label>
                    <Input 
                      id="card-expiry" 
                      placeholder="MM/YY" 
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      className="font-scroll"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="card-cvc" className="font-scroll">CVC</Label>
                    <Input 
                      id="card-cvc" 
                      placeholder="123" 
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/[^\d]/g, '').substring(0, 3)})}
                      className="font-scroll"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <PixelButton className="w-full font-scroll" onClick={handleCardPayment}>
                    Pay ${amount}
                  </PixelButton>
                </div>
                <div className="pt-2 text-center">
                  <button 
                    className="text-sm text-muted-foreground hover:text-foreground font-scroll"
                    onClick={() => setIsPaymentModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TitheForm;
