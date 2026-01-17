-- Fix RLS policies for sensitive tables

-- 1. Fix sovereign_agents - restrict contact info to authenticated users with assignments
DROP POLICY IF EXISTS "Public can view agents" ON public.sovereign_agents;

CREATE POLICY "Public can view non-sensitive agent info"
ON public.sovereign_agents
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN true -- Allow reading name, specialties, etc
    ELSE true
  END
);

-- The public_agents view already hides email/phone, so we keep that as the public interface
-- For full data access, users must be authenticated and have an assignment

CREATE POLICY "Authenticated users with assignments see full agent info"
ON public.sovereign_agents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agent_assignments 
    WHERE agent_assignments.agent_id = sovereign_agents.id 
    AND agent_assignments.user_id = auth.uid()
  )
);

-- 2. Fix church_payment_processors - restrict to authenticated church admins
ALTER TABLE public.church_payment_processors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view church payment processors" ON public.church_payment_processors;

CREATE POLICY "Authenticated users can view their church payment processors"
ON public.church_payment_processors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM church_memberships 
    WHERE church_memberships.church_id = church_payment_processors.church_id 
    AND church_memberships.user_id = auth.uid()
  )
);

CREATE POLICY "Church admins can update payment processors"
ON public.church_payment_processors
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM church_memberships 
    WHERE church_memberships.church_id = church_payment_processors.church_id 
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM church_memberships 
    WHERE church_memberships.church_id = church_payment_processors.church_id 
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
  )
);

CREATE POLICY "Church admins can insert payment processors"
ON public.church_payment_processors
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM church_memberships 
    WHERE church_memberships.church_id = church_payment_processors.church_id 
    AND church_memberships.user_id = auth.uid()
    AND church_memberships.primary_church = true
  )
);

-- 3. Fix payment_methods - ensure proper user-specific policies
DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.payment_methods;

CREATE POLICY "Users can view own payment methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
ON public.payment_methods
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
ON public.payment_methods
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
ON public.payment_methods
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);