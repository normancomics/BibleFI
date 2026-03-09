-- Fix privilege escalation: church_payment_processors policies must require approved membership
-- Drop existing vulnerable policies
DROP POLICY IF EXISTS "Church payment info viewable by members" ON public.church_payment_processors;
DROP POLICY IF EXISTS "Church admins can add payment processors" ON public.church_payment_processors;
DROP POLICY IF EXISTS "Church admins can update payment processors" ON public.church_payment_processors;

-- Recreate with approved membership requirement
CREATE POLICY "Church payment info viewable by approved members"
ON public.church_payment_processors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE church_memberships.church_id = church_payment_processors.church_id
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
    AND church_memberships.status = 'approved'
  )
  OR EXISTS (
    SELECT 1 FROM public.global_churches
    WHERE global_churches.id = church_payment_processors.church_id
    AND global_churches.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Church admins can add payment processors"
ON public.church_payment_processors
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE church_memberships.church_id = church_payment_processors.church_id
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
    AND church_memberships.status = 'approved'
  )
  OR EXISTS (
    SELECT 1 FROM public.global_churches
    WHERE global_churches.id = church_payment_processors.church_id
    AND global_churches.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Church admins can update payment processors"
ON public.church_payment_processors
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE church_memberships.church_id = church_payment_processors.church_id
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
    AND church_memberships.status = 'approved'
  )
  OR EXISTS (
    SELECT 1 FROM public.global_churches
    WHERE global_churches.id = church_payment_processors.church_id
    AND global_churches.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.church_memberships
    WHERE church_memberships.church_id = church_payment_processors.church_id
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
    AND church_memberships.status = 'approved'
  )
  OR EXISTS (
    SELECT 1 FROM public.global_churches
    WHERE global_churches.id = church_payment_processors.church_id
    AND global_churches.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Also fix church_memberships UPDATE policy to prevent primary_church manipulation
DROP POLICY IF EXISTS "Users can cancel their own pending memberships" ON public.church_memberships;

CREATE POLICY "Users can cancel their own pending memberships"
ON public.church_memberships
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND status = 'pending'
)
WITH CHECK (
  user_id = auth.uid()
  AND status = 'rejected'
  AND primary_church = false
);