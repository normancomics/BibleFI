
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { addChurch } from '@/services/churchCreationService';
import { useSound } from '@/contexts/SoundContext';

const formSchema = z.object({
  name: z.string().min(3, { message: "Church name must be at least 3 characters." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  country: z.string().min(2, { message: "Country is required." }),
  denomination: z.string().optional(),
  website: z.string().optional(),
  accepts_crypto: z.boolean().default(false),
  payment_methods: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const AddChurchForm: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      state: "",
      country: "",
      denomination: "",
      website: "",
      accepts_crypto: false,
      payment_methods: [],
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    playSound("powerup");
    
    try {
      const church = await addChurch(data);
      
      toast({
        title: "Church added successfully!",
        description: `${church.name} has been added to our directory.`,
      });
      
      form.reset();
      playSound("success");
    } catch (error) {
      console.error("Error adding church:", error);
      playSound("error");
      toast({
        title: "Failed to add church",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Payment method options
  const paymentMethods = [
    { id: "credit-card", label: "Credit Card" },
    { id: "paypal", label: "PayPal" },
    { id: "bank-transfer", label: "Bank Transfer" },
    { id: "usdc", label: "USDC" },
    { id: "eth", label: "ETH" },
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Name</FormLabel>
              <FormControl>
                <Input placeholder="First Baptist Church" {...field} />
              </FormControl>
              <FormDescription>
                Enter the official name of the church.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="California" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="United States" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="denomination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Denomination</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a denomination" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="baptist">Baptist</SelectItem>
                  <SelectItem value="catholic">Catholic</SelectItem>
                  <SelectItem value="lutheran">Lutheran</SelectItem>
                  <SelectItem value="methodist">Methodist</SelectItem>
                  <SelectItem value="presbyterian">Presbyterian</SelectItem>
                  <SelectItem value="evangelical">Evangelical</SelectItem>
                  <SelectItem value="non-denominational">Non-denominational</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the church's denomination.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://www.churchwebsite.com" {...field} />
              </FormControl>
              <FormDescription>
                Enter the church's official website URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accepts_crypto"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Accepts Cryptocurrency
                </FormLabel>
                <FormDescription>
                  Can this church receive cryptocurrency donations directly?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="payment_methods"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">
                  Accepted Payment Methods
                </FormLabel>
                <FormDescription>
                  Select all payment methods that this church accepts.
                </FormDescription>
              </div>
              {paymentMethods.map((method) => (
                <FormField
                  key={method.id}
                  control={form.control}
                  name="payment_methods"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={method.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(method.id)}
                            onCheckedChange={(checked) => {
                              playSound("click");
                              return checked
                                ? field.onChange([...field.value, method.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== method.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {method.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          onClick={() => playSound("select")}
          className="pixel-button w-full"
        >
          {isSubmitting ? "Adding..." : "Add Church"}
        </Button>
      </form>
    </Form>
  );
};

export default AddChurchForm;
