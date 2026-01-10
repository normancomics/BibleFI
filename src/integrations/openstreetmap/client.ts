/**
 * OpenStreetMap Integration for Global Church Search
 * Uses Overpass API (free, unlimited) for searching places of worship globally
 * 
 * Coverage: North America, South America, Europe, Asia, Africa, Australia
 */

export interface OSMChurchResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  denomination?: string;
  religion?: string;
  website?: string;
  phone?: string;
  source: 'openstreetmap';
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    denomination?: string;
    religion?: string;
    website?: string;
    phone?: string;
    'addr:city'?: string;
    'addr:state'?: string;
    'addr:country'?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:postcode'?: string;
  };
}

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

/**
 * OpenStreetMap Client for global church search
 */
export class OpenStreetMapClient {
  private cache: Map<string, { data: OSMChurchResult[]; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Geocode a location string to coordinates
   */
  async geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = `${NOMINATIM_API_URL}/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Bible.fi/1.0 (Biblical DeFi Tithing App)' }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error('Geocode error:', error);
      return null;
    }
  }

  /**
   * Search for churches globally using Overpass API
   * @param query Search term (church name or denomination)
   * @param location Location string (city, state, country)
   * @param radius Search radius in meters (default 50km)
   */
  async searchChurches(
    query?: string,
    location?: string,
    radius: number = 50000
  ): Promise<OSMChurchResult[]> {
    const cacheKey = `${query}-${location}-${radius}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      let overpassQuery: string;

      if (location) {
        // Search by location with radius
        const coords = await this.geocodeLocation(location);
        if (coords) {
          overpassQuery = this.buildRadiusQuery(coords.lat, coords.lon, radius, query);
        } else {
          // Fallback to area search by name
          overpassQuery = this.buildAreaQuery(location, query);
        }
      } else if (query) {
        // Global search by name only (limited results)
        overpassQuery = this.buildGlobalNameQuery(query);
      } else {
        // Return sample of major churches
        overpassQuery = this.buildFeaturedChurchesQuery();
      }

      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        console.error('Overpass API error:', response.status);
        return [];
      }

      const data = await response.json();
      const results = this.parseOverpassResults(data.elements || []);
      
      // Filter by query if provided
      const filteredResults = query 
        ? results.filter(r => 
            r.name?.toLowerCase().includes(query.toLowerCase()) ||
            r.denomination?.toLowerCase().includes(query.toLowerCase())
          )
        : results;

      this.cache.set(cacheKey, { data: filteredResults, timestamp: Date.now() });
      return filteredResults;
    } catch (error) {
      console.error('OpenStreetMap search error:', error);
      return [];
    }
  }

  /**
   * Search by continent for bulk data
   */
  async searchByContinent(continent: string, limit: number = 100): Promise<OSMChurchResult[]> {
    const continentBounds: Record<string, string> = {
      'north_america': '14.5,-170,72,-52',
      'south_america': '-56,-82,13,-34',
      'europe': '35,-25,72,65',
      'asia': '-10,25,77,180',
      'africa': '-35,-20,37,52',
      'australia': '-48,110,-10,180'
    };

    const bbox = continentBounds[continent.toLowerCase().replace(' ', '_')];
    if (!bbox) return [];

    const query = `
      [out:json][timeout:60];
      (
        node["amenity"="place_of_worship"]["religion"="christian"](${bbox});
        way["amenity"="place_of_worship"]["religion"="christian"](${bbox});
      );
      out center ${limit};
    `;

    try {
      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) return [];
      
      const data = await response.json();
      return this.parseOverpassResults(data.elements || []);
    } catch {
      return [];
    }
  }

  /**
   * Build Overpass query for radius search around coordinates
   */
  private buildRadiusQuery(lat: number, lon: number, radius: number, nameFilter?: string): string {
    const nameClause = nameFilter 
      ? `["name"~"${this.escapeOverpassString(nameFilter)}",i]` 
      : '';
    
    return `
      [out:json][timeout:30];
      (
        node["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(around:${radius},${lat},${lon});
        way["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(around:${radius},${lat},${lon});
        node["building"="church"]${nameClause}(around:${radius},${lat},${lon});
        way["building"="church"]${nameClause}(around:${radius},${lat},${lon});
      );
      out center 100;
    `;
  }

  /**
   * Build Overpass query for area search by location name
   */
  private buildAreaQuery(location: string, nameFilter?: string): string {
    const nameClause = nameFilter 
      ? `["name"~"${this.escapeOverpassString(nameFilter)}",i]` 
      : '';
    
    return `
      [out:json][timeout:30];
      area["name"~"${this.escapeOverpassString(location)}",i]->.searchArea;
      (
        node["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(area.searchArea);
        way["amenity"="place_of_worship"]["religion"="christian"]${nameClause}(area.searchArea);
        node["building"="church"]${nameClause}(area.searchArea);
        way["building"="church"]${nameClause}(area.searchArea);
      );
      out center 100;
    `;
  }

  /**
   * Build Overpass query for global name search
   */
  private buildGlobalNameQuery(name: string): string {
    return `
      [out:json][timeout:45];
      (
        node["amenity"="place_of_worship"]["religion"="christian"]["name"~"${this.escapeOverpassString(name)}",i];
        way["amenity"="place_of_worship"]["religion"="christian"]["name"~"${this.escapeOverpassString(name)}",i];
      );
      out center 50;
    `;
  }

  /**
   * Build query for featured/major churches
   */
  private buildFeaturedChurchesQuery(): string {
    return `
      [out:json][timeout:30];
      (
        node["amenity"="place_of_worship"]["religion"="christian"]["denomination"](47.5,-122.5,47.7,-122.2);
        way["amenity"="place_of_worship"]["religion"="christian"]["denomination"](47.5,-122.5,47.7,-122.2);
      );
      out center 25;
    `;
  }

  /**
   * Parse Overpass API response into church results
   */
  private parseOverpassResults(elements: OverpassElement[]): OSMChurchResult[] {
    return elements
      .filter(el => el.tags?.name) // Must have a name
      .map(el => {
        const lat = el.lat || el.center?.lat || 0;
        const lon = el.lon || el.center?.lon || 0;
        const tags = el.tags || {};

        const address = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:city'],
          tags['addr:state'],
          tags['addr:postcode']
        ].filter(Boolean).join(', ');

        return {
          id: `osm-${el.type}-${el.id}`,
          name: tags.name || 'Unknown Church',
          lat,
          lon,
          address: address || undefined,
          city: tags['addr:city'],
          state: tags['addr:state'],
          country: tags['addr:country'],
          denomination: tags.denomination,
          religion: tags.religion || 'christian',
          website: tags.website,
          phone: tags.phone,
          source: 'openstreetmap' as const
        };
      });
  }

  /**
   * Escape special characters for Overpass regex
   */
  private escapeOverpassString(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Reverse geocode coordinates to get location details
   */
  async reverseGeocode(lat: number, lon: number): Promise<{ city?: string; state?: string; country?: string } | null> {
    try {
      const url = `${NOMINATIM_API_URL}/reverse?lat=${lat}&lon=${lon}&format=json`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Bible.fi/1.0 (Biblical DeFi Tithing App)' }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country
      };
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const osmClient = new OpenStreetMapClient();
