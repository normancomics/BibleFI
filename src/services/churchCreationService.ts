
import { Church } from "@/types/church";
import { mockChurches } from "@/data/mockChurches";
import { isSupabaseConnected } from "@/utils/supabaseConnector";
import { supabase } from "@/integrations/supabase/client";

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
}): Promise<Church> {
  console.log("Adding new church:", churchData);
  
  // Use mock data when Supabase is not connected
  if (!isSupabaseConnected()) {
    console.log("Using mock data (no Supabase connection)");
    
    // Generate a new mock church with a unique ID
    const newId = `mock-${Date.now()}`;
    const location = `${churchData.city}, ${churchData.state}`;
    
    const newChurch: Church = {
      id: newId,
      name: churchData.name,
      location: location,
      city: churchData.city,
      state: churchData.state,
      country: churchData.country,
      denomination: churchData.denomination,
      acceptsCrypto: churchData.accepts_crypto,
      website: churchData.website,
      payment_methods: churchData.payment_methods
    };
    
    // In a real app, we would push to Supabase here
    return newChurch;
  }
  
  // For future Supabase implementation
  try {
    console.log("This would use Supabase in production");
    
    // Mock implementation for now
    const newId = `mock-${Date.now()}`;
    const location = `${churchData.city}, ${churchData.state}`;
    
    const newChurch: Church = {
      id: newId,
      name: churchData.name,
      location: location,
      city: churchData.city,
      state: churchData.state,
      country: churchData.country,
      denomination: churchData.denomination,
      acceptsCrypto: churchData.accepts_crypto,
      website: churchData.website,
      payment_methods: churchData.payment_methods
    };
    
    return newChurch;
  } catch (error) {
    console.error("Error adding church:", error);
    throw new Error("Failed to add church");
  }
}
