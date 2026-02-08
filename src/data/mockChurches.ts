
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
  {
    id: "4",
    name: "The Father's House",
    location: "Leesburg, FL",
    city: "Leesburg",
    state: "FL", 
    country: "USA",
    denomination: "Pentecostal",
    acceptsCrypto: true,
    website: "https://thefathershouse.com",
    payment_methods: ["Credit Card", "ACH", "Bitcoin", "Ethereum", "USDC"]
  },
  {
    id: "5",
    name: "Cross Point Community",
    location: "Nashville, TN",
    city: "Nashville",
    state: "TN",
    country: "USA", 
    denomination: "Non-denominational",
    acceptsCrypto: true,
    website: "https://crosspoint.org",
    payment_methods: ["Credit Card", "ACH", "Bitcoin", "Ethereum"]
  },
  {
    id: "6",
    name: "The Cross Fellowship", 
    location: "Austin, TX",
    city: "Austin",
    state: "TX",
    country: "USA",
    denomination: "Evangelical",
    acceptsCrypto: false,
    website: "https://thecross.org", 
    payment_methods: ["Cash", "Check", "Credit Card", "ACH"]
  },
  {
    id: "7",
    name: "Cornerstone Church",
    location: "Phoenix, AZ", 
    city: "Phoenix",
    state: "AZ",
    country: "USA",
    denomination: "Baptist",
    acceptsCrypto: true,
    website: "https://cornerstone.org",
    payment_methods: ["Credit Card", "ACH", "Bitcoin"]
  },
  {
    id: "8", 
    name: "New Life Christian Center",
    location: "Orlando, FL",
    city: "Orlando", 
    state: "FL",
    country: "USA",
    denomination: "Charismatic",
    acceptsCrypto: true,
    website: "https://newlifechristian.org",
    payment_methods: ["Credit Card", "ACH", "Bitcoin", "Ethereum", "USDC"]
  }
];
