
import { supabase } from "@/integrations/supabase/client";
import { Church } from "@/types/church";

export async function searchChurches(query: string): Promise<Church[]> {
  try {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .or(`name.ilike.%${query}%, denomination.ilike.%${query}%, location.ilike.%${query}%`)
      .limit(20);
    
    if (error) {
      console.error("Error searching churches:", error);
      return [];
    }
    
    return data || [];
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
      ...item.churches,
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
