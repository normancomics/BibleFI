-- Fix sovereign_agents security: restrict SELECT to only assigned users via security definer function
-- Drop existing permissive policies that might expose data
DROP POLICY IF EXISTS "Service role full access" ON public.sovereign_agents;
DROP POLICY IF EXISTS "Users can view their assigned agents only" ON public.sovereign_agents;

-- Create restrictive policy: only users with active assignments can view their agents
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

-- Service role access for edge functions (service role bypasses RLS anyway, but explicit)
CREATE POLICY "Service role manages agents"
ON public.sovereign_agents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);