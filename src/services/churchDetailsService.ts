
import { Church } from "@/types/church";
import { mockChurches } from "@/data/mockChurches";
import { isSupabaseConnected } from "@/utils/supabaseConnector";
import { supabase } from "@/integrations/supabase/client";

/**
 * Get church details by ID
 */
export async function getChurchById(id: string): Promise<Church | null> {
  console.log("Getting church with id:", id);
  
  // Use mock data when Supabase is not connected
  if (!isSupabaseConnected()) {
    console.log("Using mock churches data");
    
    const church = mockChurches.find(church => church.id === id);
    return church || null;
  }
  
  // For future Supabase implementation
  try {
    console.log("This would use Supabase in production");
    return mockChurches.find(church => church.id === id) || null; // Use mock data for now
  } catch (error) {
    console.error("Error fetching church details:", error);
    return null;
  }
}
