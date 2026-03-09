-- Fix: global_churches INSERT must enforce created_by = auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create churches" ON public.global_churches;

CREATE POLICY "Authenticated users can create churches"
ON public.global_churches
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = created_by
);