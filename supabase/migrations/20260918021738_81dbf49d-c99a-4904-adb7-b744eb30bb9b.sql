CREATE TABLE IF NOT EXISTS public.wisdom_strategy_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text,
  strategy_name text NOT NULL,
  chain_id integer NOT NULL,
  vault_address text NOT NULL,
  principal numeric(20,6) NOT NULL DEFAULT 0,
  token_symbol text NOT NULL DEFAULT 'USDC',
  verse_hash text,
  deposit_tx text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wisdom_positions_user ON public.wisdom_strategy_positions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.wisdom_yield_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  position_id uuid REFERENCES public.wisdom_strategy_positions(id) ON DELETE SET NULL,
  strategy_name text NOT NULL,
  gross_yield numeric(20,6) NOT NULL DEFAULT 0,
  tithe_amount numeric(20,6) NOT NULL DEFAULT 0,
  net_yield numeric(20,6) NOT NULL DEFAULT 0,
  token_symbol text NOT NULL DEFAULT 'USDC',
  tx_hash text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wisdom_yield_events_user ON public.wisdom_yield_events(user_id, occurred_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.wisdom_strategy_positions TO authenticated;
GRANT ALL ON public.wisdom_strategy_positions TO service_role;
GRANT SELECT, INSERT ON public.wisdom_yield_events TO authenticated;
GRANT ALL ON public.wisdom_yield_events TO service_role;

ALTER TABLE public.wisdom_strategy_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wisdom_yield_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stewards view own strategy positions" ON public.wisdom_strategy_positions;
CREATE POLICY "Stewards view own strategy positions" ON public.wisdom_strategy_positions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Stewards record own strategy positions" ON public.wisdom_strategy_positions;
CREATE POLICY "Stewards record own strategy positions" ON public.wisdom_strategy_positions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Stewards update own strategy positions" ON public.wisdom_strategy_positions;
CREATE POLICY "Stewards update own strategy positions" ON public.wisdom_strategy_positions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Stewards view own yield events" ON public.wisdom_yield_events;
CREATE POLICY "Stewards view own yield events" ON public.wisdom_yield_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Stewards record own yield events" ON public.wisdom_yield_events;
CREATE POLICY "Stewards record own yield events" ON public.wisdom_yield_events
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());