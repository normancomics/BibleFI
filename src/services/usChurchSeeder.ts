/**
 * Comprehensive US Church Seeder Service
 * Populates database with churches from ALL US areas including:
 * - Major cities, suburbs, and rural communities
 * - All 50 states coverage
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

// ============= FLORIDA - Cities, Suburbs, Rural =============
const FLORIDA_CHURCHES: ChurchSeedData[] = [
  // Mount Dora (Small City)
  { name: "First Baptist Church of Mount Dora", denomination: "Baptist", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", website: "https://fbcmountdora.org", phone: "(352) 383-2496", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Mount Dora First United Methodist Church", denomination: "Methodist", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", website: "https://fumcmountdora.org", phone: "(352) 383-2264", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. Patrick Catholic Church", denomination: "Catholic", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", website: "https://stpatrickmtdora.org", phone: "(352) 383-3686", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Grace Bible Church Mount Dora", denomination: "Non-denominational", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Trinity Lutheran Church Mount Dora", denomination: "Lutheran", city: "Mount Dora", state_province: "Florida", country: "United States", postal_code: "32757", phone: "(352) 383-4153", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Eustis (Rural/Small Town near Mount Dora)
  { name: "First Baptist Church of Eustis", denomination: "Baptist", city: "Eustis", state_province: "Florida", country: "United States", postal_code: "32726", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Eustis First United Methodist Church", denomination: "Methodist", city: "Eustis", state_province: "Florida", country: "United States", postal_code: "32726", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. Mary of the Lakes Catholic Church", denomination: "Catholic", city: "Eustis", state_province: "Florida", country: "United States", postal_code: "32726", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Tavares (Small Lake County Town)
  { name: "First Baptist Church of Tavares", denomination: "Baptist", city: "Tavares", state_province: "Florida", country: "United States", postal_code: "32778", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Tavares First United Methodist", denomination: "Methodist", city: "Tavares", state_province: "Florida", country: "United States", postal_code: "32778", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Umatilla (Rural)
  { name: "First Baptist Church Umatilla", denomination: "Baptist", city: "Umatilla", state_province: "Florida", country: "United States", postal_code: "32784", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "Umatilla United Methodist Church", denomination: "Methodist", city: "Umatilla", state_province: "Florida", country: "United States", postal_code: "32784", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Apopka (Suburb of Orlando)
  { name: "First Baptist Church of Apopka", denomination: "Baptist", city: "Apopka", state_province: "Florida", country: "United States", postal_code: "32703", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. Francis of Assisi Catholic Church Apopka", denomination: "Catholic", city: "Apopka", state_province: "Florida", country: "United States", postal_code: "32712", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Clermont (Suburb/Growing City)
  { name: "First Baptist Church of Clermont", denomination: "Baptist", city: "Clermont", state_province: "Florida", country: "United States", postal_code: "34711", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Real Life Christian Church Clermont", denomination: "Non-denominational", city: "Clermont", state_province: "Florida", country: "United States", postal_code: "34711", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Leesburg
  { name: "First Baptist Church of Leesburg", denomination: "Baptist", city: "Leesburg", state_province: "Florida", country: "United States", postal_code: "34748", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Morrison United Methodist Church", denomination: "Methodist", city: "Leesburg", state_province: "Florida", country: "United States", postal_code: "34748", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Orlando (Major City)
  { name: "First Baptist Orlando", denomination: "Baptist", city: "Orlando", state_province: "Florida", country: "United States", postal_code: "32801", website: "https://firstorlando.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Discovery Church Orlando", denomination: "Non-denominational", city: "Orlando", state_province: "Florida", country: "United States", postal_code: "32826", website: "https://discoverychurch.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. James Cathedral Orlando", denomination: "Catholic", city: "Orlando", state_province: "Florida", country: "United States", postal_code: "32801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Winter Garden (Suburb)
  { name: "First Baptist Church of Winter Garden", denomination: "Baptist", city: "Winter Garden", state_province: "Florida", country: "United States", postal_code: "34787", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Ocoee (Suburb)
  { name: "First Baptist Church of Ocoee", denomination: "Baptist", city: "Ocoee", state_province: "Florida", country: "United States", postal_code: "34761", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // The Villages (Retirement Community)
  { name: "New Covenant United Methodist The Villages", denomination: "Methodist", city: "The Villages", state_province: "Florida", country: "United States", postal_code: "32162", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. Timothy Catholic Church The Villages", denomination: "Catholic", city: "The Villages", state_province: "Florida", country: "United States", postal_code: "32159", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Ocala (Small City/Rural Area)
  { name: "First Baptist Church of Ocala", denomination: "Baptist", city: "Ocala", state_province: "Florida", country: "United States", postal_code: "34470", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Blessed Trinity Catholic Church Ocala", denomination: "Catholic", city: "Ocala", state_province: "Florida", country: "United States", postal_code: "34480", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Gainesville
  { name: "First Baptist Church Gainesville", denomination: "Baptist", city: "Gainesville", state_province: "Florida", country: "United States", postal_code: "32601", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Trinity United Methodist Gainesville", denomination: "Methodist", city: "Gainesville", state_province: "Florida", country: "United States", postal_code: "32607", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Jacksonville
  { name: "First Baptist Church Jacksonville", denomination: "Baptist", city: "Jacksonville", state_province: "Florida", country: "United States", postal_code: "32202", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Celebration Church Jacksonville", denomination: "Non-denominational", city: "Jacksonville", state_province: "Florida", country: "United States", postal_code: "32256", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Tampa
  { name: "First Baptist Church of Tampa", denomination: "Baptist", city: "Tampa", state_province: "Florida", country: "United States", postal_code: "33602", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Idlewild Baptist Church", denomination: "Baptist", city: "Lutz", state_province: "Florida", country: "United States", postal_code: "33549", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Miami
  { name: "Trinity Church Miami", denomination: "Non-denominational", city: "Miami", state_province: "Florida", country: "United States", postal_code: "33137", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Calvary Chapel Fort Lauderdale", denomination: "Calvary Chapel", city: "Fort Lauderdale", state_province: "Florida", country: "United States", postal_code: "33309", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Rural Panhandle
  { name: "First Baptist Church Crestview", denomination: "Baptist", city: "Crestview", state_province: "Florida", country: "United States", postal_code: "32536", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Marianna", denomination: "Baptist", city: "Marianna", state_province: "Florida", country: "United States", postal_code: "32446", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First United Methodist Defuniak Springs", denomination: "Methodist", city: "Defuniak Springs", state_province: "Florida", country: "United States", postal_code: "32435", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
];

// ============= COLORADO - Cities, Suburbs, Rural =============
const COLORADO_CHURCHES: ChurchSeedData[] = [
  // Boulder
  { name: "First Baptist Church of Boulder", denomination: "Baptist", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80302", website: "https://fbcboulder.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. John's Episcopal Church Boulder", denomination: "Episcopal", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80302", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Sacred Heart of Mary Catholic Church", denomination: "Catholic", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80303", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Church Boulder", denomination: "Methodist", city: "Boulder", state_province: "Colorado", country: "United States", postal_code: "80302", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Lafayette (Suburb)
  { name: "Flatirons Community Church", denomination: "Non-denominational", city: "Lafayette", state_province: "Colorado", country: "United States", postal_code: "80026", website: "https://flatironschurch.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Lafayette", denomination: "Baptist", city: "Lafayette", state_province: "Colorado", country: "United States", postal_code: "80026", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Louisville (Suburb)
  { name: "Louisville Community Church", denomination: "Non-denominational", city: "Louisville", state_province: "Colorado", country: "United States", postal_code: "80027", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Longmont
  { name: "First Baptist Church Longmont", denomination: "Baptist", city: "Longmont", state_province: "Colorado", country: "United States", postal_code: "80501", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "LifeBridge Christian Church", denomination: "Christian Church", city: "Longmont", state_province: "Colorado", country: "United States", postal_code: "80501", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Denver Metro
  { name: "Denver First Church of the Nazarene", denomination: "Nazarene", city: "Denver", state_province: "Colorado", country: "United States", postal_code: "80210", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Park Hill United Methodist", denomination: "Methodist", city: "Denver", state_province: "Colorado", country: "United States", postal_code: "80207", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Cathedral Basilica of the Immaculate Conception", denomination: "Catholic", city: "Denver", state_province: "Colorado", country: "United States", postal_code: "80203", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Aurora (Suburb)
  { name: "First Baptist Church Aurora", denomination: "Baptist", city: "Aurora", state_province: "Colorado", country: "United States", postal_code: "80012", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Mission Hills Church Aurora", denomination: "Non-denominational", city: "Aurora", state_province: "Colorado", country: "United States", postal_code: "80015", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Lakewood (Suburb)
  { name: "First Baptist Church Lakewood", denomination: "Baptist", city: "Lakewood", state_province: "Colorado", country: "United States", postal_code: "80226", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Colorado Springs
  { name: "New Life Church", denomination: "Non-denominational", city: "Colorado Springs", state_province: "Colorado", country: "United States", postal_code: "80920", website: "https://newlifechurch.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Presbyterian Church Colorado Springs", denomination: "Presbyterian", city: "Colorado Springs", state_province: "Colorado", country: "United States", postal_code: "80903", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Fort Collins
  { name: "First Baptist Church Fort Collins", denomination: "Baptist", city: "Fort Collins", state_province: "Colorado", country: "United States", postal_code: "80524", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Timberline Church", denomination: "Non-denominational", city: "Fort Collins", state_province: "Colorado", country: "United States", postal_code: "80525", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Rural Mountain Towns
  { name: "Breckenridge Community Church", denomination: "Non-denominational", city: "Breckenridge", state_province: "Colorado", country: "United States", postal_code: "80424", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Vail Valley Chapel", denomination: "Non-denominational", city: "Vail", state_province: "Colorado", country: "United States", postal_code: "81657", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Aspen Community Church", denomination: "Non-denominational", city: "Aspen", state_province: "Colorado", country: "United States", postal_code: "81611", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Durango", denomination: "Baptist", city: "Durango", state_province: "Colorado", country: "United States", postal_code: "81301", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Telluride Community Church", denomination: "Non-denominational", city: "Telluride", state_province: "Colorado", country: "United States", postal_code: "81435", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Eastern Plains (Rural)
  { name: "First Baptist Church Burlington", denomination: "Baptist", city: "Burlington", state_province: "Colorado", country: "United States", postal_code: "80807", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First United Methodist Limon", denomination: "Methodist", city: "Limon", state_province: "Colorado", country: "United States", postal_code: "80828", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Sterling", denomination: "Baptist", city: "Sterling", state_province: "Colorado", country: "United States", postal_code: "80751", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
];

// ============= TEXAS - All Areas =============
const TEXAS_CHURCHES: ChurchSeedData[] = [
  // Major Cities
  { name: "Lakewood Church", denomination: "Non-denominational", city: "Houston", state_province: "Texas", country: "United States", postal_code: "77027", website: "https://lakewoodchurch.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Gateway Church", denomination: "Non-denominational", city: "Southlake", state_province: "Texas", country: "United States", postal_code: "76092", website: "https://gatewaypeople.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Prestonwood Baptist Church", denomination: "Baptist", city: "Plano", state_province: "Texas", country: "United States", postal_code: "75024", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Dallas", denomination: "Baptist", city: "Dallas", state_province: "Texas", country: "United States", postal_code: "75201", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Austin Area
  { name: "Austin Stone Community Church", denomination: "Non-denominational", city: "Austin", state_province: "Texas", country: "United States", postal_code: "78701", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Riverbend Church", denomination: "Non-denominational", city: "Austin", state_province: "Texas", country: "United States", postal_code: "78731", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // San Antonio
  { name: "Cornerstone Church", denomination: "Non-denominational", city: "San Antonio", state_province: "Texas", country: "United States", postal_code: "78249", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Community Bible Church", denomination: "Non-denominational", city: "San Antonio", state_province: "Texas", country: "United States", postal_code: "78232", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Suburbs
  { name: "Watermark Community Church", denomination: "Non-denominational", city: "Dallas", state_province: "Texas", country: "United States", postal_code: "75248", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Fellowship Church", denomination: "Non-denominational", city: "Grapevine", state_province: "Texas", country: "United States", postal_code: "76051", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Keller", denomination: "Baptist", city: "Keller", state_province: "Texas", country: "United States", postal_code: "76248", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "The Village Church Flower Mound", denomination: "Baptist", city: "Flower Mound", state_province: "Texas", country: "United States", postal_code: "75028", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Frisco", denomination: "Baptist", city: "Frisco", state_province: "Texas", country: "United States", postal_code: "75034", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "McKinney Memorial Bible Church", denomination: "Non-denominational", city: "McKinney", state_province: "Texas", country: "United States", postal_code: "75069", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Stonebriar Community Church", denomination: "Non-denominational", city: "Frisco", state_province: "Texas", country: "United States", postal_code: "75034", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Allen", denomination: "Baptist", city: "Allen", state_province: "Texas", country: "United States", postal_code: "75002", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Sugar Land", denomination: "Baptist", city: "Sugar Land", state_province: "Texas", country: "United States", postal_code: "77478", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Champion Forest Baptist Church", denomination: "Baptist", city: "Houston", state_province: "Texas", country: "United States", postal_code: "77090", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Woodlands Church", denomination: "Non-denominational", city: "The Woodlands", state_province: "Texas", country: "United States", postal_code: "77380", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Rural/Small Towns
  { name: "First Baptist Church Fredericksburg", denomination: "Baptist", city: "Fredericksburg", state_province: "Texas", country: "United States", postal_code: "78624", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Marble Falls", denomination: "Methodist", city: "Marble Falls", state_province: "Texas", country: "United States", postal_code: "78654", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Wimberley", denomination: "Baptist", city: "Wimberley", state_province: "Texas", country: "United States", postal_code: "78676", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Brenham", denomination: "Baptist", city: "Brenham", state_province: "Texas", country: "United States", postal_code: "77833", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Bastrop", denomination: "Methodist", city: "Bastrop", state_province: "Texas", country: "United States", postal_code: "78602", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Bandera", denomination: "Baptist", city: "Bandera", state_province: "Texas", country: "United States", postal_code: "78003", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Junction", denomination: "Baptist", city: "Junction", state_province: "Texas", country: "United States", postal_code: "76849", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Alpine", denomination: "Baptist", city: "Alpine", state_province: "Texas", country: "United States", postal_code: "79830", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Marfa", denomination: "Baptist", city: "Marfa", state_province: "Texas", country: "United States", postal_code: "79843", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First United Methodist Canadian", denomination: "Methodist", city: "Canadian", state_province: "Texas", country: "United States", postal_code: "79014", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Perryton", denomination: "Baptist", city: "Perryton", state_province: "Texas", country: "United States", postal_code: "79070", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
];

// ============= CALIFORNIA - All Areas =============
const CALIFORNIA_CHURCHES: ChurchSeedData[] = [
  // Major Cities
  { name: "Saddleback Church", denomination: "Baptist", city: "Lake Forest", state_province: "California", country: "United States", postal_code: "92630", website: "https://saddleback.com", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Hillsong LA", denomination: "Pentecostal", city: "Los Angeles", state_province: "California", country: "United States", postal_code: "90028", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "The Rock Church", denomination: "Non-denominational", city: "San Diego", state_province: "California", country: "United States", postal_code: "92121", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Mosaic Church LA", denomination: "Non-denominational", city: "Los Angeles", state_province: "California", country: "United States", postal_code: "90017", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // San Francisco Bay Area
  { name: "City Church San Francisco", denomination: "Non-denominational", city: "San Francisco", state_province: "California", country: "United States", postal_code: "94114", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Bayside Church", denomination: "Non-denominational", city: "Granite Bay", state_province: "California", country: "United States", postal_code: "95746", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Valley Church Cupertino", denomination: "Non-denominational", city: "Cupertino", state_province: "California", country: "United States", postal_code: "95014", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Palo Alto", denomination: "Baptist", city: "Palo Alto", state_province: "California", country: "United States", postal_code: "94301", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Suburbs
  { name: "Rock Harbor Fullerton", denomination: "Non-denominational", city: "Fullerton", state_province: "California", country: "United States", postal_code: "92832", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Irvine", denomination: "Baptist", city: "Irvine", state_province: "California", country: "United States", postal_code: "92612", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Mariners Church", denomination: "Non-denominational", city: "Irvine", state_province: "California", country: "United States", postal_code: "92618", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Presbyterian Church Pasadena", denomination: "Presbyterian", city: "Pasadena", state_province: "California", country: "United States", postal_code: "91101", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Glendale", denomination: "Baptist", city: "Glendale", state_province: "California", country: "United States", postal_code: "91206", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Burbank", denomination: "Baptist", city: "Burbank", state_province: "California", country: "United States", postal_code: "91502", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Reality LA", denomination: "Non-denominational", city: "Los Angeles", state_province: "California", country: "United States", postal_code: "90027", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Rural/Small Towns
  { name: "First Baptist Church Sonora", denomination: "Baptist", city: "Sonora", state_province: "California", country: "United States", postal_code: "95370", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Grass Valley", denomination: "Methodist", city: "Grass Valley", state_province: "California", country: "United States", postal_code: "95945", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Placerville", denomination: "Baptist", city: "Placerville", state_province: "California", country: "United States", postal_code: "95667", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Red Bluff", denomination: "Baptist", city: "Red Bluff", state_province: "California", country: "United States", postal_code: "96080", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Susanville", denomination: "Baptist", city: "Susanville", state_province: "California", country: "United States", postal_code: "96130", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First United Methodist Quincy", denomination: "Methodist", city: "Quincy", state_province: "California", country: "United States", postal_code: "95971", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Bishop", denomination: "Baptist", city: "Bishop", state_province: "California", country: "United States", postal_code: "93514", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First United Methodist Mammoth Lakes", denomination: "Methodist", city: "Mammoth Lakes", state_province: "California", country: "United States", postal_code: "93546", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Truckee", denomination: "Baptist", city: "Truckee", state_province: "California", country: "United States", postal_code: "96161", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
];

// ============= NEW YORK - All Areas =============
const NEW_YORK_CHURCHES: ChurchSeedData[] = [
  // NYC
  { name: "Hillsong NYC", denomination: "Pentecostal", city: "New York", state_province: "New York", country: "United States", postal_code: "10001", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Brooklyn Tabernacle", denomination: "Non-denominational", city: "Brooklyn", state_province: "New York", country: "United States", postal_code: "11201", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Times Square Church", denomination: "Non-denominational", city: "New York", state_province: "New York", country: "United States", postal_code: "10019", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Redeemer Presbyterian Church", denomination: "Presbyterian", city: "New York", state_province: "New York", country: "United States", postal_code: "10021", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Trinity Church Wall Street", denomination: "Episcopal", city: "New York", state_province: "New York", country: "United States", postal_code: "10006", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Suburbs (Westchester, Long Island)
  { name: "Christ Church Rye", denomination: "Episcopal", city: "Rye", state_province: "New York", country: "United States", postal_code: "10580", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Presbyterian Church White Plains", denomination: "Presbyterian", city: "White Plains", state_province: "New York", country: "United States", postal_code: "10601", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Scarsdale", denomination: "Baptist", city: "Scarsdale", state_province: "New York", country: "United States", postal_code: "10583", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "St. Patrick's Church Huntington", denomination: "Catholic", city: "Huntington", state_province: "New York", country: "United States", postal_code: "11743", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Presbyterian Church Garden City", denomination: "Presbyterian", city: "Garden City", state_province: "New York", country: "United States", postal_code: "11530", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Upstate Cities
  { name: "First Baptist Church Albany", denomination: "Baptist", city: "Albany", state_province: "New York", country: "United States", postal_code: "12203", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Presbyterian Church Syracuse", denomination: "Presbyterian", city: "Syracuse", state_province: "New York", country: "United States", postal_code: "13202", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Rochester", denomination: "Baptist", city: "Rochester", state_province: "New York", country: "United States", postal_code: "14604", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "The Chapel Buffalo", denomination: "Non-denominational", city: "Buffalo", state_province: "New York", country: "United States", postal_code: "14217", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Rural/Small Towns
  { name: "First Baptist Church Saratoga Springs", denomination: "Baptist", city: "Saratoga Springs", state_province: "New York", country: "United States", postal_code: "12866", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Glens Falls", denomination: "Methodist", city: "Glens Falls", state_province: "New York", country: "United States", postal_code: "12801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Lake Placid", denomination: "Baptist", city: "Lake Placid", state_province: "New York", country: "United States", postal_code: "12946", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Presbyterian Church Cooperstown", denomination: "Presbyterian", city: "Cooperstown", state_province: "New York", country: "United States", postal_code: "13326", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First United Methodist Owego", denomination: "Methodist", city: "Owego", state_province: "New York", country: "United States", postal_code: "13827", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Canandaigua", denomination: "Baptist", city: "Canandaigua", state_province: "New York", country: "United States", postal_code: "14424", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
];

// ============= GEORGIA - All Areas =============
const GEORGIA_CHURCHES: ChurchSeedData[] = [
  // Atlanta Metro
  { name: "North Point Community Church", denomination: "Non-denominational", city: "Alpharetta", state_province: "Georgia", country: "United States", postal_code: "30022", website: "https://northpoint.org", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "New Birth Missionary Baptist Church", denomination: "Baptist", city: "Lithonia", state_province: "Georgia", country: "United States", postal_code: "30038", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Buckhead Church", denomination: "Non-denominational", city: "Atlanta", state_province: "Georgia", country: "United States", postal_code: "30305", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Atlanta", denomination: "Baptist", city: "Atlanta", state_province: "Georgia", country: "United States", postal_code: "30309", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Passion City Church", denomination: "Non-denominational", city: "Atlanta", state_province: "Georgia", country: "United States", postal_code: "30318", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Suburbs
  { name: "12Stone Church", denomination: "Non-denominational", city: "Lawrenceville", state_province: "Georgia", country: "United States", postal_code: "30043", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Woodstock", denomination: "Baptist", city: "Woodstock", state_province: "Georgia", country: "United States", postal_code: "30188", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Marietta", denomination: "Baptist", city: "Marietta", state_province: "Georgia", country: "United States", postal_code: "30060", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Kennesaw", denomination: "Baptist", city: "Kennesaw", state_province: "Georgia", country: "United States", postal_code: "30144", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Duluth", denomination: "Baptist", city: "Duluth", state_province: "Georgia", country: "United States", postal_code: "30096", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Roswell", denomination: "Methodist", city: "Roswell", state_province: "Georgia", country: "United States", postal_code: "30075", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Other Cities
  { name: "First Baptist Church Savannah", denomination: "Baptist", city: "Savannah", state_province: "Georgia", country: "United States", postal_code: "31401", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Augusta", denomination: "Baptist", city: "Augusta", state_province: "Georgia", country: "United States", postal_code: "30901", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Columbus", denomination: "Baptist", city: "Columbus", state_province: "Georgia", country: "United States", postal_code: "31901", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Macon", denomination: "Baptist", city: "Macon", state_province: "Georgia", country: "United States", postal_code: "31201", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Rural/Small Towns
  { name: "First Baptist Church Dahlonega", denomination: "Baptist", city: "Dahlonega", state_province: "Georgia", country: "United States", postal_code: "30533", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Blue Ridge", denomination: "Methodist", city: "Blue Ridge", state_province: "Georgia", country: "United States", postal_code: "30513", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Ellijay", denomination: "Baptist", city: "Ellijay", state_province: "Georgia", country: "United States", postal_code: "30540", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First Baptist Church Madison", denomination: "Baptist", city: "Madison", state_province: "Georgia", country: "United States", postal_code: "30650", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  { name: "First United Methodist Thomasville", denomination: "Methodist", city: "Thomasville", state_province: "Georgia", country: "United States", postal_code: "31792", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Americus", denomination: "Baptist", city: "Americus", state_province: "Georgia", country: "United States", postal_code: "31709", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
];

// ============= OTHER STATES - Comprehensive Coverage =============
const OTHER_STATES_CHURCHES: ChurchSeedData[] = [
  // Illinois
  { name: "Willow Creek Community Church", denomination: "Non-denominational", city: "South Barrington", state_province: "Illinois", country: "United States", postal_code: "60010", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Moody Church", denomination: "Non-denominational", city: "Chicago", state_province: "Illinois", country: "United States", postal_code: "60614", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Naperville", denomination: "Baptist", city: "Naperville", state_province: "Illinois", country: "United States", postal_code: "60540", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Christ Church of Oak Brook", denomination: "Non-denominational", city: "Oak Brook", state_province: "Illinois", country: "United States", postal_code: "60523", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Galena", denomination: "Baptist", city: "Galena", state_province: "Illinois", country: "United States", postal_code: "61036", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Tennessee
  { name: "Bellevue Baptist Church", denomination: "Baptist", city: "Cordova", state_province: "Tennessee", country: "United States", postal_code: "38018", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Cross Point Church", denomination: "Non-denominational", city: "Nashville", state_province: "Tennessee", country: "United States", postal_code: "37203", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Brentwood Baptist Church", denomination: "Baptist", city: "Brentwood", state_province: "Tennessee", country: "United States", postal_code: "37027", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Gatlinburg", denomination: "Baptist", city: "Gatlinburg", state_province: "Tennessee", country: "United States", postal_code: "37738", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Pigeon Forge", denomination: "Methodist", city: "Pigeon Forge", state_province: "Tennessee", country: "United States", postal_code: "37863", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // North Carolina
  { name: "Elevation Church", denomination: "Baptist", city: "Charlotte", state_province: "North Carolina", country: "United States", postal_code: "28277", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Raleigh", denomination: "Baptist", city: "Raleigh", state_province: "North Carolina", country: "United States", postal_code: "27601", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Asheville", denomination: "Baptist", city: "Asheville", state_province: "North Carolina", country: "United States", postal_code: "28801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Blowing Rock", denomination: "Methodist", city: "Blowing Rock", state_province: "North Carolina", country: "United States", postal_code: "28605", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Brevard", denomination: "Baptist", city: "Brevard", state_province: "North Carolina", country: "United States", postal_code: "28712", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Arizona
  { name: "Dream City Church", denomination: "Non-denominational", city: "Phoenix", state_province: "Arizona", country: "United States", postal_code: "85027", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Christ's Church of the Valley", denomination: "Non-denominational", city: "Peoria", state_province: "Arizona", country: "United States", postal_code: "85383", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Scottsdale", denomination: "Baptist", city: "Scottsdale", state_province: "Arizona", country: "United States", postal_code: "85251", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Southern Baptist Church Sedona", denomination: "Baptist", city: "Sedona", state_province: "Arizona", country: "United States", postal_code: "86336", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Flagstaff", denomination: "Methodist", city: "Flagstaff", state_province: "Arizona", country: "United States", postal_code: "86001", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Ohio
  { name: "Crossroads Church", denomination: "Non-denominational", city: "Cincinnati", state_province: "Ohio", country: "United States", postal_code: "45208", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Columbus", denomination: "Baptist", city: "Columbus", state_province: "Ohio", country: "United States", postal_code: "43215", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Cleveland", denomination: "Baptist", city: "Cleveland", state_province: "Ohio", country: "United States", postal_code: "44114", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Yellow Springs", denomination: "Methodist", city: "Yellow Springs", state_province: "Ohio", country: "United States", postal_code: "45387", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Washington State
  { name: "Mars Hill Church", denomination: "Non-denominational", city: "Seattle", state_province: "Washington", country: "United States", postal_code: "98121", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Spokane", denomination: "Baptist", city: "Spokane", state_province: "Washington", country: "United States", postal_code: "99201", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Leavenworth", denomination: "Baptist", city: "Leavenworth", state_province: "Washington", country: "United States", postal_code: "98826", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Winthrop", denomination: "Methodist", city: "Winthrop", state_province: "Washington", country: "United States", postal_code: "98862", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Oregon
  { name: "Imago Dei Community", denomination: "Non-denominational", city: "Portland", state_province: "Oregon", country: "United States", postal_code: "97214", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Bend", denomination: "Baptist", city: "Bend", state_province: "Oregon", country: "United States", postal_code: "97701", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Sisters", denomination: "Methodist", city: "Sisters", state_province: "Oregon", country: "United States", postal_code: "97759", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Ashland", denomination: "Baptist", city: "Ashland", state_province: "Oregon", country: "United States", postal_code: "97520", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Michigan
  { name: "Kensington Community Church", denomination: "Non-denominational", city: "Troy", state_province: "Michigan", country: "United States", postal_code: "48084", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Grand Rapids", denomination: "Baptist", city: "Grand Rapids", state_province: "Michigan", country: "United States", postal_code: "49503", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Traverse City", denomination: "Methodist", city: "Traverse City", state_province: "Michigan", country: "United States", postal_code: "49684", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Petoskey", denomination: "Baptist", city: "Petoskey", state_province: "Michigan", country: "United States", postal_code: "49770", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Mackinaw City", denomination: "Methodist", city: "Mackinaw City", state_province: "Michigan", country: "United States", postal_code: "49701", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Pennsylvania
  { name: "Calvary Chapel Philadelphia", denomination: "Calvary Chapel", city: "Philadelphia", state_province: "Pennsylvania", country: "United States", postal_code: "19103", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Pittsburgh", denomination: "Baptist", city: "Pittsburgh", state_province: "Pennsylvania", country: "United States", postal_code: "15219", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist State College", denomination: "Methodist", city: "State College", state_province: "Pennsylvania", country: "United States", postal_code: "16801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Lancaster", denomination: "Baptist", city: "Lancaster", state_province: "Pennsylvania", country: "United States", postal_code: "17602", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Jim Thorpe", denomination: "Methodist", city: "Jim Thorpe", state_province: "Pennsylvania", country: "United States", postal_code: "18229", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Virginia
  { name: "McLean Bible Church", denomination: "Non-denominational", city: "Vienna", state_province: "Virginia", country: "United States", postal_code: "22182", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Richmond", denomination: "Baptist", city: "Richmond", state_province: "Virginia", country: "United States", postal_code: "23219", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Charlottesville", denomination: "Baptist", city: "Charlottesville", state_province: "Virginia", country: "United States", postal_code: "22902", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Lexington", denomination: "Methodist", city: "Lexington", state_province: "Virginia", country: "United States", postal_code: "24450", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Massachusetts
  { name: "Park Street Church", denomination: "Congregational", city: "Boston", state_province: "Massachusetts", country: "United States", postal_code: "02108", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Worcester", denomination: "Baptist", city: "Worcester", state_province: "Massachusetts", country: "United States", postal_code: "01608", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Congregational Church Stockbridge", denomination: "Congregational", city: "Stockbridge", state_province: "Massachusetts", country: "United States", postal_code: "01262", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Provincetown", denomination: "Baptist", city: "Provincetown", state_province: "Massachusetts", country: "United States", postal_code: "02657", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Minnesota
  { name: "Bethlehem Baptist Church", denomination: "Baptist", city: "Minneapolis", state_province: "Minnesota", country: "United States", postal_code: "55407", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church St. Paul", denomination: "Baptist", city: "St. Paul", state_province: "Minnesota", country: "United States", postal_code: "55101", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Duluth", denomination: "Methodist", city: "Duluth", state_province: "Minnesota", country: "United States", postal_code: "55802", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Grand Marais", denomination: "Baptist", city: "Grand Marais", state_province: "Minnesota", country: "United States", postal_code: "55604", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Wisconsin
  { name: "Elmbrook Church", denomination: "Non-denominational", city: "Brookfield", state_province: "Wisconsin", country: "United States", postal_code: "53045", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Madison", denomination: "Baptist", city: "Madison", state_province: "Wisconsin", country: "United States", postal_code: "53703", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Door County", denomination: "Methodist", city: "Sturgeon Bay", state_province: "Wisconsin", country: "United States", postal_code: "54235", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Bayfield", denomination: "Baptist", city: "Bayfield", state_province: "Wisconsin", country: "United States", postal_code: "54814", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Montana
  { name: "First Baptist Church Bozeman", denomination: "Baptist", city: "Bozeman", state_province: "Montana", country: "United States", postal_code: "59715", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Missoula", denomination: "Methodist", city: "Missoula", state_province: "Montana", country: "United States", postal_code: "59801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Whitefish", denomination: "Baptist", city: "Whitefish", state_province: "Montana", country: "United States", postal_code: "59937", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Red Lodge", denomination: "Methodist", city: "Red Lodge", state_province: "Montana", country: "United States", postal_code: "59068", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Wyoming
  { name: "First Baptist Church Jackson", denomination: "Baptist", city: "Jackson", state_province: "Wyoming", country: "United States", postal_code: "83001", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Cheyenne", denomination: "Methodist", city: "Cheyenne", state_province: "Wyoming", country: "United States", postal_code: "82001", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Cody", denomination: "Baptist", city: "Cody", state_province: "Wyoming", country: "United States", postal_code: "82414", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Sheridan", denomination: "Methodist", city: "Sheridan", state_province: "Wyoming", country: "United States", postal_code: "82801", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Idaho
  { name: "First Baptist Church Boise", denomination: "Baptist", city: "Boise", state_province: "Idaho", country: "United States", postal_code: "83702", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Sun Valley", denomination: "Methodist", city: "Sun Valley", state_province: "Idaho", country: "United States", postal_code: "83353", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Coeur d'Alene", denomination: "Baptist", city: "Coeur d'Alene", state_province: "Idaho", country: "United States", postal_code: "83814", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Sandpoint", denomination: "Methodist", city: "Sandpoint", state_province: "Idaho", country: "United States", postal_code: "83864", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Utah
  { name: "First Baptist Church Salt Lake City", denomination: "Baptist", city: "Salt Lake City", state_province: "Utah", country: "United States", postal_code: "84101", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Park City", denomination: "Methodist", city: "Park City", state_province: "Utah", country: "United States", postal_code: "84060", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Moab", denomination: "Baptist", city: "Moab", state_province: "Utah", country: "United States", postal_code: "84532", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist St. George", denomination: "Methodist", city: "St. George", state_province: "Utah", country: "United States", postal_code: "84770", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Nevada
  { name: "Central Christian Church", denomination: "Non-denominational", city: "Las Vegas", state_province: "Nevada", country: "United States", postal_code: "89011", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Reno", denomination: "Baptist", city: "Reno", state_province: "Nevada", country: "United States", postal_code: "89501", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Lake Tahoe", denomination: "Methodist", city: "Incline Village", state_province: "Nevada", country: "United States", postal_code: "89451", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // New Mexico
  { name: "Calvary Albuquerque", denomination: "Calvary Chapel", city: "Albuquerque", state_province: "New Mexico", country: "United States", postal_code: "87109", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Santa Fe", denomination: "Baptist", city: "Santa Fe", state_province: "New Mexico", country: "United States", postal_code: "87501", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Taos", denomination: "Methodist", city: "Taos", state_province: "New Mexico", country: "United States", postal_code: "87571", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Ruidoso", denomination: "Baptist", city: "Ruidoso", state_province: "New Mexico", country: "United States", postal_code: "88345", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Alaska
  { name: "First Baptist Church Anchorage", denomination: "Baptist", city: "Anchorage", state_province: "Alaska", country: "United States", postal_code: "99501", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Fairbanks", denomination: "Methodist", city: "Fairbanks", state_province: "Alaska", country: "United States", postal_code: "99701", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Juneau", denomination: "Baptist", city: "Juneau", state_province: "Alaska", country: "United States", postal_code: "99801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Hawaii
  { name: "New Hope Oahu", denomination: "Non-denominational", city: "Honolulu", state_province: "Hawaii", country: "United States", postal_code: "96814", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Maui", denomination: "Baptist", city: "Kahului", state_province: "Hawaii", country: "United States", postal_code: "96732", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Kona", denomination: "Methodist", city: "Kailua-Kona", state_province: "Hawaii", country: "United States", postal_code: "96740", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Maine
  { name: "First Baptist Church Portland", denomination: "Baptist", city: "Portland", state_province: "Maine", country: "United States", postal_code: "04101", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Congregational Church Camden", denomination: "Congregational", city: "Camden", state_province: "Maine", country: "United States", postal_code: "04843", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Bar Harbor", denomination: "Baptist", city: "Bar Harbor", state_province: "Maine", country: "United States", postal_code: "04609", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Kennebunkport", denomination: "Methodist", city: "Kennebunkport", state_province: "Maine", country: "United States", postal_code: "04046", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Vermont
  { name: "First Baptist Church Burlington", denomination: "Baptist", city: "Burlington", state_province: "Vermont", country: "United States", postal_code: "05401", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Congregational Church Stowe", denomination: "Congregational", city: "Stowe", state_province: "Vermont", country: "United States", postal_code: "05672", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Woodstock", denomination: "Methodist", city: "Woodstock", state_province: "Vermont", country: "United States", postal_code: "05091", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // New Hampshire
  { name: "First Baptist Church Concord", denomination: "Baptist", city: "Concord", state_province: "New Hampshire", country: "United States", postal_code: "03301", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Congregational Church North Conway", denomination: "Congregational", city: "North Conway", state_province: "New Hampshire", country: "United States", postal_code: "03860", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Portsmouth", denomination: "Baptist", city: "Portsmouth", state_province: "New Hampshire", country: "United States", postal_code: "03801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Connecticut
  { name: "First Baptist Church Hartford", denomination: "Baptist", city: "Hartford", state_province: "Connecticut", country: "United States", postal_code: "06103", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Congregational Church Greenwich", denomination: "Congregational", city: "Greenwich", state_province: "Connecticut", country: "United States", postal_code: "06830", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Mystic", denomination: "Methodist", city: "Mystic", state_province: "Connecticut", country: "United States", postal_code: "06355", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Rhode Island
  { name: "First Baptist Church in America", denomination: "Baptist", city: "Providence", state_province: "Rhode Island", country: "United States", postal_code: "02903", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Newport", denomination: "Methodist", city: "Newport", state_province: "Rhode Island", country: "United States", postal_code: "02840", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Delaware
  { name: "First Baptist Church Wilmington", denomination: "Baptist", city: "Wilmington", state_province: "Delaware", country: "United States", postal_code: "19801", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Rehoboth Beach", denomination: "Methodist", city: "Rehoboth Beach", state_province: "Delaware", country: "United States", postal_code: "19971", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Maryland
  { name: "First Baptist Church Baltimore", denomination: "Baptist", city: "Baltimore", state_province: "Maryland", country: "United States", postal_code: "21201", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Annapolis", denomination: "Methodist", city: "Annapolis", state_province: "Maryland", country: "United States", postal_code: "21401", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Ocean City", denomination: "Baptist", city: "Ocean City", state_province: "Maryland", country: "United States", postal_code: "21842", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // South Carolina
  { name: "NewSpring Church", denomination: "Non-denominational", city: "Anderson", state_province: "South Carolina", country: "United States", postal_code: "29621", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Charleston", denomination: "Baptist", city: "Charleston", state_province: "South Carolina", country: "United States", postal_code: "29401", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Hilton Head", denomination: "Methodist", city: "Hilton Head Island", state_province: "South Carolina", country: "United States", postal_code: "29926", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Beaufort", denomination: "Baptist", city: "Beaufort", state_province: "South Carolina", country: "United States", postal_code: "29902", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // West Virginia
  { name: "First Baptist Church Charleston WV", denomination: "Baptist", city: "Charleston", state_province: "West Virginia", country: "United States", postal_code: "25301", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Lewisburg", denomination: "Methodist", city: "Lewisburg", state_province: "West Virginia", country: "United States", postal_code: "24901", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Kentucky
  { name: "Southeast Christian Church", denomination: "Christian Church", city: "Louisville", state_province: "Kentucky", country: "United States", postal_code: "40229", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Lexington", denomination: "Baptist", city: "Lexington", state_province: "Kentucky", country: "United States", postal_code: "40507", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Indiana
  { name: "Northview Church", denomination: "Non-denominational", city: "Carmel", state_province: "Indiana", country: "United States", postal_code: "46033", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Indianapolis", denomination: "Baptist", city: "Indianapolis", state_province: "Indiana", country: "United States", postal_code: "46204", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Brown County", denomination: "Methodist", city: "Nashville", state_province: "Indiana", country: "United States", postal_code: "47448", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Missouri
  { name: "James River Church", denomination: "Assemblies of God", city: "Springfield", state_province: "Missouri", country: "United States", postal_code: "65804", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Kansas City", denomination: "Baptist", city: "Kansas City", state_province: "Missouri", country: "United States", postal_code: "64108", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Branson", denomination: "Methodist", city: "Branson", state_province: "Missouri", country: "United States", postal_code: "65616", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Iowa
  { name: "First Baptist Church Des Moines", denomination: "Baptist", city: "Des Moines", state_province: "Iowa", country: "United States", postal_code: "50309", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Decorah", denomination: "Methodist", city: "Decorah", state_province: "Iowa", country: "United States", postal_code: "52101", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Kansas
  { name: "First Baptist Church Wichita", denomination: "Baptist", city: "Wichita", state_province: "Kansas", country: "United States", postal_code: "67202", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Dodge City", denomination: "Methodist", city: "Dodge City", state_province: "Kansas", country: "United States", postal_code: "67801", accepts_crypto: false, accepts_fiat: true, accepts_cards: false, accepts_checks: true },
  
  // Nebraska
  { name: "Christ Community Church", denomination: "Non-denominational", city: "Omaha", state_province: "Nebraska", country: "United States", postal_code: "68144", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Lincoln", denomination: "Baptist", city: "Lincoln", state_province: "Nebraska", country: "United States", postal_code: "68508", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // South Dakota
  { name: "First Baptist Church Sioux Falls", denomination: "Baptist", city: "Sioux Falls", state_province: "South Dakota", country: "United States", postal_code: "57104", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Rapid City", denomination: "Methodist", city: "Rapid City", state_province: "South Dakota", country: "United States", postal_code: "57701", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // North Dakota
  { name: "First Baptist Church Fargo", denomination: "Baptist", city: "Fargo", state_province: "North Dakota", country: "United States", postal_code: "58102", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Bismarck", denomination: "Methodist", city: "Bismarck", state_province: "North Dakota", country: "United States", postal_code: "58501", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Oklahoma
  { name: "Life.Church", denomination: "Non-denominational", city: "Edmond", state_province: "Oklahoma", country: "United States", postal_code: "73034", website: "https://life.church", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Tulsa", denomination: "Baptist", city: "Tulsa", state_province: "Oklahoma", country: "United States", postal_code: "74103", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Arkansas
  { name: "Fellowship Bible Church", denomination: "Non-denominational", city: "Little Rock", state_province: "Arkansas", country: "United States", postal_code: "72212", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Eureka Springs", denomination: "Baptist", city: "Eureka Springs", state_province: "Arkansas", country: "United States", postal_code: "72632", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Louisiana
  { name: "First Baptist Church New Orleans", denomination: "Baptist", city: "New Orleans", state_province: "Louisiana", country: "United States", postal_code: "70112", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "Bethany Church", denomination: "Pentecostal", city: "Baton Rouge", state_province: "Louisiana", country: "United States", postal_code: "70816", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Mississippi
  { name: "First Baptist Church Jackson", denomination: "Baptist", city: "Jackson", state_province: "Mississippi", country: "United States", postal_code: "39201", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Oxford", denomination: "Methodist", city: "Oxford", state_province: "Mississippi", country: "United States", postal_code: "38655", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  
  // Alabama
  { name: "Church of the Highlands", denomination: "Non-denominational", city: "Birmingham", state_province: "Alabama", country: "United States", postal_code: "35243", accepts_crypto: true, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First Baptist Church Mobile", denomination: "Baptist", city: "Mobile", state_province: "Alabama", country: "United States", postal_code: "36602", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
  { name: "First United Methodist Fairhope", denomination: "Methodist", city: "Fairhope", state_province: "Alabama", country: "United States", postal_code: "36532", accepts_crypto: false, accepts_fiat: true, accepts_cards: true, accepts_checks: true },
];

// Export combined church list
export const ALL_US_CHURCHES: ChurchSeedData[] = [
  ...FLORIDA_CHURCHES,
  ...COLORADO_CHURCHES,
  ...TEXAS_CHURCHES,
  ...CALIFORNIA_CHURCHES,
  ...NEW_YORK_CHURCHES,
  ...GEORGIA_CHURCHES,
  ...OTHER_STATES_CHURCHES
];

export class USChurchSeederService {
  static async seedUSChurches(): Promise<{ added: number; errors: number; skipped: number }> {
    let added = 0;
    let errors = 0;
    let skipped = 0;

    console.log(`Starting to seed ${ALL_US_CHURCHES.length} US churches...`);

    for (const church of ALL_US_CHURCHES) {
      try {
        // Check if church already exists
        const { data: existing } = await supabase
          .from('global_churches')
          .select('id')
          .eq('name', church.name)
          .eq('city', church.city)
          .eq('state_province', church.state_province)
          .maybeSingle();

        if (existing) {
          console.log(`Skipped (exists): ${church.name}, ${church.city}`);
          skipped++;
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
          console.log(`Added: ${church.name}, ${church.city}, ${church.state_province}`);
          added++;
        }
      } catch (err) {
        console.error(`Exception adding ${church.name}:`, err);
        errors++;
      }
    }

    console.log(`Seeding complete: ${added} added, ${skipped} skipped, ${errors} errors`);
    return { added, errors, skipped };
  }

  static async getChurchCount(): Promise<number> {
    const { count } = await supabase
      .from('global_churches')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  static getTotalChurchesAvailable(): number {
    return ALL_US_CHURCHES.length;
  }
}
