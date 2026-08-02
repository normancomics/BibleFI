/**
 * Live Church Search Service
 * Searches global_churches table with comprehensive real-time data
 */

import { supabaseApi } from "@/integrations/supabase/apiClient";
import { churchRelevanceScore } from "@/utils/churchSearch";

export interface LiveChurchSearchParams {
  query?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  denomination?: string;
  acceptsCrypto?: boolean;
  limit?: number;
}

export interface LiveChurchResult {
  id: string;
  name: string;
  denomination: string | null;
  address: string | null;
  city: string;
  state_province: string | null;
  country: string;
  postal_code: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  pastor_name: string | null;
  accepts_crypto: boolean;
  accepts_fiat: boolean;
  accepts_cards: boolean;
  crypto_address: string | null;
  crypto_networks: string[] | null;
  verified: boolean;
  rating: number | null;
  review_count: number | null;
}

export class LiveChurchSearchService {
  /**
   * Search churches with comprehensive filters
   */
  static async searchChurches(params: LiveChurchSearchParams): Promise<LiveChurchResult[]> {
    try {
      let query = supabaseApi
        .from('public_church_directory')
        .select('*');

      // Text search across multiple fields
      if (params.query) {
        const searchTerm = params.query.trim();
        query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,denomination.ilike.%${searchTerm}%,state_province.ilike.%${searchTerm}%`);
      }

      // City filter
      if (params.city) {
        query = query.ilike('city', `%${params.city}%`);
      }

      // State filter
      if (params.state) {
        query = query.ilike('state_province', `%${params.state}%`);
      }

      // Zip code filter
      if (params.zipCode) {
        query = query.ilike('postal_code', `%${params.zipCode}%`);
      }

      // Country filter
      if (params.country) {
        query = query.eq('country', params.country);
      }

      // Denomination filter
      if (params.denomination) {
        query = query.ilike('denomination', `%${params.denomination}%`);
      }

      // Crypto acceptance filter
      if (params.acceptsCrypto !== undefined) {
        query = query.eq('accepts_crypto', params.acceptsCrypto);
      }

      // Order by verification status and rating
      query = query
        .order('verified', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(params.limit || 50);

      const { data, error } = await query;

      if (error) {
        console.error('Error searching churches:', error);
        throw error;
      }

      // When a text query is present, re-sort client-side by relevance so that
      // names/locations that start with the query appear before those that merely
      // contain it.  Verified status and rating are used as secondary tiebreakers.
      let results = data || [];
      if (params.query?.trim()) {
        const q = params.query.trim();
        results = [...results].sort((a, b) => {
          const scoreA = churchRelevanceScore(a.name, a.city, a.state_province, a.country, q);
          const scoreB = churchRelevanceScore(b.name, b.city, b.state_province, b.country, q);
          if (scoreB !== scoreA) return scoreB - scoreA;
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
          if (ratingDiff !== 0) return ratingDiff;
          const nameComp = a.name.localeCompare(b.name);
          if (nameComp !== 0) return nameComp;
          return (a.city || '').localeCompare(b.city || '');
        });
      }

      return results;
    } catch (error) {
      console.error('Live church search error:', error);
      return [];
    }
  }

  /**
   * Search by exact location (Mount Dora, Florida example)
   */
  static async searchByLocation(city: string, state: string): Promise<LiveChurchResult[]> {
    return this.searchChurches({
      city,
      state,
      limit: 100
    });
  }

  /**
   * Get crypto-accepting churches
   */
  static async getCryptoChurches(): Promise<LiveChurchResult[]> {
    return this.searchChurches({
      acceptsCrypto: true,
      limit: 100
    });
  }

  /**
   * Get verified churches
   */
  static async getVerifiedChurches(): Promise<LiveChurchResult[]> {
    try {
      const { data, error } = await supabaseApi
        .from('public_church_directory')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching verified churches:', error);
      return [];
    }
  }
}
