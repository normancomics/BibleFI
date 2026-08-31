CREATE TABLE public.church_onboarding (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  church_name text NOT NULL,
  denomination text,
  address text,
  city text NOT NULL,
  state_province text,
  country text NOT NULL,
  postal_code text,
  website text,
  pastor_name text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  wallet_address text,
  preferred_currencies text[] NOT NULL DEFAULT ARRAY['USDC']::text[],
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_onboarding TO authenticated;
GRANT ALL ON public.church_onboarding TO service_role;
ALTER TABLE public.church_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own church applications"
  ON public.church_onboarding FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all church applications"
  ON public.church_onboarding FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update all church applications"
  ON public.church_onboarding FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_church_onboarding_updated_at
  BEFORE UPDATE ON public.church_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.church_nfc_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id uuid NOT NULL REFERENCES public.church_onboarding(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 100,
  logo_url text,
  design_notes text,
  shipping_address text,
  status text NOT NULL DEFAULT 'requested',
  tracking_number text,
  activated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_nfc_cards TO authenticated;
GRANT ALL ON public.church_nfc_cards TO service_role;
ALTER TABLE public.church_nfc_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Church owners manage own card orders"
  ON public.church_nfc_cards FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.church_onboarding o
    WHERE o.id = onboarding_id AND o.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.church_onboarding o
    WHERE o.id = onboarding_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage all card orders"
  ON public.church_nfc_cards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_church_nfc_cards_updated_at
  BEFORE UPDATE ON public.church_nfc_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.church_tithe_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id uuid NOT NULL REFERENCES public.church_onboarding(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC',
  payment_method text NOT NULL DEFAULT 'crypto',
  tx_hash text,
  donor_display_name text,
  anonymous boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'completed',
  paid_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.church_tithe_payments TO authenticated;
GRANT ALL ON public.church_tithe_payments TO service_role;
ALTER TABLE public.church_tithe_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Church owners view own tithe payments"
  ON public.church_tithe_payments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.church_onboarding o
    WHERE o.id = onboarding_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage all tithe payments"
  ON public.church_tithe_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_church_tithe_payments_onboarding ON public.church_tithe_payments(onboarding_id, paid_at DESC);
CREATE INDEX idx_church_onboarding_user ON public.church_onboarding(user_id);

CREATE TRIGGER update_church_tithe_payments_updated_at
  BEFORE UPDATE ON public.church_tithe_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();