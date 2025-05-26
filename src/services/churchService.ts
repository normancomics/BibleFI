
import { supabase } from "@/integrations/supabase/client";
import { Church } from "@/types/church";
import { ExternalChurchService } from "./externalChurchService";

export async function searchChurches(query: string): Promise<Church[]> {
  try {
    // Search local database first
    const { data: localChurches, error } = await supabase
      .from('churches')
      .select('*')
      .or(`name.ilike.%${query}%, denomination.ilike.%${query}%, city.ilike.%${query}%, state.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error("Error searching local churches:", error);
    }
    
    // Transform database format to Church interface
    const transformedLocal = localChurches?.map(church => ({
      id: church.id,
      name: church.name,
      denomination: church.denomination,
      location: `${church.city}, ${church.state}, ${church.country}`,
      address: church.address,
      city: church.city,
      state: church.state,
      country: church.country,
      website: church.website,
      acceptsCrypto: church.accepts_crypto,
      payment_methods: church.payment_methods,
      verified: church.verified,
      created_at: church.created_at,
      created_by: church.created_by
    })) || [];
    
    // Search external sources for additional results
    let externalChurches: Church[] = [];
    try {
      externalChurches = await ExternalChurchService.searchGooglePlaces(query);
    } catch (error) {
      console.error("Error searching external churches:", error);
    }
    
    // Combine and deduplicate results
    const allChurches = [...transformedLocal, ...externalChurches];
    const uniqueChurches = allChurches.filter((church, index, self) => 
      index === self.findIndex(c => c.name === church.name && c.city === church.city)
    );
    
    return uniqueChurches.slice(0, 20);
  } catch (error) {
    console.error("Error in searchChurches:", error);
    return [];
  }
}

export async function getUserChurches(): Promise<Church[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('user_churches')
      .select(`
        church_id,
        is_primary_church,
        churches (*)
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error fetching user churches:", error);
      return [];
    }
    
    return data?.map(item => ({
      id: item.churches.id,
      name: item.churches.name,
      denomination: item.churches.denomination,
      location: `${item.churches.city}, ${item.churches.state}, ${item.churches.country}`,
      address: item.churches.address,
      city: item.churches.city,
      state: item.churches.state,
      country: item.churches.country,
      website: item.churches.website,
      acceptsCrypto: item.churches.accepts_crypto,
      payment_methods: item.churches.payment_methods,
      verified: item.churches.verified,
      created_at: item.churches.created_at,
      created_by: item.churches.created_by,
      isPrimaryChurch: item.is_primary_church
    })) || [];
  } catch (error) {
    console.error("Error in getUserChurches:", error);
    return [];
  }
}

export async function joinChurch(churchId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('user_churches')
      .insert({
        user_id: user.id,
        church_id: churchId,
        is_primary_church: false
      });
    
    if (error) {
      console.error("Error joining church:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in joinChurch:", error);
    return false;
  }
}

export async function setPrimaryChurch(churchId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // First, unset all primary churches for this user
    await supabase
      .from('user_churches')
      .update({ is_primary_church: false })
      .eq('user_id', user.id);
    
    // Then set the new primary church
    const { error } = await supabase
      .from('user_churches')
      .update({ is_primary_church: true })
      .eq('user_id', user.id)
      .eq('church_id', churchId);
    
    if (error) {
      console.error("Error setting primary church:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in setPrimaryChurch:", error);
    return false;
  }
}

export async function leaveChurch(churchId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('user_churches')
      .delete()
      .eq('user_id', user.id)
      .eq('church_id', churchId);
    
    if (error) {
      console.error("Error leaving church:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in leaveChurch:", error);
    return false;
  }
}
