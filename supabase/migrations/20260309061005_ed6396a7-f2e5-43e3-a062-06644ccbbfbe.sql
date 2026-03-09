-- Drop legacy INSERT policy on global_churches (no ownership check)
DROP POLICY IF EXISTS "Authenticated users can add churches" ON public.global_churches;

-- Drop legacy SELECT policy on church_payment_processors (missing approved status check)
DROP POLICY IF EXISTS "Church admins can view payment processors" ON public.church_payment_processors;

-- Drop legacy INSERT policy on church_payment_processors (missing approved status check)
DROP POLICY IF EXISTS "Church admins can insert payment processors" ON public.church_payment_processors;