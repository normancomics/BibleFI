
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Global churches are publicly viewable" ON public.global_churches;

-- Only authenticated (wallet-connected) users can view churches
CREATE POLICY "Authenticated users can view churches"
ON public.global_churches
FOR SELECT
TO authenticated
USING (true);
