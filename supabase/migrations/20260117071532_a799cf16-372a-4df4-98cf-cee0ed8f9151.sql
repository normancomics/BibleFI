-- Fix the overly permissive INSERT policy on churches table
DROP POLICY IF EXISTS "Users can add churches" ON public.churches;

-- Create a proper policy that requires authentication
CREATE POLICY "Authenticated users can add churches"
ON public.churches
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = created_by
);