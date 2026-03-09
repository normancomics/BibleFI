-- Fix: Restrict global_churches SELECT to authenticated only
-- Anonymous users should use the public_church_directory view instead
DROP POLICY IF EXISTS "Public can view church directory" ON public.global_churches;

-- Authenticated users can view full church details
CREATE POLICY "Authenticated users can view churches"
ON public.global_churches
FOR SELECT
TO authenticated
USING (true);
