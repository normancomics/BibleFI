
import { supabase } from '@/integrations/supabase/client';
import { Church } from '@/types/church';
import { mockChurches } from '@/data/mockChurches';
import { isSupabaseConnected } from '@/utils/supabaseConnector';
import { extractLocationParts } from '@/utils/locationUtils';

/**
 * Search for churches by name, location, or denomination
 */
export const searchChurches = async (query: string): Promise<Church[]> => {
  // If Supabase is connected, use it
  if (isSupabaseConnected()) {
    try {
      const normalizedQuery = query.toLowerCase();
      const { data, error } = await supabase
        .from('churches')
        .select('id, name, city, state, country, denomination, website, accepts_crypto, payment_methods')
        .or(`name.ilike.%${normalizedQuery}%,city.ilike.%${normalizedQuery}%,state.ilike.%${normalizedQuery}%,denomination.ilike.%${normalizedQuery}%`)
        .limit(10);

      if (error) {
        console.error('Error searching churches:', error);
        return mockChurches;
      }

      // Transform Supabase response to match our Church type
      return data.map(church => ({
        id: church.id,
        name: church.name,
        location: `${church.city || ''}, ${church.state || ''}`,
        city: church.city || undefined,
        state: church.state || undefined,
        country: church.country || undefined,
        denomination: church.denomination || undefined,
        acceptsCrypto: church.accepts_crypto || false,
        website: church.website || undefined,
        payment_methods: church.payment_methods || []
      }));
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      return mockChurches;
    }
  }
  
  // Fall back to mock data if Supabase is not connected
  const normalizedQuery = query.toLowerCase();
  
  return mockChurches.filter(church => 
    church.name.toLowerCase().includes(normalizedQuery) || 
    (church.location && church.location.toLowerCase().includes(normalizedQuery)) ||
    (church.denomination && church.denomination.toLowerCase().includes(normalizedQuery))
  );
};
