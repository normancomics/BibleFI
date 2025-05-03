
import { supabase } from '@/integrations/supabase/client';
import { Church } from '@/types/church';
import { mockChurches } from '@/data/mockChurches';
import { isSupabaseConnected } from '@/utils/supabaseConnector';

/**
 * Get a church by its ID
 */
export const getChurchById = async (id: string): Promise<Church | undefined> => {
  // If Supabase is connected, use it
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name, city, state, country, denomination, website, accepts_crypto, payment_methods')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting church by ID:', error);
        return mockChurches.find(church => church.id === id);
      }

      // Transform Supabase response to match our Church type
      return {
        id: data.id,
        name: data.name,
        location: `${data.city || ''}, ${data.state || ''}`,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        denomination: data.denomination || undefined,
        acceptsCrypto: data.accepts_crypto || false,
        website: data.website || undefined,
        payment_methods: data.payment_methods || []
      };
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      return mockChurches.find(church => church.id === id);
    }
  }

  return mockChurches.find(church => church.id === id);
};
