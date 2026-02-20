-- Add DELETE policy for global_churches - only creators can delete
CREATE POLICY "Church creators can delete"
ON public.global_churches
FOR DELETE
USING (auth.uid() = created_by);