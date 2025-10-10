-- Enhanced Biblical Knowledge Base with Original Languages
CREATE TABLE IF NOT EXISTS public.biblical_original_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  kjv_text text NOT NULL,
  hebrew_text text,
  aramaic_text text,
  greek_text text,
  strong_numbers text[],
  original_words jsonb DEFAULT '[]'::jsonb,
  morphology jsonb,
  financial_relevance integer DEFAULT 0,
  financial_keywords text[],
  defi_keywords text[],
  embedding vector(1536),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(book, chapter, verse)
);

ALTER TABLE public.biblical_original_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Biblical texts are publicly readable"
  ON public.biblical_original_texts FOR SELECT
  TO public USING (true);

-- DeFi Knowledge Base
CREATE TABLE IF NOT EXISTS public.defi_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_name text NOT NULL,
  protocol_type text NOT NULL, -- 'dex', 'lending', 'yield', 'flash_loan', 'arbitrage'
  description text,
  smart_contract_address text,
  chain text DEFAULT 'base',
  documentation_url text,
  security_audit_url text,
  tvl numeric,
  apy numeric,
  risk_level text, -- 'low', 'medium', 'high', 'extreme'
  biblical_principle_id uuid REFERENCES public.biblical_knowledge_base(id),
  strategy_details jsonb,
  code_examples jsonb,
  arbitrage_opportunities jsonb,
  flash_loan_compatible boolean DEFAULT false,
  embedding vector(1536),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.defi_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DeFi knowledge is publicly readable"
  ON public.defi_knowledge_base FOR SELECT
  TO public USING (true);

-- Flash Loan Strategies
CREATE TABLE IF NOT EXISTS public.flash_loan_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_name text NOT NULL,
  description text,
  protocols_involved text[],
  expected_profit_range text,
  risk_assessment text,
  gas_cost_estimate numeric,
  complexity_level text, -- 'beginner', 'intermediate', 'advanced', 'expert'
  code_template text,
  biblical_wisdom_link uuid REFERENCES public.biblical_knowledge_base(id),
  success_rate numeric,
  min_capital_required numeric,
  execution_steps jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.flash_loan_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flash loan strategies are publicly readable"
  ON public.flash_loan_strategies FOR SELECT
  TO public USING (true);

-- Enhanced Global Church Database with Payment Processing
CREATE TABLE IF NOT EXISTS public.church_payment_processors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid REFERENCES public.global_churches(id) ON DELETE CASCADE,
  processor_type text NOT NULL, -- 'crypto', 'fiat', 'card', 'ach', 'wire'
  processor_name text,
  wallet_address text,
  supported_networks text[],
  supported_currencies text[],
  conversion_to_fiat boolean DEFAULT false,
  auto_convert boolean DEFAULT false,
  main_contact_name text,
  main_contact_email text,
  main_contact_phone text,
  tech_contact_name text,
  tech_contact_email text,
  tech_contact_phone text,
  it_department_hours text,
  onboarding_status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
  onboarding_date timestamptz,
  training_completed boolean DEFAULT false,
  tax_exempt_status text, -- '501c3', '508', 'other'
  tax_id text,
  tax_documentation_url text,
  compliance_verified boolean DEFAULT false,
  compliance_verified_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.church_payment_processors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Church payment processors are publicly viewable"
  ON public.church_payment_processors FOR SELECT
  TO public USING (true);

CREATE POLICY "Authenticated users can add payment processors"
  ON public.church_payment_processors FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Cross-Reference Table: Biblical Terms <-> Financial/DeFi Terms
CREATE TABLE IF NOT EXISTS public.biblical_financial_crossref (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  biblical_term text NOT NULL,
  biblical_verse_id uuid REFERENCES public.biblical_knowledge_base(id),
  financial_term text NOT NULL,
  defi_concept text,
  defi_protocol_id uuid REFERENCES public.defi_knowledge_base(id),
  relationship_type text, -- 'analogy', 'principle', 'warning', 'wisdom'
  explanation text,
  practical_application text,
  risk_consideration text,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.biblical_financial_crossref ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Biblical financial crossref is publicly readable"
  ON public.biblical_financial_crossref FOR SELECT
  TO public USING (true);

-- Tax Compliance Documentation
CREATE TABLE IF NOT EXISTS public.tax_compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year integer NOT NULL,
  total_tithes numeric DEFAULT 0,
  total_offerings numeric DEFAULT 0,
  churches jsonb, -- Array of {church_id, amount, date}
  crypto_donations jsonb,
  fiat_donations jsonb,
  tax_deduction_eligible numeric,
  documentation_generated boolean DEFAULT false,
  form_1099_generated boolean DEFAULT false,
  receipt_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tax_compliance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tax records"
  ON public.tax_compliance_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax records"
  ON public.tax_compliance_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax records"
  ON public.tax_compliance_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- MCP AI Context Sessions Enhancement
CREATE TABLE IF NOT EXISTS public.mcp_ai_knowledge_graph (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.mcp_biblical_sessions(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  biblical_references uuid[],
  defi_protocols uuid[],
  flash_loan_strategies uuid[],
  church_recommendations uuid[],
  tax_implications jsonb,
  risk_assessment jsonb,
  wisdom_score integer,
  confidence_score numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mcp_ai_knowledge_graph ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MCP knowledge graph"
  ON public.mcp_ai_knowledge_graph FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM public.mcp_biblical_sessions mbs
    WHERE mbs.id = session_id AND mbs.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_biblical_original_embedding ON public.biblical_original_texts USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_defi_knowledge_embedding ON public.defi_knowledge_base USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_crossref_embedding ON public.biblical_financial_crossref USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_church_processors_church_id ON public.church_payment_processors(church_id);
CREATE INDEX IF NOT EXISTS idx_tax_compliance_user_year ON public.tax_compliance_records(user_id, tax_year);

-- Triggers for updated_at
CREATE TRIGGER update_biblical_original_texts_updated_at
  BEFORE UPDATE ON public.biblical_original_texts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_defi_knowledge_updated_at
  BEFORE UPDATE ON public.defi_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_church_processors_updated_at
  BEFORE UPDATE ON public.church_payment_processors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_compliance_updated_at
  BEFORE UPDATE ON public.tax_compliance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();