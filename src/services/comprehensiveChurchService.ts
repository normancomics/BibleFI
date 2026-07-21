import { supabaseApi } from '@/integrations/supabase/apiClient';
import { runDirectoryQuery, fetchDirectoryRowsViaRpc } from '@/services/churchDirectoryClient';

export interface Church {
  id: string;
  name: string;
  denomination?: string;
  address?: string;
  city: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  website?: string;
  phone?: string;
  email?: string;
  pastor_name?: string;
  accepts_crypto: boolean;
  accepts_fiat: boolean;
  accepts_cards: boolean;
  crypto_address?: string;
  crypto_networks?: string[];
  verified: boolean;
  rating: number;
  coordinates?: { lat: number; lng: number };
  created_at?: string;
  updated_at?: string;
}

export interface ChurchSearchResult {
  churches: Church[];
  total: number;
  searchMetadata: {
    query: string;
    location?: string;
    filters: Record<string, any>;
    executionTime: number;
  };
}

export class ComprehensiveChurchService {
  private static instance: ComprehensiveChurchService;

  public static getInstance(): ComprehensiveChurchService {
    if (!ComprehensiveChurchService.instance) {
      ComprehensiveChurchService.instance = new ComprehensiveChurchService();
    }
    return ComprehensiveChurchService.instance;
  }

  async searchChurches(params: {
    query?: string;
    city?: string;
    state?: string;
    country?: string;
    denomination?: string;
    acceptsCrypto?: boolean;
    verified?: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number; // in miles
    limit?: number;
    offset?: number;
  }): Promise<ChurchSearchResult> {
    const startTime = Date.now();

    try {
      const limit = params.limit || 50;
      const offset = params.offset || 0;

      const buildQuery = () => {
        let query = supabaseApi
          .from('public_church_directory')
          .select('*', { count: 'exact' });

        // Text search across multiple fields
        if (params.query) {
          const searchTerms = params.query.toLowerCase();
          query = query.or(`name.ilike.%${searchTerms}%,city.ilike.%${searchTerms}%,denomination.ilike.%${searchTerms}%`);
        }

        // Location filters
        if (params.city) {
          query = query.ilike('city', `%${params.city}%`);
        }
        if (params.state) {
          query = query.ilike('state_province', `%${params.state}%`);
        }
        if (params.country) {
          query = query.ilike('country', `%${params.country}%`);
        }

        // Feature filters
        if (params.denomination) {
          query = query.ilike('denomination', `%${params.denomination}%`);
        }
        if (params.acceptsCrypto !== undefined) {
          query = query.eq('accepts_crypto', params.acceptsCrypto);
        }
        if (params.verified !== undefined) {
          query = query.eq('verified', params.verified);
        }

        // Geographic proximity search
        if (params.latitude && params.longitude && params.radius) {
          // Using PostGIS for geographic search (approximate for now)
          const radiusInDegrees = params.radius / 69; // Rough conversion for US
          query = query.gte('coordinates', `(${params.latitude - radiusInDegrees}, ${params.longitude - radiusInDegrees})`)
                      .lte('coordinates', `(${params.latitude + radiusInDegrees}, ${params.longitude + radiusInDegrees})`);
        }

        // Pagination + order by relevance (verified first, then rating)
        return query
          .range(offset, offset + limit - 1)
          .order('verified', { ascending: false })
          .order('rating', { ascending: false })
          .order('name', { ascending: true });
      };

      // When the view path is broken, fall back to the SECURITY DEFINER RPC
      // and apply the basic filters client-side.
      const rpcFallback = async () => {
        const { data, error } = await fetchDirectoryRowsViaRpc<any>();
        if (error || !data) return { data: null, error: error ?? new Error('rpc returned no data') };
        const matches = (data as any[]).filter(church => {
          if (params.query) {
            const q = params.query.toLowerCase();
            const hit = [church.name, church.city, church.denomination]
              .some(v => typeof v === 'string' && v.toLowerCase().includes(q));
            if (!hit) return false;
          }
          if (params.city && !church.city?.toLowerCase().includes(params.city.toLowerCase())) return false;
          if (params.state && !church.state_province?.toLowerCase().includes(params.state.toLowerCase())) return false;
          if (params.country && !church.country?.toLowerCase().includes(params.country.toLowerCase())) return false;
          if (params.denomination && !church.denomination?.toLowerCase().includes(params.denomination.toLowerCase())) return false;
          if (params.acceptsCrypto !== undefined && church.accepts_crypto !== params.acceptsCrypto) return false;
          if (params.verified !== undefined && church.verified !== params.verified) return false;
          return true;
        });
        return { data: matches.slice(offset, offset + limit), error: null, count: matches.length };
      };

      const result = await runDirectoryQuery<any>({
        operation: 'search',
        cacheKey: `search:${JSON.stringify(params)}`,
        run: () => buildQuery(),
        fallback: rpcFallback,
        context: { service: 'comprehensiveChurchService' },
      });

      if (result.error && result.data.length === 0 && result.count === null) {
        throw new Error(`Church search failed: ${result.error.message}`);
      }

      const { data, count } = result;

      const churches: Church[] = (data || []).map(church => ({
        id: church.id,
        name: church.name,
        denomination: church.denomination,
        address: church.address,
        city: church.city,
        state_province: church.state_province,
        country: church.country,
        postal_code: church.postal_code,
        website: church.website,
        phone: church.masked_phone || null,
        email: church.masked_email || null,
        pastor_name: null,
        accepts_crypto: church.accepts_crypto,
        accepts_fiat: church.accepts_fiat,
        accepts_cards: church.accepts_cards,
        crypto_address: church.masked_crypto_address || null,
        crypto_networks: church.crypto_networks,
        verified: church.verified,
        rating: church.rating,
        coordinates: church.coordinates ? {
          lat: (church.coordinates as any).x,
          lng: (church.coordinates as any).y
        } : undefined,
        created_at: church.created_at,
        updated_at: church.updated_at
      }));

      return {
        churches,
        total: count || 0,
        searchMetadata: {
          query: params.query || '',
          location: [params.city, params.state, params.country].filter(Boolean).join(', '),
          filters: params,
          executionTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Error searching churches:', error);
      throw error;
    }
  }

  async searchSpecificChurches(churchNames: string[]): Promise<ChurchSearchResult> {
    const startTime = Date.now();
    
    try {
      const searchPromises = churchNames.map(name => 
        this.searchChurches({
          query: name,
          limit: 5
        })
      );

      const results = await Promise.all(searchPromises);
      const allChurches = results.flatMap(result => result.churches);
      
      // Remove duplicates based on name and city
      const uniqueChurches = allChurches.filter((church, index, array) => 
        array.findIndex(c => 
          c.name.toLowerCase() === church.name.toLowerCase() && 
          c.city.toLowerCase() === church.city.toLowerCase()
        ) === index
      );

      return {
        churches: uniqueChurches,
        total: uniqueChurches.length,
        searchMetadata: {
          query: churchNames.join(', '),
          filters: { specific_search: true },
          executionTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Error in specific church search:', error);
      throw error;
    }
  }

  async findChurchByNameAndLocation(name: string, city: string, state?: string): Promise<Church | null> {
    try {
      let query = supabaseApi
        .from('public_church_directory')
        .select('*')
        .ilike('name', `%${name}%`)
        .ilike('city', `%${city}%`);

      if (state) {
        query = query.ilike('state_province', `%${state}%`);
      }

      const { data, error } = await query.limit(1).single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        denomination: data.denomination,
        address: data.address,
        city: data.city,
        state_province: data.state_province,
        country: data.country,
        postal_code: data.postal_code,
        website: data.website,
        phone: data.masked_phone || null,
        email: data.masked_email || null,
        pastor_name: null,
        accepts_crypto: data.accepts_crypto,
        accepts_fiat: data.accepts_fiat,
        accepts_cards: data.accepts_cards,
        crypto_address: data.masked_crypto_address || null,
        crypto_networks: data.crypto_networks,
        verified: data.verified,
        rating: data.rating,
        coordinates: data.coordinates ? {
          lat: (data.coordinates as any).x,
          lng: (data.coordinates as any).y
        } : undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error finding specific church:', error);
      return null;
    }
  }

  async getCryptoEnabledChurches(limit: number = 100): Promise<Church[]> {
    try {
      const { data, error } = await supabaseApi
        .from('public_church_directory')
        .select('*')
        .eq('accepts_crypto', true)
        .order('verified', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get crypto-enabled churches: ${error.message}`);
      }

      return (data || []).map(church => ({
        id: church.id,
        name: church.name,
        denomination: church.denomination,
        address: church.address,
        city: church.city,
        state_province: church.state_province,
        country: church.country,
        postal_code: church.postal_code,
        website: church.website,
        phone: church.masked_phone || null,
        email: church.masked_email || null,
        pastor_name: null,
        accepts_crypto: church.accepts_crypto,
        accepts_fiat: church.accepts_fiat,
        accepts_cards: church.accepts_cards,
        crypto_address: church.masked_crypto_address || null,
        crypto_networks: church.crypto_networks,
        verified: church.verified,
        rating: church.rating,
        coordinates: church.coordinates ? {
          lat: (church.coordinates as any).x,
          lng: (church.coordinates as any).y
        } : undefined,
        created_at: church.created_at,
        updated_at: church.updated_at
      }));
    } catch (error) {
      console.error('Error getting crypto-enabled churches:', error);
      return [];
    }
  }

  async addChurch(churchData: Omit<Church, 'id' | 'created_at' | 'updated_at'>): Promise<Church> {
    try {
      const { data, error } = await supabaseApi
        .from('global_churches')
        .insert({
          name: churchData.name,
          denomination: churchData.denomination,
          address: churchData.address,
          city: churchData.city,
          state_province: churchData.state_province,
          country: churchData.country,
          postal_code: churchData.postal_code,
          website: churchData.website,
          phone: churchData.phone,
          email: churchData.email,
          pastor_name: churchData.pastor_name,
          accepts_crypto: churchData.accepts_crypto,
          accepts_fiat: churchData.accepts_fiat,
          accepts_cards: churchData.accepts_cards,
          crypto_address: churchData.crypto_address,
          crypto_networks: churchData.crypto_networks,
          verified: false, // New churches start unverified
          rating: 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add church: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        denomination: data.denomination,
        address: data.address,
        city: data.city,
        state_province: data.state_province,
        country: data.country,
        postal_code: data.postal_code,
        website: data.website,
        phone: data.phone,
        email: data.email,
        pastor_name: data.pastor_name,
        accepts_crypto: data.accepts_crypto,
        accepts_fiat: data.accepts_fiat,
        accepts_cards: data.accepts_cards,
        crypto_address: data.crypto_address,
        crypto_networks: data.crypto_networks,
        verified: data.verified,
        rating: data.rating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error adding church:', error);
      throw error;
    }
  }

  // Predefined searches for the specific churches mentioned
  async getPopularChurches(): Promise<{
    fathersHouseLeesburg: Church | null;
    cityOnTheHillBoulder: Church | null;
    theCrossMountDora: Church | null;
  }> {
    const [fathersHouse, cityOnTheHill, theCross] = await Promise.all([
      this.findChurchByNameAndLocation("The Father's House", "Leesburg", "Florida"),
      this.findChurchByNameAndLocation("City on the Hill", "Boulder", "Colorado"),
      this.findChurchByNameAndLocation("The Cross", "Mount Dora", "Florida")
    ]);

    return {
      fathersHouseLeesburg: fathersHouse,
      cityOnTheHillBoulder: cityOnTheHill,
      theCrossMountDora: theCross
    };
  }
}

export const comprehensiveChurchService = ComprehensiveChurchService.getInstance();