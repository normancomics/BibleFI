
export interface Church {
  id: string;
  name: string;
  denomination?: string;
  location: string; // Combined city, state, country for display
  address?: string;
  postalCode?: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  phone?: string;
  acceptsFiat?: boolean;
  fiatCurrencies?: string[];
  cryptoNetworks?: string[];
  acceptsCrypto: boolean;
  payment_methods?: string[];
  verified?: boolean;
  created_at?: string;
  created_by?: string;
  isPrimaryChurch?: boolean; // For user church relationships
}
