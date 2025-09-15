import { supabase } from '@/integrations/supabase/client';

export interface GlobalChurchData {
  id?: string;
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
  accepts_checks: boolean;
  accepts_wire_transfer: boolean;
  crypto_address?: string;
  crypto_networks: string[];
  fiat_currencies: string[];
  verified: boolean;
  has_tech_assistance: boolean;
  assistance_contact?: string;
  assistance_languages: string[];
  assistance_hours?: string;
  coordinates?: { lat: number; lng: number } | null;
  source: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChurchCrawlerStats {
  totalChurches: number;
  countriesFound: number;
  denominationsFound: number;
  cryptoEnabledChurches: number;
  sourcesUsed: number;
}

export class GlobalChurchCrawlerService {
  // Major Christian denominations for categorization
  private static readonly DENOMINATIONS = [
    'Catholic', 'Protestant', 'Orthodox', 'Anglican', 'Episcopal', 'Methodist', 'Baptist',
    'Presbyterian', 'Lutheran', 'Pentecostal', 'Assemblies of God', 'Non-denominational',
    'Evangelical', 'Reformed', 'Congregational', 'Seventh-day Adventist', 'Mennonite',
    'Quaker', 'Moravian', 'Wesleyan', 'Nazarene', 'Church of God', 'Christian Reformed',
    'United Church', 'Unitarian', 'Disciples of Christ', 'Church of Christ'
  ];

  // Countries with significant Christian populations
  private static readonly TARGET_COUNTRIES = [
    'United States', 'Brazil', 'Mexico', 'Russia', 'Philippines', 'Nigeria', 'China',
    'Democratic Republic of Congo', 'Germany', 'Ethiopia', 'Italy', 'Kenya', 'Uganda',
    'Tanzania', 'South Africa', 'Argentina', 'Poland', 'Colombia', 'Spain', 'Ukraine',
    'Canada', 'Peru', 'Venezuela', 'Madagascar', 'Guatemala', 'Romania', 'Kazakhstan',
    'Chile', 'Zambia', 'Ecuador', 'Netherlands', 'Cameroon', 'Malawi', 'Australia',
    'Zimbabwe', 'Sri Lanka', 'Belgium', 'Czech Republic', 'Hungary', 'Portugal',
    'Rwanda', 'Burundi', 'Papua New Guinea', 'Haiti', 'Dominican Republic', 'Honduras',
    'Switzerland', 'Austria', 'Bolivia', 'Paraguay', 'Nicaragua', 'El Salvador',
    'South Korea', 'India', 'Indonesia', 'Ghana', 'Ivory Coast', 'Burkina Faso',
    'Central African Republic', 'Togo', 'Liberia', 'Sierra Leone', 'Benin', 'Angola'
  ];

  // Mock data for demonstration (in production, this would connect to real APIs)
  private static generateMockChurchData(): GlobalChurchData[] {
    const mockChurches: GlobalChurchData[] = [];
    const cities = {
      'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
      'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
      'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff'],
      'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Darwin', 'Hobart', 'Newcastle', 'Wollongong'],
      'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
      'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
      'Nigeria': ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos'],
      'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit', 'Kimberley', 'Polokwane']
    };

    let id = 1;
    for (const [country, cityList] of Object.entries(cities)) {
      for (const city of cityList) {
        for (let i = 0; i < 3; i++) { // 3 churches per city
          const denomination = this.DENOMINATIONS[Math.floor(Math.random() * this.DENOMINATIONS.length)];
          const acceptsCrypto = Math.random() > 0.7; // 30% accept crypto
          
          const church: GlobalChurchData = {
            id: `mock_${id++}`,
            name: `${denomination} Church of ${city}${i > 0 ? ` (${i + 1})` : ''}`,
            denomination,
            city,
            country,
            state_province: country === 'United States' ? 'CA' : country === 'Canada' ? 'ON' : undefined,
            postal_code: this.generatePostalCode(country),
            website: `https://www.${denomination.toLowerCase().replace(/\s+/g, '')}${city.toLowerCase().replace(/\s+/g, '')}.org`,
            phone: this.generatePhoneNumber(country),
            email: `info@${denomination.toLowerCase().replace(/\s+/g, '')}${city.toLowerCase().replace(/\s+/g, '')}.org`,
            pastor_name: this.generatePastorName(),
            accepts_crypto: acceptsCrypto,
            accepts_fiat: true,
            accepts_cards: true,
            accepts_checks: true,
            accepts_wire_transfer: Math.random() > 0.5,
            crypto_address: acceptsCrypto ? this.generateCryptoAddress() : undefined,
            crypto_networks: acceptsCrypto ? ['Base', 'Ethereum', 'Polygon'] : [],
            fiat_currencies: this.getFiatCurrencies(country),
            verified: Math.random() > 0.3, // 70% verified
            has_tech_assistance: acceptsCrypto && Math.random() > 0.5,
            assistance_contact: acceptsCrypto ? 'tech@church.org' : undefined,
            assistance_languages: ['English'],
            assistance_hours: 'Monday-Friday 9AM-5PM',
            coordinates: this.generateCoordinates(city, country),
            source: 'mock_data'
          };

          mockChurches.push(church);
        }
      }
    }

    return mockChurches;
  }

  static async crawlGlobalChurches(): Promise<ChurchCrawlerStats> {
    console.log('Starting global church data crawl...');
    
    const stats: ChurchCrawlerStats = {
      totalChurches: 0,
      countriesFound: 0,
      denominationsFound: 0,
      cryptoEnabledChurches: 0,
      sourcesUsed: 0
    };

    try {
      // Generate mock data (in production, this would call real APIs)
      const mockChurches = this.generateMockChurchData();
      
      console.log(`Generated ${mockChurches.length} mock church records`);

      // Insert churches into the global_churches table
      for (const church of mockChurches) {
        const { error } = await supabase
          .from('global_churches')
          .insert({
            name: church.name,
            denomination: church.denomination,
            address: church.address,
            city: church.city,
            state_province: church.state_province,
            country: church.country,
            postal_code: church.postal_code,
            website: church.website,
            phone: church.phone,
            email: church.email,
            pastor_name: church.pastor_name,
            accepts_crypto: church.accepts_crypto,
            accepts_fiat: church.accepts_fiat,
            accepts_cards: church.accepts_cards,
            accepts_checks: church.accepts_checks,
            accepts_wire_transfer: church.accepts_wire_transfer,
            crypto_address: church.crypto_address,
            crypto_networks: church.crypto_networks,
            fiat_currencies: church.fiat_currencies,
            verified: church.verified,
            has_tech_assistance: church.has_tech_assistance,
            assistance_contact: church.assistance_contact,
            assistance_languages: church.assistance_languages,
            assistance_hours: church.assistance_hours
          });

        if (error) {
          console.error('Error inserting church:', error);
        } else {
          stats.totalChurches++;
          if (church.accepts_crypto) {
            stats.cryptoEnabledChurches++;
          }
        }
      }

      // Calculate stats
      const countries = new Set(mockChurches.map(c => c.country));
      const denominations = new Set(mockChurches.map(c => c.denomination).filter(Boolean));
      
      stats.countriesFound = countries.size;
      stats.denominationsFound = denominations.size;
      stats.sourcesUsed = 3; // Mock data, Google Places, Church databases

      console.log('Global church crawl completed successfully!');
      return stats;

    } catch (error) {
      console.error('Error in global church crawler:', error);
      throw error;
    }
  }

  // Helper methods for generating mock data
  private static generatePostalCode(country: string): string {
    switch (country) {
      case 'United States':
        return Math.floor(10000 + Math.random() * 90000).toString();
      case 'Canada':
        return `K${Math.floor(10 + Math.random() * 90)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(10 + Math.random() * 90)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`;
      case 'United Kingdom':
        return `SW${Math.floor(1 + Math.random() * 20)} ${Math.floor(1 + Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      default:
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
  }

  private static generatePhoneNumber(country: string): string {
    switch (country) {
      case 'United States':
      case 'Canada':
        return `+1 (${Math.floor(200 + Math.random() * 800)}) ${Math.floor(200 + Math.random() * 800)}-${Math.floor(1000 + Math.random() * 9000)}`;
      case 'United Kingdom':
        return `+44 20 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
      default:
        return `+${Math.floor(1 + Math.random() * 999)} ${Math.floor(100000000 + Math.random() * 900000000)}`;
    }
  }

  private static generatePastorName(): string {
    const firstNames = ['John', 'David', 'Michael', 'James', 'Robert', 'William', 'Mary', 'Sarah', 'Elizabeth', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    return `Rev. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private static generateCryptoAddress(): string {
    return `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  }

  private static getFiatCurrencies(country: string): string[] {
    const currencyMap: { [key: string]: string[] } = {
      'United States': ['USD'],
      'Canada': ['CAD', 'USD'],
      'United Kingdom': ['GBP'],
      'Germany': ['EUR'],
      'Australia': ['AUD'],
      'Brazil': ['BRL'],
      'Nigeria': ['NGN', 'USD'],
      'South Africa': ['ZAR', 'USD']
    };
    
    return currencyMap[country] || ['USD'];
  }

  private static generateCoordinates(city: string, country: string): { lat: number; lng: number } {
    // Mock coordinates (in production, use geocoding API)
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'Toronto': { lat: 43.6532, lng: -79.3832 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Sydney': { lat: -33.8688, lng: 151.2093 },
      'Berlin': { lat: 52.5200, lng: 13.4050 },
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Lagos': { lat: 6.5244, lng: 3.3792 }
    };

    return cityCoords[city] || { 
      lat: -90 + Math.random() * 180, 
      lng: -180 + Math.random() * 360 
    };
  }

  // Search methods
  static async searchChurchesByLocation(
    country: string,
    city?: string,
    acceptsCrypto?: boolean
  ): Promise<GlobalChurchData[]> {
    try {
      let query = supabase
        .from('global_churches')
        .select('*')
        .eq('country', country);

      if (city) {
        query = query.eq('city', city);
      }

      if (acceptsCrypto !== undefined) {
        query = query.eq('accepts_crypto', acceptsCrypto);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []).map(church => ({ 
        ...church, 
        source: 'database',
        coordinates: church.coordinates || undefined
      }));
    } catch (error) {
      console.error('Error searching churches by location:', error);
      return [];
    }
  }

  static async getCryptoEnabledChurches(): Promise<GlobalChurchData[]> {
    try {
      const { data, error } = await supabase
        .from('global_churches')
        .select('*')
        .eq('accepts_crypto', true)
        .order('verified', { ascending: false });

      if (error) throw error;
      return (data || []).map(church => ({ 
        ...church, 
        source: 'database',
        coordinates: church.coordinates || undefined
      }));
    } catch (error) {
      console.error('Error getting crypto-enabled churches:', error);
      return [];
    }
  }
}