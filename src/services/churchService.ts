
import { Church } from "@/types/church";
import { mockChurches } from "@/data/mockChurches";
import { supabase } from "@/integrations/supabase/client";

export async function searchChurches(query: string): Promise<Church[]> {
  console.log("Searching churches with query:", query);
  
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Always try Supabase first, but have robust fallback
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .or(`name.ilike.%${normalizedQuery}%, 
           city.ilike.%${normalizedQuery}%, 
           state.ilike.%${normalizedQuery}%, 
           country.ilike.%${normalizedQuery}%,
           denomination.ilike.%${normalizedQuery}%`)
      .limit(20);
    
    if (error || !data || data.length === 0) {
      console.log("Using mock church data");
      return searchMockChurches(normalizedQuery);
    }
    
    // Convert Supabase data to Church format
    const churches: Church[] = data.map(church => ({
      id: church.id,
      name: church.name,
      location: `${church.city}, ${church.state}`,
      city: church.city,
      state: church.state,
      country: church.country,
      denomination: church.denomination || "Non-denominational",
      acceptsCrypto: church.accepts_crypto || false,
      website: church.website,
      payment_methods: church.payment_methods || ["cash", "check"]
    }));
    
    console.log(`Found ${churches.length} churches`);
    return churches;
  } catch (error) {
    console.log("Church search error, using mock data:", error);
    return searchMockChurches(query.toLowerCase().trim());
  }
}

function searchMockChurches(normalizedQuery: string): Church[] {
  return mockChurches.filter(church => {
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
}

export async function joinChurch(churchId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user");
      return false;
    }
    
    // Check existing membership
    const { data: existing } = await supabase
      .from('church_memberships')
      .select('id')
      .eq('church_id', churchId)
      .eq('user_id', user.id)
      .single();
    
    if (existing) {
      return true; // Already a member
    }
    
    const { error } = await supabase
      .from('church_memberships')
      .insert({
        church_id: churchId,
        user_id: user.id
      });
    
    return !error;
  } catch (error) {
    console.log("Error joining church:", error);
    return false;
  }
}

export async function getUserChurches(): Promise<Church[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('church_memberships')
      .select(`
        churches:church_id (
          id,
          name,
          city,
          state,
          country,
          denomination,
          accepts_crypto,
          website,
          payment_methods
        ),
        primary_church
      `)
      .eq('user_id', user.id);
    
    if (error || !data) {
      console.log("Error fetching user churches:", error);
      return [];
    }
    
    return data.map((membership: any) => ({
      id: membership.churches.id,
      name: membership.churches.name,
      location: `${membership.churches.city}, ${membership.churches.state}`,
      city: membership.churches.city,
      state: membership.churches.state,
      country: membership.churches.country,
      denomination: membership.churches.denomination || "Non-denominational",
      acceptsCrypto: membership.churches.accepts_crypto || false,
      website: membership.churches.website,
      payment_methods: membership.churches.payment_methods || ["cash", "check"],
      isPrimaryChurch: membership.primary_church
    }));
  } catch (error) {
    console.log("Error fetching user churches:", error);
    return [];
  }
}

export async function setPrimaryChurch(churchId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    // First, remove primary status from all churches
    await supabase
      .from('church_memberships')
      .update({ primary_church: false })
      .eq('user_id', user.id);
    
    // Then set the new primary church
    const { error } = await supabase
      .from('church_memberships')
      .update({ primary_church: true })
      .eq('church_id', churchId)
      .eq('user_id', user.id);
    
    return !error;
  } catch (error) {
    console.log("Error setting primary church:", error);
    return false;
  }
}

export async function leaveChurch(churchId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { error } = await supabase
      .from('church_memberships')
      .delete()
      .eq('church_id', churchId)
      .eq('user_id', user.id);
    
    return !error;
  } catch (error) {
    console.log("Error leaving church:", error);
    return false;
  }
}
