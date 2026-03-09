-- Fix: Add WITH CHECK to church_memberships UPDATE policy
-- to prevent users from self-promoting to primary_church = true

DROP POLICY IF EXISTS "Users can update their own memberships" ON public.church_memberships;

CREATE POLICY "Users can update their own memberships"
ON public.church_memberships
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND primary_church IS NOT TRUE);