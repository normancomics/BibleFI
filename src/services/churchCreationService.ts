
import { Church } from "@/types/church";
import { mockChurches } from "@/data/mockChurches";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Add a new church to the database
 */
export async function addChurch(churchData: {
  name: string;
  city: string;
  state: string;
  country: string;
  denomination: string;
  website: string;
  accepts_crypto: boolean;
  payment_methods: string[];
}): Promise<Church | null> {
  console.log("Adding new church:", churchData);
  
  try {
    const { data, error } = await supabase
      .from('churches')
      .insert({
        name: churchData.name,
        city: churchData.city,
        state: churchData.state,
        country: churchData.country,
        denomination: churchData.denomination || null,
        website: churchData.website || null,
        accepts_crypto: churchData.accepts_crypto,
        payment_methods: churchData.payment_methods
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error adding church:", error);
      throw new Error(error.message);
    }
    
    if (!data) {
      console.error("No data returned when adding church");
      return null;
    }
    
    // Convert the Supabase church format to our app's Church type
    const newChurch: Church = {
      id: data.id,
      name: data.name,
      location: `${data.city}, ${data.state}`,
      city: data.city,
      state: data.state,
      country: data.country,
      denomination: data.denomination,
      acceptsCrypto: data.accepts_crypto,
      website: data.website,
      payment_methods: data.payment_methods
    };
    
    console.log("Church added successfully:", newChurch);
    return newChurch;
  } catch (error) {
    console.error("Error adding church:", error);
    return null;
  }
}
