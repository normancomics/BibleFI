ALTER TABLE public.church_tithe_payments
  ADD COLUMN IF NOT EXISTS giver_user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_church_tithe_payments_giver
  ON public.church_tithe_payments(giver_user_id, paid_at DESC);

DROP POLICY IF EXISTS "Givers view own tithe payments" ON public.church_tithe_payments;
CREATE POLICY "Givers view own tithe payments"
  ON public.church_tithe_payments FOR SELECT TO authenticated
  USING (giver_user_id = auth.uid());

DROP POLICY IF EXISTS "Givers record own tithe payments" ON public.church_tithe_payments;
CREATE POLICY "Givers record own tithe payments"
  ON public.church_tithe_payments FOR INSERT TO authenticated
  WITH CHECK (giver_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_my_tithe_payments(p_limit integer DEFAULT 200)
RETURNS TABLE(
  id uuid,
  paid_at timestamptz,
  amount numeric,
  currency text,
  payment_method text,
  status text,
  tx_hash text,
  anonymous boolean,
  church_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.paid_at, p.amount, p.currency, p.payment_method, p.status,
         p.tx_hash, p.anonymous, COALESCE(o.church_name, 'Church tithe')
  FROM public.church_tithe_payments p
  LEFT JOIN public.church_onboarding o ON o.id = p.onboarding_id
  WHERE p.giver_user_id = auth.uid()
  ORDER BY p.paid_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500)
$$;

REVOKE ALL ON FUNCTION public.get_my_tithe_payments(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_tithe_payments(integer) TO authenticated;