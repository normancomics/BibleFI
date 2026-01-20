-- =============================================================================
-- Fix Security Issues: Agent Contact Exposure, Church Visibility, Contact Protection
-- =============================================================================

-- 1. FIX: sovereign_agents_contact_exposure - Create a view that hides sensitive contact info
-- First drop conflicting policies
DROP POLICY IF EXISTS "Agents visible to users with assignments" ON public.sovereign_agents;
DROP POLICY IF EXISTS "Verified agents visible to authenticated users" ON public.sovereign_agents;
DROP POLICY IF EXISTS "Users can view verified agents" ON public.sovereign_agents;
DROP POLICY IF EXISTS "Service role full access to agents" ON public.sovereign_agents;

-- Create a more restrictive policy - users can only see their assigned agents
CREATE POLICY "Users can view their assigned agents only"
ON public.sovereign_agents
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT agent_id FROM public.agent_assignments 
    WHERE user_id = auth.uid()
  )
);

-- Service role needs full access for admin operations
CREATE POLICY "Service role full access"
ON public.sovereign_agents
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- 2. FIX: superfluid_streams_church_visibility - Allow church admins to view incoming streams
-- Check if the table exists first
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'superfluid_streams' AND table_schema = 'public') THEN
    -- Drop existing SELECT policy if any
    DROP POLICY IF EXISTS "Users can view their own streams" ON public.superfluid_streams;
    
    -- Create policy for users to see their own streams
    EXECUTE 'CREATE POLICY "Users can view their own streams" ON public.superfluid_streams FOR SELECT TO authenticated USING (user_id = auth.uid())';
    
    -- Create policy for church admins to see incoming streams (if church_id column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'superfluid_streams' AND column_name = 'church_id') THEN
      EXECUTE 'CREATE POLICY "Church admins can view incoming streams" ON public.superfluid_streams FOR SELECT TO authenticated USING (
        church_id IN (
          SELECT id FROM public.global_churches 
          WHERE created_by = auth.uid()
        )
      )';
    END IF;
  END IF;
END $$;

-- 3. FIX: global_churches_contact_exposure - Protect sensitive contact info
-- Create a function to mask contact info for non-authenticated users
CREATE OR REPLACE FUNCTION public.get_masked_church_info(church_row public.global_churches)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', church_row.id,
    'name', church_row.name,
    'city', church_row.city,
    'state_province', church_row.state_province,
    'country', church_row.country,
    'denomination', church_row.denomination,
    'verified', church_row.verified,
    'accepts_crypto', church_row.accepts_crypto,
    'accepts_fiat', church_row.accepts_fiat,
    'rating', church_row.rating,
    'review_count', church_row.review_count,
    -- Mask sensitive info - only show first 3 chars
    'email', CASE WHEN church_row.email IS NOT NULL 
      THEN left(church_row.email, 3) || '***@***' 
      ELSE NULL END,
    'phone', CASE WHEN church_row.phone IS NOT NULL 
      THEN left(church_row.phone, 3) || '***' 
      ELSE NULL END,
    'website', church_row.website,  -- Website can remain public
    'address', church_row.address,  -- Address can remain public for finding church
    'crypto_address', CASE WHEN church_row.crypto_address IS NOT NULL 
      THEN left(church_row.crypto_address, 6) || '...' || right(church_row.crypto_address, 4)
      ELSE NULL END
  )
$$;

-- Create a secure view for public church discovery that masks sensitive data
DROP VIEW IF EXISTS public.public_church_directory;
CREATE VIEW public.public_church_directory 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  city,
  state_province,
  country,
  denomination,
  address,
  website,
  verified,
  accepts_crypto,
  accepts_fiat,
  accepts_cards,
  accepts_checks,
  rating,
  review_count,
  coordinates,
  -- Mask email - show domain only
  CASE WHEN email IS NOT NULL 
    THEN '***@' || split_part(email, '@', 2)
    ELSE NULL END as masked_email,
  -- Mask phone - show last 4 digits only  
  CASE WHEN phone IS NOT NULL 
    THEN '***-' || right(phone, 4)
    ELSE NULL END as masked_phone,
  -- Mask crypto address
  CASE WHEN crypto_address IS NOT NULL 
    THEN left(crypto_address, 6) || '...' || right(crypto_address, 4)
    ELSE NULL END as masked_crypto_address,
  crypto_networks,
  created_at
FROM public.global_churches;

-- Grant access to the public view
GRANT SELECT ON public.public_church_directory TO anon;
GRANT SELECT ON public.public_church_directory TO authenticated;

-- Update api schema view to use masked data for public access
DROP VIEW IF EXISTS api.global_churches;
CREATE VIEW api.global_churches 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  city,
  state_province,
  country,
  denomination,
  address,
  website,
  verified,
  accepts_crypto,
  accepts_fiat,
  accepts_cards,
  accepts_checks,
  rating,
  review_count,
  -- Mask sensitive data
  CASE WHEN email IS NOT NULL 
    THEN '***@' || split_part(email, '@', 2)
    ELSE NULL END as email,
  CASE WHEN phone IS NOT NULL 
    THEN '***-' || right(phone, 4)
    ELSE NULL END as phone,
  CASE WHEN crypto_address IS NOT NULL 
    THEN left(crypto_address, 6) || '...' || right(crypto_address, 4)
    ELSE NULL END as crypto_address,
  crypto_networks,
  created_at
FROM public.global_churches;

GRANT SELECT ON api.global_churches TO anon;
GRANT SELECT ON api.global_churches TO authenticated;
GRANT SELECT ON api.global_churches TO service_role;

-- 4. Create security definer function for authenticated users to get full church details
-- Only church creators or assigned users can see full contact info
CREATE OR REPLACE FUNCTION public.get_full_church_details(p_church_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church_row global_churches%ROWTYPE;
  v_is_authorized boolean;
BEGIN
  -- Get church data
  SELECT * INTO v_church_row FROM global_churches WHERE id = p_church_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if user is authorized (creator or has membership)
  v_is_authorized := (
    v_church_row.created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM church_memberships 
      WHERE church_id = p_church_id AND user_id = auth.uid()
    )
  );
  
  IF v_is_authorized THEN
    -- Return full details
    RETURN jsonb_build_object(
      'id', v_church_row.id,
      'name', v_church_row.name,
      'email', v_church_row.email,
      'phone', v_church_row.phone,
      'address', v_church_row.address,
      'city', v_church_row.city,
      'state_province', v_church_row.state_province,
      'country', v_church_row.country,
      'denomination', v_church_row.denomination,
      'website', v_church_row.website,
      'crypto_address', v_church_row.crypto_address,
      'crypto_networks', v_church_row.crypto_networks,
      'pastor_name', v_church_row.pastor_name,
      'verified', v_church_row.verified,
      'rating', v_church_row.rating
    );
  ELSE
    -- Return masked details
    RETURN jsonb_build_object(
      'id', v_church_row.id,
      'name', v_church_row.name,
      'email', CASE WHEN v_church_row.email IS NOT NULL 
        THEN '***@' || split_part(v_church_row.email, '@', 2)
        ELSE NULL END,
      'phone', CASE WHEN v_church_row.phone IS NOT NULL 
        THEN '***-' || right(v_church_row.phone, 4)
        ELSE NULL END,
      'address', v_church_row.address,
      'city', v_church_row.city,
      'state_province', v_church_row.state_province,
      'country', v_church_row.country,
      'denomination', v_church_row.denomination,
      'website', v_church_row.website,
      'crypto_address', CASE WHEN v_church_row.crypto_address IS NOT NULL 
        THEN left(v_church_row.crypto_address, 6) || '...' || right(v_church_row.crypto_address, 4)
        ELSE NULL END,
      'crypto_networks', v_church_row.crypto_networks,
      'verified', v_church_row.verified,
      'rating', v_church_row.rating
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_full_church_details(uuid) TO authenticated;