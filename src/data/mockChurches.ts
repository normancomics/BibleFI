
import { Church } from "@/types/church";

export const mockChurches: Church[] = [
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
