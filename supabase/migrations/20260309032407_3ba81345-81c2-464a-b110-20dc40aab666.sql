-- Remove the overly permissive anon SELECT policy that exposes raw PII
-- Public access should go through the masked public_church_directory view instead
DROP POLICY IF EXISTS "Anyone can view church directory" ON public.global_churches;