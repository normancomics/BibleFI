-- Fix 1: Prevent privilege escalation via church_memberships
-- Drop the existing INSERT policy and recreate with primary_church restriction
DROP POLICY IF EXISTS "Users can add their own memberships" ON public.church_memberships;

CREATE POLICY "Users can add their own memberships"
ON public.church_memberships
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND primary_church IS NOT TRUE
);

-- Fix 2: Restrict church_reviews SELECT to authenticated users only
DROP POLICY IF EXISTS "Church reviews are publicly viewable" ON public.church_reviews;

CREATE POLICY "Church reviews are viewable by authenticated users"
ON public.church_reviews
FOR SELECT
TO authenticated
USING (true);