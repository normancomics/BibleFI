-- Fix 1: Restrict global_churches SELECT to owners and approved members only
-- Authenticated users should use public_church_directory for browsing
DROP POLICY IF EXISTS "Authenticated users can view churches" ON public.global_churches;

CREATE POLICY "Creators and approved members can view full details"
ON public.global_churches
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE church_memberships.church_id = global_churches.id
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.status = 'approved'
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Fix 2: Remove the overly broad INSERT policy on church_payment_processors
DROP POLICY IF EXISTS "Authenticated users can add payment processors" ON public.church_payment_processors;
