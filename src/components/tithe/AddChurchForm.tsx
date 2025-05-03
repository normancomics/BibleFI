
import React, { useState } from "react";
import { addChurch } from "@/services/churchCreationService";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { useSound } from "@/contexts/SoundContext";

const AddChurchForm: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  
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
    setFormData(prev => ({ ...prev, accepts_crypto: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Ensure we pass all required fields
      await addChurch({
        name: formData.name,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        denomination: formData.denomination || "",
        website: formData.website || "",
        accepts_crypto: formData.accepts_crypto,
        payment_methods: formData.payment_methods
      });
      
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
    } catch (error) {
      toast({
        title: "Error Adding Church",
        description: "There was a problem adding this church. Please try again.",
        variant: "destructive"
      });
      playSound("error");
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-xl font-scroll mb-4 text-scripture">Add a Church</h2>
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
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="accepts_crypto" 
            checked={formData.accepts_crypto} 
            onCheckedChange={handleSwitchChange} 
          />
          <Label htmlFor="accepts_crypto">Accepts Cryptocurrency</Label>
        </div>
        
        <Button 
          type="submit" 
          className="bg-scripture hover:bg-scripture-dark"
          onClick={() => playSound("select")}
        >
          Add Church
        </Button>
      </form>
    </Card>
  );
};

export default AddChurchForm;
