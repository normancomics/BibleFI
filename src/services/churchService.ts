
import { supabase } from "@/integrations/supabase/client";
import { supabaseApi } from "@/integrations/supabase/apiClient";
import { Church } from "@/types/church";
import { ExternalChurchService } from "./externalChurchService";

export async function searchChurches(query: string): Promise<Church[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    // Search global_churches via api schema (churches table is deprecated)
    const globalChurchesResult = await supabaseApi
      .from('global_churches')
      .select('*')
      .or(`name.ilike.%${query}%, denomination.ilike.%${query}%, city.ilike.%${query}%, state_province.ilike.%${query}%, country.ilike.%${query}%`)
      .limit(20);
    
    if (globalChurchesResult.error) {
      console.error("Error searching global churches:", globalChurchesResult.error);
      return [];
    }
    
    // Transform global_churches table results
    const results: Church[] = (globalChurchesResult.data || []).map((church: any) => ({
      id: church.id,
      name: church.name,
      denomination: church.denomination,
      location: `${church.city}, ${church.state_province || ''}, ${church.country}`,
      address: church.address,
      city: church.city,
      state: church.state_province || '',
      country: church.country,
      website: church.website,
      acceptsCrypto: church.accepts_crypto,
      payment_methods: church.accepts_fiat ? ['cash'] : [],
      verified: church.verified,
      created_at: church.created_at,
    }));
    
    return results;
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
      .from('church_memberships')
      .select(`
        church_id,
        primary_church,
        churches (*)
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error fetching user churches:", error);
      return [];
    }
    
    return data?.map(item => ({
      id: item.churches?.id || '',
      name: item.churches?.name || '',
      denomination: item.churches?.denomination || '',
      location: `${item.churches?.city || ''}, ${item.churches?.state || ''}, ${item.churches?.country || ''}`,
      address: item.churches?.address || '',
      city: item.churches?.city || '',
      state: item.churches?.state || '',
      country: item.churches?.country || '',
      website: item.churches?.website || '',
      acceptsCrypto: item.churches?.accepts_crypto || false,
      payment_methods: item.churches?.payment_methods || [],
      verified: item.churches?.verified || false,
      created_at: item.churches?.created_at || '',
      created_by: item.churches?.created_by || '',
      isPrimaryChurch: item.primary_church
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
      .from('church_memberships')
      .insert({
        user_id: user.id,
        church_id: churchId,
        primary_church: false
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
      .from('church_memberships')
      .update({ primary_church: false })
      .eq('user_id', user.id);
    
    // Then set the new primary church
    const { error } = await supabase
      .from('church_memberships')
      .update({ primary_church: true })
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
      .from('church_memberships')
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
