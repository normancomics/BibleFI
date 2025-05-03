
export type Church = {
  id: string;
  name: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  denomination?: string;
  acceptsCrypto: boolean;
  website?: string;
  email?: string;
  phone?: string;
  payment_methods?: string[];
};
