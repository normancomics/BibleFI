-- Enum for attestation class
DO $$ BEGIN
  CREATE TYPE public.attestation_class AS ENUM ('A_theological', 'B_ministry', 'C_creator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.x402_execution_status AS ENUM ('signed', 'executed', 'expired', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.theological_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attester_name text NOT NULL,
  attester_address text NOT NULL,
  attestation_class public.attestation_class NOT NULL,
  pool_name text NOT NULL,
  strategy_id text NOT NULL,
  scripture_reference text NOT NULL,
  rationale text NOT NULL,
  weight numeric NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  revoked_at timestamptz,
  revoked_reason text,
  attestation_hash text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attest_pool_strategy
  ON public.theological_attestations (pool_name, strategy_id)
  WHERE revoked = false;

ALTER TABLE public.theological_attestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active attestations"
  ON public.theological_attestations FOR SELECT
  USING (revoked = false);

CREATE POLICY "Admins can insert attestations"
  ON public.theological_attestations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update attestations"
  ON public.theological_attestations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_theo_attest_updated
  BEFORE UPDATE ON public.theological_attestations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.x402_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_wallet text NOT NULL,
  pool_name text NOT NULL,
  strategy_id text NOT NULL,
  amount_wei text NOT NULL,
  reasoning text NOT NULL,
  x402_payment_hash text NOT NULL,
  x402_amount_usdc numeric NOT NULL,
  attestation_id uuid REFERENCES public.theological_attestations(id),
  attestation_hash text NOT NULL,
  gateway_signature text NOT NULL,
  permit_deadline timestamptz NOT NULL,
  status public.x402_execution_status NOT NULL DEFAULT 'signed',
  onchain_tx_hash text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_x402_user ON public.x402_executions (user_wallet, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_x402_status ON public.x402_executions (status, created_at DESC);

ALTER TABLE public.x402_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own executions"
  ON public.x402_executions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all executions"
  ON public.x402_executions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_x402_exec_updated
  BEFORE UPDATE ON public.x402_executions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();