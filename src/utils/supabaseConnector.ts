
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the Supabase client is available and configured
 */
export const isSupabaseConnected = (): boolean => {
  // Check if the supabase client is available and configured
  return !!supabase;
};
