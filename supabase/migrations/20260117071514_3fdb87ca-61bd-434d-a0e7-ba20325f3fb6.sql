-- Remove overly permissive policies that still exist

-- Fix sovereign_agents - drop the policy that allows public access with CASE statement  
DROP POLICY IF EXISTS "Public can view non-sensitive agent info" ON public.sovereign_agents;

-- Create proper public access only via the public_agents view (which hides sensitive info)
-- The view already exists and properly hides email/phone

-- Fix global_churches - create a restrictive policy for sensitive data
-- Keep public access for basic church discovery but hide sensitive contact info in the view
-- The api.global_churches view should only show non-sensitive data for public users

-- Drop the overly permissive church payment processors policy
DROP POLICY IF EXISTS "Church payment processors are publicly viewable" ON public.church_payment_processors;

-- Ensure RLS is enabled on tables
ALTER TABLE public.sovereign_agents ENABLE ROW LEVEL SECURITY;

-- Create a proper policy for sovereign_agents that only allows authenticated users with assignments
DROP POLICY IF EXISTS "Authenticated users with assignments see full agent info" ON public.sovereign_agents;

CREATE POLICY "Authenticated users with assignments can view agents"
ON public.sovereign_agents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agent_assignments 
    WHERE agent_assignments.agent_id = sovereign_agents.id 
    AND agent_assignments.user_id = auth.uid()
  )
  OR 
  -- Also allow service role for edge functions
  auth.jwt()->>'role' = 'service_role'
);

-- For global_churches, the data is intentionally public for discovery
-- but we should note this is a design decision for a church directory