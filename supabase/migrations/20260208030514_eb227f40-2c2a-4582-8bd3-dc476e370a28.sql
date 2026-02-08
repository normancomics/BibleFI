
-- Fix: church_payment_processors SELECT should only be for primary church admins, not all members
DROP POLICY IF EXISTS "Authenticated users can view their church payment processors" ON public.church_payment_processors;

CREATE POLICY "Church admins can view payment processors"
ON public.church_payment_processors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM church_memberships
    WHERE church_memberships.church_id = church_payment_processors.church_id
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
  )
);

-- Fix: Consolidate duplicate payment_methods policies
DROP POLICY IF EXISTS "Users can delete own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can update own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can view own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage their payment methods" ON public.payment_methods;

-- Keep only the cleanly named policies (already exist):
-- "Users can delete their own payment methods" (DELETE)
-- "Users can insert their own payment methods" (INSERT)
-- "Users can update their own payment methods" (UPDATE)
-- "Users can view their own payment methods" (SELECT)
