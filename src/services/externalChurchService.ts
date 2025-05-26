
import { Church } from "@/types/church";

interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  website?: string;
  formatted_phone_number?: string;
}

interface GooglePlacesResponse {
  results: GooglePlacesResult[];
  status: string;
}

export class ExternalChurchService {
  private static readonly CHURCH_KEYWORDS = [
    'church', 'cathedral', 'chapel', 'parish', 'congregation', 
    'ministry', 'fellowship', 'temple', 'synagogue', 'mosque'
  ];

  static async searchGooglePlaces(query: string, location?: string): Promise<Church[]> {
    // Since we can't use Google Places API directly (requires server-side key)
    // We'll use a mock implementation that simulates real church data
    console.log("Searching external sources for:", query);
    
    const mockChurches = this.generateMockChurchResults(query, location);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockChurches;
  }

  private static generateMockChurchResults(query: string, location?: string): Church[] {
    const normalizedQuery = query.toLowerCase();
    const churches: Church[] = [];
    
    // Generate realistic church results based on query
    const churchTypes = [
      'Baptist Church', 'Methodist Church', 'Catholic Church', 'Presbyterian Church',
      'Lutheran Church', 'Episcopal Church', 'Pentecostal Church', 'Community Church',
      'Non-denominational Church', 'Assembly of God', 'Church of Christ'
    ];
    
    const cities = location ? [location] : [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
      'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA'
    ];
    
    for (let i = 0; i < Math.min(8, Math.ceil(Math.random() * 12)); i++) {
      const churchType = churchTypes[Math.floor(Math.random() * churchTypes.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const streetName = ['Main St', 'Oak Ave', 'Church St', 'First Ave', 'Park Blvd'][Math.floor(Math.random() * 5)];
      const streetNumber = Math.floor(Math.random() * 9999) + 100;
      
      // Only include if query matches
      if (normalizedQuery.includes('church') || 
          churchType.toLowerCase().includes(normalizedQuery) ||
          normalizedQuery.length < 3) {
        
        churches.push({
          id: `ext_${Date.now()}_${i}`,
          name: `${query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ${churchType}`,
          location: city,
          city: city.split(',')[0],
          state: city.split(',')[1]?.trim() || 'CA',
          country: 'United States',
          denomination: churchType.replace(' Church', ''),
          address: `${streetNumber} ${streetName}`,
          acceptsCrypto: Math.random() > 0.7, // 30% chance of accepting crypto
          website: `https://www.${query.replace(/\s+/g, '').toLowerCase()}${churchType.replace(/\s+/g, '').toLowerCase()}.org`,
          payment_methods: this.generatePaymentMethods()
        });
      }
    }
    
    return churches;
  }
  
  private static generatePaymentMethods(): string[] {
    const allMethods = ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'paypal', 'venmo', 'zelle', 'crypto'];
    const numMethods = Math.floor(Math.random() * 4) + 2; // 2-5 methods
    const shuffled = allMethods.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numMethods);
  }

  static async getChurchDetails(churchId: string): Promise<Church | null> {
    // Mock detailed church information
    console.log("Fetching church details for:", churchId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return null; // Would implement full details fetch
  }
}
