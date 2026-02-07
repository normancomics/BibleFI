/**
 * Supabase client configured for the 'api' schema.
 * 
 * PostgREST is configured to only expose the 'api' schema, so any queries
 * to tables exposed via that schema (e.g. global_churches) MUST use this client.
 * 
 * Usage:
 *   import { supabaseApi } from "@/integrations/supabase/apiClient";
 *   const { data } = await supabaseApi.from('global_churches').select('*');
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ojiipppypzigjnjblbzn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaWlwcHB5cHppZ2puamJsYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzIzNzksImV4cCI6MjA2MTgwODM3OX0.bqpCOIo3ADXkkU4QDu9bd2W-prCLs3BhYEmSB1FBHtU";

export const supabaseApi = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: 'api' }
});
