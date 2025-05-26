import { Church } from "@/types/church";
import { mockChurches } from "@/data/mockChurches";
import { supabase } from "@/integrations/supabase/client";

/**
 * Search for churches by name or location
 */
export async function searchChurches(query: string): Promise<Church[]> {
  console.log("Searching churches with query:", query);
  
  // If no query provided or too short, return empty array
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Try to search for churches in Supabase
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .or(`name.ilike.%${normalizedQuery}%, 
           city.ilike.%${normalizedQuery}%, 
           state.ilike.%${normalizedQuery}%, 
           country.ilike.%${normalizedQuery}%,
           denomination.ilike.%${normalizedQuery}%`)
      .limit(20);
    
    if (error) {
      console.log("Supabase error, falling back to mock data:", error);
      // Fallback to mock data search
      return mockChurches.filter(church => 
        church.name.toLowerCase().includes(normalizedQuery) ||
        church.location?.toLowerCase().includes(normalizedQuery) ||
        church.city?.toLowerCase().includes(normalizedQuery) ||
        church.state?.toLowerCase().includes(normalizedQuery) ||
        church.country?.toLowerCase().includes(normalizedQuery) ||
        church.denomination?.toLowerCase().includes(normalizedQuery)
      );
    }
    
    if (!data || data.length === 0) {
      console.log("No churches found in database, using mock data");
      // Filter mock data as fallback
      return mockChurches.filter(church => 
        church.name.toLowerCase().includes(normalizedQuery) ||
        church.location?.toLowerCase().includes(normalizedQuery) ||
        church.city?.toLowerCase().includes(normalizedQuery) ||
        church.state?.toLowerCase().includes(normalizedQuery) ||
        church.country?.toLowerCase().includes(normalizedQuery) ||
        church.denomination?.toLowerCase().includes(normalizedQuery)
      );
    }
    
    // Convert the Supabase church format to our app's Church type
    const churches: Church[] = data.map(church => ({
      id: church.id,
      name: church.name,
      location: `${church.city}, ${church.state}`,
      city: church.city,
      state: church.state,
      country: church.country,
      denomination: church.denomination,
      acceptsCrypto: church.accepts_crypto,
      website: church.website,
      payment_methods: church.payment_methods
    }));
    
    console.log(`Found ${churches.length} churches in database`);
    return churches;
  } catch (error) {
    console.log("Error accessing database, using mock data:", error);
    const normalizedQuery = query.toLowerCase().trim();
    
    // Enhanced mock data search with better matching
    const filteredChurches = mockChurches.filter(church => {
      const searchTerms = [
        church.name,
        church.location,
        church.city,
        church.state,
        church.country,
        church.denomination
      ].filter(Boolean).map(term => term?.toLowerCase());
      
      return searchTerms.some(term => term?.includes(normalizedQuery));
    });
    
    console.log(`Found ${filteredChurches.length} churches in mock data`);
    return filteredChurches;
  }
}

/**
 * Join a church as a member
 */
export async function joinChurch(churchId: string): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }
    
    const { error } = await supabase
      .from('church_memberships')
      .insert({
        church_id: churchId,
        user_id: user.id
      });
    
    if (error) {
      console.error("Error joining church:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error joining church:", error);
    return false;
  }
}

/**
 * Get current user's church memberships
 */
export async function getUserChurches(): Promise<Church[]> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }
    
    const { data, error } = await supabase
      .from('church_memberships')
      .select(`
        church_id,
        primary_church,
        churches:church_id (*)
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error getting user churches:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convert the Supabase format to our app's Church type
    const churches = data.map(membership => {
      const church = membership.churches;
      return {
        id: church.id,
        name: church.name,
        location: `${church.city}, ${church.state}`,
        city: church.city,
        state: church.state,
        country: church.country,
        denomination: church.denomination,
        acceptsCrypto: church.accepts_crypto,
        website: church.website,
        payment_methods: church.payment_methods,
        isPrimaryChurch: membership.primary_church
      } as Church;
    });
    
    return churches;
  } catch (error) {
    console.error("Error getting user churches:", error);
    return [];
  }
}

/**
 * Set a church as the primary church for a user
 */
export async function setPrimaryChurch(churchId: string): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }
    
    // First, reset all churches to non-primary
    const { error: resetError } = await supabase
      .from('church_memberships')
      .update({ primary_church: false })
      .eq('user_id', user.id);
    
    if (resetError) {
      console.error("Error resetting primary churches:", resetError);
      return false;
    }
    
    // Then set the selected church as primary
    const { error } = await supabase
      .from('church_memberships')
      .update({ primary_church: true })
      .eq('church_id', churchId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error setting primary church:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error setting primary church:", error);
    return false;
  }
}

/**
 * Leave a church (delete membership)
 */
export async function leaveChurch(churchId: string): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }
    
    const { error } = await supabase
      .from('church_memberships')
      .delete()
      .eq('church_id', churchId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error leaving church:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error leaving church:", error);
    return false;
  }
}
