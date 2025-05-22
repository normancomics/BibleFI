
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { useToast } from "@/hooks/use-toast";
import PixelButton from "@/components/PixelButton";
import { addChurch } from "@/services/churchCreationService";
import { useFarcasterAuth } from "@/farcaster/auth";
import { supabase } from "@/integrations/supabase/client";

interface AddChurchFormProps {
  onComplete?: () => void;
  onChurchAdded?: (churchId: string) => void;
}

const AddChurchForm: React.FC<AddChurchFormProps> = ({ onComplete, onChurchAdded }) => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const { user } = useFarcasterAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Check if user is logged in with Supabase
  React.useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
    denomination: "",
    website: "",
    accepts_crypto: false,
    payment_methods: ["cash", "check"]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => {
      // Update payment methods to include/exclude crypto based on the switch
      const methods = [...prev.payment_methods];
      if (checked && !methods.includes("crypto")) {
        methods.push("crypto");
      } else if (!checked && methods.includes("crypto")) {
        methods.splice(methods.indexOf("crypto"), 1);
      }
      
      return { ...prev, accepts_crypto: checked, payment_methods: methods };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session && !user) {
      toast({
        title: "Authentication Required",
        description: "Please connect with Farcaster or sign in to add a church",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    // Make sure all required fields are filled
    if (!formData.name || !formData.city || !formData.state || !formData.country) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      playSound("error");
      return;
    }
    
    try {
      setIsSubmitting(true);
      playSound("select");
      toast({
        title: "Processing",
        description: "Adding your church to our database...",
      });
      
      const newChurch = await addChurch(formData);
      
      if (newChurch) {
        toast({
          title: "Church Added Successfully",
          description: `${formData.name} has been added to our database.`,
        });
        playSound("success");
        
        // Reset form
        setFormData({
          name: "",
          city: "",
          state: "",
          country: "",
          denomination: "",
          website: "",
          accepts_crypto: false,
          payment_methods: ["cash", "check"]
        });
        
        // Notify parent components
        if (onChurchAdded) onChurchAdded(newChurch.id);
        if (onComplete) onComplete();
      } else {
        throw new Error("Failed to add church");
      }
    } catch (error) {
      console.error("Error adding church:", error);
      toast({
        title: "Error Adding Church",
        description: "There was a problem adding this church. Please try again.",
        variant: "destructive"
      });
      playSound("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-5 pixel-card mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-scroll text-scripture">Add a Church</h2>
        {onComplete && (
          <button 
            className="text-muted-foreground hover:text-foreground flex items-center text-sm"
            onClick={() => {
              playSound("select");
              onComplete();
            }}
          >
            <ArrowLeft size={16} className="mr-1" /> Back to search
          </button>
        )}
      </div>
      
      {!session && !user && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-md mb-4">
          <p className="text-sm font-medium">
            You need to be signed in to add a church. Please connect with Farcaster or create an account.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Church Name*</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City*</Label>
            <Input 
              id="city" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State/Province*</Label>
            <Input 
              id="state" 
              name="state" 
              value={formData.state} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country*</Label>
            <Input 
              id="country" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="denomination">Denomination</Label>
            <Input 
              id="denomination" 
              name="denomination" 
              value={formData.denomination} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            name="website" 
            type="url" 
            value={formData.website} 
            onChange={handleChange} 
            placeholder="https://www.example.com"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="accepts_crypto" 
            checked={formData.accepts_crypto} 
            onCheckedChange={handleSwitchChange} 
          />
          <Label htmlFor="accepts_crypto">This church accepts cryptocurrency</Label>
        </div>
        
        <div className="pt-4">
          <PixelButton 
            type="submit" 
            className="w-full flex items-center justify-center"
            disabled={isSubmitting || (!session && !user)}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" /> Add Church
              </>
            )}
          </PixelButton>
        </div>
      </form>
    </Card>
  );
};

export default AddChurchForm;
