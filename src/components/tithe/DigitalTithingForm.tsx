
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Coins, ArrowRight, ExternalLink } from "lucide-react";
import PixelButton from "@/components/PixelButton";

const formSchema = z.object({
  amount: z.string().min(1, { message: "Tithing amount is required" }),
  currency: z.string().min(1, { message: "Please select a currency" }),
  church: z.string().min(1, { message: "Please select a church or ministry" }),
  message: z.string().optional(),
});

const DigitalTithingForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"daimo" | "wallet">("daimo");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      currency: "USDC",
      church: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    if (paymentMethod === "daimo") {
      toast({
        title: "Opening Daimo",
        description: `Preparing to send ${values.amount} ${values.currency} using Daimo direct payments.`,
      });
      
      // Simulate opening Daimo payment link
      setTimeout(() => {
        window.open(`https://app.daimo.com/send?amount=${values.amount}&currency=${values.currency.toLowerCase()}`, "_blank");
        setIsSubmitting(false);
        form.reset();
      }, 1500);
    } else {
      // Simulate API call for wallet payment
      setTimeout(() => {
        console.log("Tithing values:", values);
        
        toast({
          title: "Tithing Initiated",
          description: `Your tithe of ${values.amount} ${values.currency} has been submitted.`,
        });
        
        form.reset();
        setIsSubmitting(false);
      }, 1500);
    }
  };

  return (
    <Card className="border-2 border-ancient-gold/30">
      <CardHeader className="bg-scripture/20">
        <CardTitle className="font-scroll text-2xl text-center flex items-center justify-center gap-2">
          <Coins className="text-ancient-gold" />
          Digital Tithing with Daimo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex gap-4 mb-6">
          <Button
            variant={paymentMethod === "daimo" ? "default" : "outline"}
            className={paymentMethod === "daimo" ? "bg-purple-900 text-ancient-gold border border-ancient-gold/50 flex-1" : "flex-1"}
            onClick={() => setPaymentMethod("daimo")}
          >
            Daimo Direct
          </Button>
          <Button
            variant={paymentMethod === "wallet" ? "default" : "outline"}
            className={paymentMethod === "wallet" ? "bg-purple-900 text-ancient-gold border border-ancient-gold/50 flex-1" : "flex-1"}
            onClick={() => setPaymentMethod("wallet")}
          >
            Connect Wallet
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-scroll">Tithing Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} type="number" step="0.01" min="0" className="font-scroll" />
                  </FormControl>
                  <FormDescription className="font-scroll">
                    Scripture teaches giving a tenth (10%) of your income
                  </FormDescription>
                  <FormMessage className="font-scroll" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-scroll">Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-scroll">
                        <SelectValue placeholder="Select currency" className="font-scroll" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USDC" className="font-scroll">USDC</SelectItem>
                      <SelectItem value="ETH" className="font-scroll">ETH</SelectItem>
                      <SelectItem value="USDT" className="font-scroll">USDT</SelectItem>
                      <SelectItem value="DAI" className="font-scroll">DAI</SelectItem>
                      <SelectItem value="USD" className="font-scroll">USD (Credit Card)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="font-scroll">
                    Choose your preferred currency for tithing
                  </FormDescription>
                  <FormMessage className="font-scroll" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="church"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-scroll">Church or Ministry</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-scroll">
                        <SelectValue placeholder="Select church" className="font-scroll" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="local" className="font-scroll">My Local Church</SelectItem>
                      <SelectItem value="global" className="font-scroll">Global Missions</SelectItem>
                      <SelectItem value="charity" className="font-scroll">Christian Charity</SelectItem>
                      <SelectItem value="bible" className="font-scroll">Bible Translation Work</SelectItem>
                      <SelectItem value="other" className="font-scroll">Other Ministry</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="font-scroll">
                    Select where you would like your tithe to go
                  </FormDescription>
                  <FormMessage className="font-scroll" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-scroll">Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add a personal message..." {...field} className="font-scroll" />
                  </FormControl>
                  <FormMessage className="font-scroll" />
                </FormItem>
              )}
            />
            
            <div className="text-center">
              <PixelButton 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
                className="px-8 font-scroll"
                farcasterStyle
              >
                {isSubmitting ? "Processing..." : (paymentMethod === "daimo" ? "Open Daimo" : "Submit Tithe")}
                {paymentMethod === "daimo" && <ExternalLink size={16} className="ml-2" />}
              </PixelButton>
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="bg-black/30 border-t border-ancient-gold/20 p-3 text-xs text-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-white/70">Powered by</span>
          <span className="text-ancient-gold font-medium">Daimo</span>
          <span className="text-white/70">on</span>
          <span className="text-base-blue font-medium">Base Chain</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DigitalTithingForm;
