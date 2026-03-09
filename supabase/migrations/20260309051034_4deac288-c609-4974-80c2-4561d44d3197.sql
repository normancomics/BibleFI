-- Fix 1: Remove last_updated_by from UPDATE policy (privilege escalation)
DROP POLICY IF EXISTS "Church creators can update" ON public.global_churches;
CREATE POLICY "Church creators can update"
ON public.global_churches
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Fix 2: Add public SELECT policy so anonymous users can search churches
-- Drop the current restrictive policy first
DROP POLICY IF EXISTS "Church creators and approved members can view full details" ON public.global_churches;

-- Public can view basic church directory info (public directory like Yellow Pages)
CREATE POLICY "Public can view church directory"
ON public.global_churches
FOR SELECT
USING (true);

-- Fix 3: Create a view for church reviews that masks user_id
CREATE OR REPLACE VIEW public.public_church_reviews AS
SELECT 
  id,
  church_id,
  rating,
  review_text,
  helpful_count,
  created_at
FROM public.church_reviews;

-- Grant access to the view
GRANT SELECT ON public.public_church_reviews TO anon, authenticated;
