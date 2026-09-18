// BWSP – session helper
// The BWSP edge functions require an authenticated caller. Signed-out visitors
// must use the deterministic offline paths instead of triggering 401 responses.

import { supabase } from '@/integrations/supabase/client';

export async function hasSupabaseSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session?.access_token;
  } catch {
    return false;
  }
}
