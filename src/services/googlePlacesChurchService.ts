import { supabase } from "@/integrations/supabase/client";

export interface GooglePlacesChurch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  source: string;
  verified: boolean;
}

export interface ChurchSearchParams {
  query?: string;
  location?: string;
  radius?: number;
}

export interface ChurchSearchResponse {
  churches: GooglePlacesChurch[];
  nextPageToken?: string;
  error?: string;
}

class GooglePlacesChurchService {
  async searchChurches(params: ChurchSearchParams): Promise<ChurchSearchResponse> {
    try {
      console.log('Searching churches with params:', params);
      
      const { data, error } = await supabase.functions.invoke('church-search', {
        body: params,
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message);
      }

      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      console.log('Search results:', data.churches?.length, 'churches found');
      return data as ChurchSearchResponse;
    } catch (error) {
      console.error('Error searching churches:', error);
      throw error;
    }
  }

  async searchByLocation(city: string, state: string): Promise<GooglePlacesChurch[]> {
    const location = `${city}, ${state}`;
    const result = await this.searchChurches({ location });
    return result.churches;
  }

  async searchByQuery(query: string, location?: string): Promise<GooglePlacesChurch[]> {
    const result = await this.searchChurches({ query, location });
    return result.churches;
  }

  async getNearbyChurches(latitude: number, longitude: number, radius: number = 10000): Promise<GooglePlacesChurch[]> {
    const location = `${latitude},${longitude}`;
    const result = await this.searchChurches({ location, radius });
    return result.churches;
  }
}

export const googlePlacesChurchService = new GooglePlacesChurchService();
