
import { supabase } from '@/integrations/supabase/client';
import { Church } from '@/types/church';
import { isSupabaseConnected } from '@/utils/supabaseConnector';
import { extractLocationParts } from '@/utils/locationUtils';

/**
 * Add a new church to the database
 */
export const addChurch = async (church: Omit<Church, "id">): Promise<Church> => {
  // If Supabase is connected, use it
  if (isSupabaseConnected()) {
    try {
      const { city, state } = extractLocationParts(church.location || '');
      
      // Prepare data for insertion
      const churchData = {
        name: church.name,
        city: church.city || city,
        state: church.state || state,
        country: church.country || 'USA',
        denomination: church.denomination,
        website: church.website,
        accepts_crypto: church.acceptsCrypto,
        payment_methods: church.payment_methods || ['Cash', 'Check']
      };

      const { data, error } = await supabase
        .from('churches')
        .insert(churchData)
        .select('id, name, city, state, country, denomination, website, accepts_crypto, payment_methods')
        .single();

      if (error) {
        console.error('Error adding church:', error);
        throw new Error('Error adding church to database');
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
      throw error;
    }
  }
  
  // Log that we would add this church
  console.log("Would add church to database:", church);
  
  // Return mock data with a generated ID
  const newChurch = {
    ...church,
    id: `new-${Date.now()}`
  };
  
  return newChurch;
};
