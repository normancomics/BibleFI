import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import { addChurch } from "@/services/churchCreationService";
import { Church } from "@/types/church";

type ChurchFormData = {
  name: string;
  location: string;
  denomination: string;
  website: string;
  email: string;
  phone: string;
  acceptsCrypto: boolean;
  city: string;
  state: string;
  country: string;
};

const AddChurchForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ChurchFormData>();
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const onSubmit = async (data: ChurchFormData) => {
    playSound("coin");
    
    try {
      // Format location from city and state if not provided
      const location = data.location || `${data.city}, ${data.state}`;
      
      // This will save to your Supabase database when connected
      await addChurch({
        ...data,
        location,
        acceptsCrypto: !!data.acceptsCrypto,
      });
      
      toast({
        title: "Church Added",
        description: "Thank you for adding your church to our database!",
      });
      
      onClose();
    } catch (error) {
      console.error("Error adding church:", error);
      toast({
        title: "Error",
        description: "There was a problem adding your church. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="pixel-card">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-scroll mb-4">Add Your Church</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Church Name</Label>
            <Input 
              id="name" 
              {...register("name", { required: "Church name is required" })}
              className="mt-1"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                {...register("city", { required: "City is required" })}
                className="mt-1"
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input 
                id="state" 
                {...register("state", { required: "State is required" })}
                className="mt-1"
              />
              {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <Input 
              id="country" 
              {...register("country")}
              className="mt-1"
              defaultValue="USA"
            />
          </div>
          
          <div>
            <Label htmlFor="denomination">Denomination</Label>
            <Input 
              id="denomination" 
              {...register("denomination")}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              {...register("website")}
              className="mt-1"
              placeholder="https://"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Contact Email</Label>
            <Input 
              id="email" 
              {...register("email")}
              className="mt-1"
              type="email"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              {...register("phone")}
              className="mt-1"
              type="tel"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="acceptsCrypto"
              {...register("acceptsCrypto")}
              className="mr-2"
            />
            <Label htmlFor="acceptsCrypto">Church currently accepts cryptocurrency</Label>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <PixelButton type="submit">
              Save Church
            </PixelButton>
            <PixelButton type="button" variant="outline" onClick={onClose}>
              Cancel
            </PixelButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddChurchForm;
