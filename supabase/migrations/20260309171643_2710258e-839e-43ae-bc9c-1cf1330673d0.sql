-- Drop the overly permissive SELECT policy
DROP POLICY "Church reviews are viewable by authenticated users" ON public.church_reviews;

-- Users can only view their own reviews
CREATE POLICY "Users can view their own reviews"
  ON public.church_reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());