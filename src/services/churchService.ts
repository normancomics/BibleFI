
import { Church } from "@/types/church";
import { mockChurches } from "@/data/mockChurches";
import { isSupabaseConnected } from "@/utils/supabaseConnector";
import { supabase } from "@/integrations/supabase/client";
import { extractLocationParts } from "@/utils/locationUtils";

/**
 * Search for churches by name or location
 */
export async function searchChurches(query: string): Promise<Church[]> {
  console.log("Searching churches with query:", query);
  
  // If no query provided or too short, return empty array
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  // Use mock data when Supabase is not connected
  if (!isSupabaseConnected()) {
    console.log("Using mock churches data");
    const normalizedQuery = query.toLowerCase().trim();
    
    return mockChurches.filter(church => 
      church.name.toLowerCase().includes(normalizedQuery) ||
      church.location?.toLowerCase().includes(normalizedQuery) ||
      church.city?.toLowerCase().includes(normalizedQuery) ||
      church.state?.toLowerCase().includes(normalizedQuery) ||
      church.country?.toLowerCase().includes(normalizedQuery) ||
      church.denomination?.toLowerCase().includes(normalizedQuery)
    );
  }
  
  // For future Supabase implementation
  try {
    console.log("This would use Supabase in production");
    return mockChurches; // Use mock data for now
  } catch (error) {
    console.error("Error searching churches:", error);
    return mockChurches; // Fallback to mock data
  }
}
