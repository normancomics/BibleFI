
// This service will eventually connect to your Supabase database
// For now, it uses mock data

export type Church = {
  id: string;
  name: string;
  location: string;
  denomination?: string;
  acceptsCrypto: boolean;
  website?: string;
  email?: string;
  phone?: string;
};

// Mock data - replace with Supabase queries when connected
const mockChurches: Church[] = [
  { 
    id: "1", 
    name: "First Community Church", 
    location: "Columbus, OH", 
    denomination: "Non-denominational", 
    acceptsCrypto: true,
    website: "https://firstcommunity.org"
  },
  { 
    id: "2", 
    name: "Grace Fellowship", 
    location: "Dallas, TX", 
    denomination: "Baptist", 
    acceptsCrypto: false,
    website: "https://gracefellowship.org"
  },
  { 
    id: "3", 
    name: "Hope City Church", 
    location: "Portland, OR", 
    denomination: "Lutheran", 
    acceptsCrypto: true,
    website: "https://hopecity.org"
  },
];

export const searchChurches = async (query: string): Promise<Church[]> => {
  // In a real implementation, this would query your Supabase database
  // For now, return filtered mock data
  const normalizedQuery = query.toLowerCase();
  
  return mockChurches.filter(church => 
    church.name.toLowerCase().includes(normalizedQuery) || 
    church.location.toLowerCase().includes(normalizedQuery) ||
    (church.denomination && church.denomination.toLowerCase().includes(normalizedQuery))
  );
};

export const getChurchById = async (id: string): Promise<Church | undefined> => {
  // In a real implementation, this would query your Supabase database
  return mockChurches.find(church => church.id === id);
};

export const addChurch = async (church: Omit<Church, "id">): Promise<Church> => {
  // In a real implementation, this would add to your Supabase database
  // For now, just log that we would add this church
  console.log("Would add church to database:", church);
  
  // Return mock data with a generated ID
  const newChurch = {
    ...church,
    id: `new-${Date.now()}`
  };
  
  return newChurch;
};
