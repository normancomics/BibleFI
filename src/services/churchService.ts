
// This service connects to your Supabase database
// It will access the churches table you've defined in your SQL

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// These environment variables will need to be set when connected to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type Church = {
  id: string;
  name: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  denomination?: string;
  acceptsCrypto: boolean;
  website?: string;
  email?: string;
  phone?: string;
  payment_methods?: string[];
};

// Mock data - used until Supabase is connected
const mockChurches: Church[] = [
  { 
    id: "1", 
    name: "First Community Church", 
    location: "Columbus, OH", 
    city: "Columbus",
    state: "OH",
    country: "USA",
    denomination: "Non-denominational", 
    acceptsCrypto: true,
    website: "https://firstcommunity.org",
    payment_methods: ["Credit Card", "ACH", "Bitcoin", "Ethereum"]
  },
  { 
    id: "2", 
    name: "Grace Fellowship", 
    location: "Dallas, TX", 
    city: "Dallas",
    state: "TX",
    country: "USA",
    denomination: "Baptist", 
    acceptsCrypto: false,
    website: "https://gracefellowship.org",
    payment_methods: ["Cash", "Check", "Credit Card"]
  },
  { 
    id: "3", 
    name: "Hope City Church", 
    location: "Portland, OR", 
    city: "Portland",
    state: "OR",
    country: "USA",
    denomination: "Lutheran", 
    acceptsCrypto: true,
    website: "https://hopecity.org",
    payment_methods: ["Credit Card", "ACH", "Bitcoin"]
  },
];

export const isSupabaseConnected = (): boolean => {
  return supabaseUrl !== '' && supabaseKey !== '';
};

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

// Helper function to extract city and state from a location string like "City, State"
function extractLocationParts(location: string): { city: string, state: string } {
  const parts = location.split(',').map(part => part.trim());
  return {
    city: parts[0] || '',
    state: parts[1] || ''
  };
}
