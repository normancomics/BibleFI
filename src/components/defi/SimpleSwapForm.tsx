
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, RefreshCw } from "lucide-react";

const formSchema = z.object({
  fromAmount: z.string().min(1, { message: "Amount is required" }),
  fromToken: z.string().min(1, { message: "Token is required" }),
  toToken: z.string().min(1, { message: "Token is required" }),
});

const TOKENS = [
  { id: "ETH", name: "Ethereum", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024" },
  { id: "USDC", name: "USDC", icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024" },
  { id: "USDT", name: "Tether", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=024" },
  { id: "DAI", name: "Dai", icon: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=024" },
  { id: "WETH", name: "Wrapped ETH", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024" },
];

const SimpleSwapForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromAmount: "",
      fromToken: "ETH",
      toToken: "USDC",
    },
  });

  const watchFromAmount = form.watch("fromAmount");
  const watchFromToken = form.watch("fromToken");
  const watchToToken = form.watch("toToken");

  // Calculate exchange when inputs change
  React.useEffect(() => {
    if (watchFromAmount && watchFromToken && watchToToken) {
      // Mock exchange rate calculation
      let rate: number;
      
      if (watchFromToken === "ETH" && watchToToken === "USDC") {
        rate = 3025.45;
      } else if (watchFromToken === "USDC" && watchToToken === "ETH") {
        rate = 1 / 3025.45;
      } else if (watchFromToken === watchToToken) {
        rate = 1;
      } else {
        // Random rate for other pairs
        rate = Math.random() * 10 + 0.1;
      }
      
      const amount = parseFloat(watchFromAmount);
      if (!isNaN(amount)) {
        setEstimatedAmount((amount * rate).toFixed(6));
        setExchangeRate(rate.toFixed(6));
      }
    } else {
      setEstimatedAmount(null);
      setExchangeRate(null);
    }
  }, [watchFromAmount, watchFromToken, watchToToken]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Swap values:", values, "Estimated amount:", estimatedAmount);
      
      toast({
        title: "Swap Initiated",
        description: `Swapping ${values.fromAmount} ${values.fromToken} for approximately ${estimatedAmount} ${values.toToken}`,
      });
      
      setIsLoading(false);
    }, 1500);
  };

  const handleSwitchTokens = () => {
    const fromToken = form.getValues("fromToken");
    const toToken = form.getValues("toToken");
    
    form.setValue("fromToken", toToken);
    form.setValue("toToken", fromToken);
  };

  return (
    <Card className="border-2 border-scripture/30">
      <CardHeader>
        <CardTitle className="font-scroll text-xl text-center">
          Biblical DeFi Swap
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="fromAmount"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>You Pay</FormLabel>
                      <FormControl>
                        <Input placeholder="0.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fromToken"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Token</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOKENS.map((token) => (
                            <SelectItem key={token.id} value={token.id}>
                              <div className="flex items-center">
                                <img src={token.icon} alt={token.name} className="w-4 h-4 mr-2" />
                                {token.id}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSwitchTokens}
                  className="rounded-full bg-scripture/20 hover:bg-scripture/30"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <FormLabel>You Receive (estimated)</FormLabel>
                  <div className="border rounded-md px-3 py-2 bg-black/30">
                    {estimatedAmount || "0.0"}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="toToken"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Token</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOKENS.map((token) => (
                            <SelectItem key={token.id} value={token.id}>
                              <div className="flex items-center">
                                <img src={token.icon} alt={token.name} className="w-4 h-4 mr-2" />
                                {token.id}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {exchangeRate && (
              <div className="bg-black/20 p-3 rounded-md text-sm flex items-center justify-between">
                <span>Exchange Rate</span>
                <span className="font-mono">
                  1 {watchFromToken} = {exchangeRate} {watchToToken}
                </span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-scripture hover:bg-scripture-light"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Swapping...
                </>
              ) : (
                "Swap Tokens"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <div className="text-xs text-center text-muted-foreground">
          <p>
            "You shall not charge interest to your countrymen: interest on money, food, or anything that may be loaned at interest." 
            <span className="block mt-1">— Deuteronomy 23:19</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SimpleSwapForm;
