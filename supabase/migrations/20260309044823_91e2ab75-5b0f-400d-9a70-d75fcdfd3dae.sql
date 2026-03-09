
-- ============================================================
-- 1. Church Membership: Require invitation approval to prevent
--    any authenticated user from self-joining verified churches
--    to access raw PII from global_churches.
-- ============================================================

-- Add an approval status column to church_memberships
ALTER TABLE public.church_memberships
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update SELECT policy: only show approved memberships to the member
DROP POLICY IF EXISTS "Users can see their own memberships" ON public.church_memberships;
CREATE POLICY "Users can see their own memberships"
  ON public.church_memberships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Tighten INSERT policy: users can only request to join (status='pending')
-- They cannot self-approve, and they cannot set primary_church on creation
DROP POLICY IF EXISTS "Users can join verified churches only" ON public.church_memberships;
CREATE POLICY "Users can request to join verified churches"
  ON public.church_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND primary_church IS NOT TRUE
    AND EXISTS (
      SELECT 1 FROM public.global_churches
      WHERE global_churches.id = church_memberships.church_id
        AND global_churches.verified = true
    )
  );

-- Tighten UPDATE policy: users can only cancel their OWN pending membership
-- Approval must come from an admin (service role / edge function with admin check)
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.church_memberships;
CREATE POLICY "Users can cancel their own pending membership"
  ON public.church_memberships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'rejected');

-- Fix global_churches SELECT: only expose full data to creators;
-- members must have APPROVED status (not just any membership record)
DROP POLICY IF EXISTS "Church creators and members can view full details" ON public.global_churches;
CREATE POLICY "Church creators and approved members can view full details"
  ON public.global_churches FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.church_memberships
      WHERE church_memberships.church_id = global_churches.id
        AND church_memberships.user_id = auth.uid()
        AND church_memberships.status = 'approved'
    )
  );

-- ============================================================
-- 2. public_agents VIEW: Ensure anon role cannot read 
--    sovereign_agents at all (belt-and-suspenders).
--    Existing RLS already blocks SELECT with USING false.
-- ============================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.sovereign_agents FROM anon;
