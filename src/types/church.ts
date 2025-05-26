
export interface Church {
  id: string;
  name: string;
  denomination?: string;
  location: string; // Combined city, state, country for display
  address?: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  acceptsCrypto: boolean;
  payment_methods?: string[];
  verified?: boolean;
  created_at?: string;
  created_by?: string;
  isPrimaryChurch?: boolean; // For user church relationships
}
