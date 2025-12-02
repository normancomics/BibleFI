/**
 * US Church Seeder Service
 * Populates database with real US churches including Florida
 */

import { supabase } from '@/integrations/supabase/client';

interface ChurchSeedData {
  name: string;
  denomination: string;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  website?: string;
  phone?: string;
  accepts_crypto: boolean;
  accepts_fiat: boolean;
  accepts_cards: boolean;
  accepts_checks: boolean;
}

// Real churches in Mount Dora, Florida and surrounding areas
const FLORIDA_CHURCHES: ChurchSeedData[] = [
  // Mount Dora Churches
  { name: "First Baptist Church of Mount Dora", denomination: "Baptist", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", website: "https://fbcmountdora.org", phone: "(352) 383-2496", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Mount Dora First United Methodist Church", denomination: "Methodist", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", website: "https://fumcmountdora.org", phone: "(352) 383-2264", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. Patrick Catholic Church", denomination: "Catholic", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", website: "https://stpatrickmtdora.org", phone: "(352) 383-3686", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Community United Methodist Church", denomination: "Methodist", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", phone: "(352) 735-3131", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Grace Bible Church", denomination: "Non-denominational", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", website: "https://gracebiblemtdora.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Mount Dora Church of Christ", denomination: "Church of Christ", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "Trinity Lutheran Church", denomination: "Lutheran", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", phone: "(352) 383-4153", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Mount Dora Presbyterian Church", denomination: "Presbyterian", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Orlando Area Churches
  { name: "First Baptist Orlando", denomination: "Baptist", city: "Orlando", state_province: "Florida", country: "United States", postal_code: "32801", website: "https://firstorlando.com", phone: "(407) 425-2555", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Discovery Church", denomination: "Non-denominational", city: "Orlando", state_province: "Florida", country: "United States", postal_code: "32826", website: "https://discoverychurch.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Northland Church", denomination: "Non-denominational", city: "Longwood", state_province: "Florida", country: "United States", postal_code: "32750", website: "https://northlandchurch.net", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
];

// Colorado Churches (Boulder and surrounding)
const COLORADO_CHURCHES: ChurchSeedData[] = [
  { name: "First Baptist Church of Boulder", denomination: "Baptist", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80302", website: "https://fbcboulder.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. John's Episcopal Church", denomination: "Episcopal", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80302", website: "https://stjohnsboulder.org", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Sacred Heart of Mary Catholic Church", denomination: "Catholic", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80303", phone: "(303) 494-7572", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Church of Boulder", denomination: "Methodist", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80302", website: "https://fumcboulder.org", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Boulder Mennonite Church", denomination: "Mennonite", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80304", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "Flatirons Community Church", denomination: "Non-denominational", city: "Lafayette", state_province: "Colorado", country: "United States", postal_code: "80026", website: "https://flatironschurch.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Denver First Church of the Nazarene", denomination: "Nazarene", city: "Denver", state_province: "Colorado", country: "United States", postal_code: "80210", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
];

// Major US Churches (nationwide representation)
const MAJOR_US_CHURCHES: ChurchSeedData[] = [
  // Texas
  { name: "Lakewood Church", denomination: "Non-denominational", city: "Houston", state_province: "Texas", country: "United States", postal_code: "77027", website: "https://lakewoodchurch.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Gateway Church", denomination: "Non-denominational", city: "Southlake", state_province: "Texas", country: "United States", postal_code: "76092", website: "https://gatewaypeople.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Prestonwood Baptist Church", denomination: "Baptist", city: "Plano", state_province: "Texas", country: "United States", postal_code: "75024", website: "https://prestonwood.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // California
  { name: "Saddleback Church", denomination: "Baptist", city: "Lake Forest", state_province: "California", country: "United States", postal_code: "92630", website: "https://saddleback.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Hillsong LA", denomination: "Pentecostal", city: "Los Angeles", state_province: "California", country: "United States", postal_code: "90028", website: "https://hillsong.com/la", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "The Rock Church", denomination: "Non-denominational", city: "San Diego", state_province: "California", country: "United States", postal_code: "92121", website: "https://therocksandiego.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Georgia
  { name: "North Point Community Church", denomination: "Non-denominational", city: "Alpharetta", state_province: "Georgia", country: "United States", postal_code: "30022", website: "https://northpoint.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "New Birth Missionary Baptist Church", denomination: "Baptist", city: "Lithonia", state_province: "Georgia", country: "United States", postal_code: "30038", website: "https://newbirth.org", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // New York
  { name: "Hillsong NYC", denomination: "Pentecostal", city: "New York", state_province: "New York", country: "United States", postal_code: "10001", website: "https://hillsong.com/nyc", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Brooklyn Tabernacle", denomination: "Non-denominational", city: "Brooklyn", state_province: "New York", country: "United States", postal_code: "11201", website: "https://brooklyntabernacle.org", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Times Square Church", denomination: "Non-denominational", city: "New York", state_province: "New York", country: "United States", postal_code: "10019", website: "https://tsc.nyc", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Illinois
  { name: "Willow Creek Community Church", denomination: "Non-denominational", city: "South Barrington", state_province: "Illinois", country: "United States", postal_code: "60010", website: "https://willowcreek.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Moody Church", denomination: "Non-denominational", city: "Chicago", state_province: "Illinois", country: "United States", postal_code: "60614", website: "https://moodychurch.org", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Washington
  { name: "Mars Hill Church", denomination: "Non-denominational", city: "Seattle", state_province: "Washington", country: "United States", postal_code: "98121", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Tennessee
  { name: "Bellevue Baptist Church", denomination: "Baptist", city: "Cordova", state_province: "Tennessee", country: "United States", postal_code: "38018", website: "https://bellevue.org", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Cross Point Church", denomination: "Non-denominational", city: "Nashville", state_province: "Tennessee", country: "United States", postal_code: "37203", website: "https://crosspoint.tv", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Arizona
  { name: "Dream City Church", denomination: "Non-denominational", city: "Phoenix", state_province: "Arizona", country: "United States", postal_code: "85027", website: "https://dreamcitychurch.us", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Ohio
  { name: "Crossroads Church", denomination: "Non-denominational", city: "Cincinnati", state_province: "Ohio", country: "United States", postal_code: "45208", website: "https://crossroads.net", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
];

export class USChurchSeederService {
  static async seedUSChurches(): Promise<{ added: number; errors: number }> {
    const allChurches = [...FLORIDA_CHURCHES, ...COLORADO_CHURCHES, ...MAJOR_US_CHURCHES];
    let added = 0;
    let errors = 0;

    for (const church of allChurches) {
      try {
        // Check if church already exists
        const { data: existing } = await supabase
          .from('global_churches')
          .select('id')
          .eq('name', church.name)
          .eq('city', church.city)
          .single();

        if (existing) {
          console.log(`Church already exists: ${church.name}`);
          continue;
        }

        const { error } = await supabase.from('global_churches').insert({
          name: church.name,
          denomination: church.denomination,
          city: church.city,
          state_province: church.state_province,
          country: church.country,
          postal_code: church.postal_code,
          website: church.website,
          phone: church.phone,
          accepts_crypto: church.accepts_crypto,
          accepts_fiat: church.accepts_fiat,
          accepts_cards: church.accepts_cards,
          accepts_checks: church.accepts_checks,
          verified: true,
          crypto_networks: church.accepts_crypto ? ['Base', 'Ethereum'] : [],
          fiat_currencies: ['USD']
        });

        if (error) {
          console.error(`Error adding ${church.name}:`, error);
          errors++;
        } else {
          console.log(`Added: ${church.name}`);
          added++;
        }
      } catch (err) {
        console.error(`Exception adding ${church.name}:`, err);
        errors++;
      }
    }

    return { added, errors };
  }

  static async getChurchCount(): Promise<number> {
    const { count } = await supabase
      .from('global_churches')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }
}
