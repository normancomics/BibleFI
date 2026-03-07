
-- Fix sovereign_agents security: convert restrictive policies to proper permissive + restrict view

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Service role manages agents" ON public.sovereign_agents;
DROP POLICY IF EXISTS "Users can view assigned agents only" ON public.sovereign_agents;

-- Create proper PERMISSIVE SELECT policy: only users with active assignments can see their agents
CREATE POLICY "Users can view assigned agents only"
ON public.sovereign_agents
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT agent_id FROM public.agent_assignments
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Deny all anonymous access
CREATE POLICY "Deny anonymous access"
ON public.sovereign_agents
FOR SELECT
TO anon
USING (false);

-- Recreate public_agents view with security_invoker to enforce base table RLS
DROP VIEW IF EXISTS public.public_agents;
CREATE VIEW public.public_agents
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  service_areas,
  specialties,
  languages,
  availability_hours,
  rating,
  review_count,
  verified
FROM public.sovereign_agents;
-- Note: email, phone are intentionally excluded from this view

COMMENT ON VIEW public.public_agents IS 'Public-safe view of agents. Excludes email/phone. Uses security_invoker so base table RLS is enforced.';
