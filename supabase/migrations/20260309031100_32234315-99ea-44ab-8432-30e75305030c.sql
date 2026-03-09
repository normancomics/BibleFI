-- Allow anonymous users to read global_churches (it's a public directory)
-- Only non-sensitive columns are exposed through the api.global_churches view
CREATE POLICY "Anyone can view church directory"
  ON public.global_churches
  FOR SELECT
  TO anon
  USING (true);