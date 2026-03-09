-- Drop the existing policy that lacks WITH CHECK
DROP POLICY IF EXISTS "Users can update their assignments" ON public.agent_assignments;

-- Recreate with WITH CHECK that only allows updating notes and completed_at
-- Users cannot change agent_id, status, or assignment_type
CREATE POLICY "Users can update their assignments"
ON public.agent_assignments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND agent_id IS NOT DISTINCT FROM (SELECT aa.agent_id FROM public.agent_assignments aa WHERE aa.id = agent_assignments.id)
  AND status IS NOT DISTINCT FROM (SELECT aa.status FROM public.agent_assignments aa WHERE aa.id = agent_assignments.id)
  AND assignment_type IS NOT DISTINCT FROM (SELECT aa.assignment_type FROM public.agent_assignments aa WHERE aa.id = agent_assignments.id)
);