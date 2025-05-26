
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Building2, Smartphone, Wallet, FileText, DollarSign } from "lucide-react";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import { FiatPaymentService, FiatPaymentMethod } from "@/services/fiatPaymentService";
import { Church } from "@/types/church";

interface FiatPaymentFormProps {
  church: Church;
  onPaymentComplete?: (transactionId: string) => void;
  onCancel?: () => void;
}

const FiatPaymentForm: React.FC<FiatPaymentFormProps> = ({
  church,
  onPaymentComplete,
  onCancel
}) => {
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    bankAccount: "",
    routingNumber: ""
  });

  const currencies = FiatPaymentService.getSupportedCurrencies();
  const paymentMethods = FiatPaymentService.getPaymentMethodsByCurrency(currency);
  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);

  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard size={20} />;
      case 'Building2': return <Building2 size={20} />;
      case 'Smartphone': return <Smartphone size={20} />;
      case 'Wallet': return <Wallet size={20} />;
      case 'FileText': return <FileText size={20} />;
      default: return <DollarSign size={20} />;
    }
  };

  const calculateTotal = () => {
    if (!amount || !selectedMethod) return 0;
    const fee = FiatPaymentService.calculateFee(Number(amount), selectedPaymentMethod, currency);
    return Number(amount) + fee;
  };

  const handlePayment = async () => {
    if (!amount || !selectedPaymentMethod || !currency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (selectedMethod?.id === 'check') {
      // Show check instructions instead of processing
      const instructions = FiatPaymentService.generateCheckInstructions(
        Number(amount), 
        currency, 
        church
      );
      
      toast({
        title: "Check Payment Instructions",
        description: instructions,
        duration: 10000
      });
      return;
    }

    setIsProcessing(true);
    playSound("coin");

    try {
      const result = await FiatPaymentService.processPayment(
        Number(amount),
        currency,
        selectedPaymentMethod,
        church.id,
        paymentDetails
      );

      if (result.success && result.transactionId) {
        playSound("success");
        toast({
          title: "Payment Successful",
          description: `Your donation of ${currencies.find(c => c.code === currency)?.symbol}${amount} has been processed`,
        });
        
        if (onPaymentComplete) {
          onPaymentComplete(result.transactionId);
        }
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error) {
      playSound("error");
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentFields = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod.type) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails({
                  ...paymentDetails,
                  cardNumber: e.target.value
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    expiryDate: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    cvv: e.target.value
                  })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={paymentDetails.cardholderName}
                onChange={(e) => setPaymentDetails({
                  ...paymentDetails,
                  cardholderName: e.target.value
                })}
              />
            </div>
          </div>
        );

      case 'bank':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankAccount">Bank Account Number</Label>
              <Input
                id="bankAccount"
                placeholder="Account Number"
                value={paymentDetails.bankAccount}
                onChange={(e) => setPaymentDetails({
                  ...paymentDetails,
                  bankAccount: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                placeholder="Routing Number"
                value={paymentDetails.routingNumber}
                onChange={(e) => setPaymentDetails({
                  ...paymentDetails,
                  routingNumber: e.target.value
                })}
              />
            </div>
          </div>
        );

      case 'digital_wallet':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={paymentDetails.email}
                onChange={(e) => setPaymentDetails({
                  ...paymentDetails,
                  email: e.target.value
                })}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                You'll be redirected to {selectedMethod.name} to complete your payment.
              </p>
            </div>
          </div>
        );

      case 'check':
        return (
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-sm text-amber-700 mb-2">
              Click "Process Payment" to get mailing instructions for your check.
            </p>
            <p className="text-xs text-amber-600">
              Processing time: {selectedMethod.processingTime}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign size={24} />
          Donate to {church.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Donation Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(curr => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(method.icon)}
                      <div>
                        <div>{method.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Fee: {method.id === 'wire_transfer' ? `$${method.processingFee}` : `${method.processingFee}%`} • 
                          {method.processingTime}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMethod && (
            <div className="text-sm text-muted-foreground">
              {selectedMethod.description}
            </div>
          )}
        </div>

        {renderPaymentFields()}

        {amount && selectedMethod && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Donation:</span>
              <span>{currencies.find(c => c.code === currency)?.symbol}{amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Processing Fee:</span>
              <span>
                {currencies.find(c => c.code === currency)?.symbol}
                {FiatPaymentService.calculateFee(Number(amount), selectedPaymentMethod, currency).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{currencies.find(c => c.code === currency)?.symbol}{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {onCancel && (
            <PixelButton
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </PixelButton>
          )}
          <PixelButton
            onClick={handlePayment}
            disabled={!amount || !selectedPaymentMethod || isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Process Payment"}
          </PixelButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiatPaymentForm;
