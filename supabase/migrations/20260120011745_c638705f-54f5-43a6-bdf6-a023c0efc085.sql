-- =============================================================================
-- Fix Remaining Security Issues (policies already partially applied)
-- =============================================================================

-- 1. FIX: payment_methods - Remove redundant ALL policy
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;

-- Keep only specific policies (they should already exist from previous migrations)
-- Ensure proper SELECT/INSERT/UPDATE/DELETE policies exist
DO $$
BEGIN
  -- Check if specific policies exist, if not create them
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can view their own payment methods') THEN
    EXECUTE 'CREATE POLICY "Users can view their own payment methods" ON public.payment_methods FOR SELECT TO authenticated USING (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can insert their own payment methods') THEN
    EXECUTE 'CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can update their own payment methods') THEN
    EXECUTE 'CREATE POLICY "Users can update their own payment methods" ON public.payment_methods FOR UPDATE TO authenticated USING (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can delete their own payment methods') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods FOR DELETE TO authenticated USING (user_id = auth.uid())';
  END IF;
END $$;

-- 2. FIX: church_reviews - Add DELETE policy if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'church_reviews' AND policyname = 'Users can delete their own reviews') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own reviews" ON public.church_reviews FOR DELETE TO authenticated USING (user_id = auth.uid())';
  END IF;
END $$;

-- 3. FIX: tax_compliance_records - Add soft delete capability (add column if not exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tax_compliance_records') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tax_compliance_records' AND column_name = 'deleted_at') THEN
      ALTER TABLE public.tax_compliance_records ADD COLUMN deleted_at timestamptz DEFAULT NULL;
    END IF;
    
    -- Update SELECT policy to exclude soft-deleted records
    DROP POLICY IF EXISTS "Users can view their own tax records" ON public.tax_compliance_records;
    EXECUTE 'CREATE POLICY "Users can view their own tax records" ON public.tax_compliance_records FOR SELECT TO authenticated USING (user_id = auth.uid() AND deleted_at IS NULL)';
    
    -- Allow soft delete via UPDATE
    DROP POLICY IF EXISTS "Users can soft delete their own tax records" ON public.tax_compliance_records;
    EXECUTE 'CREATE POLICY "Users can soft delete their own tax records" ON public.tax_compliance_records FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;

-- 4. FIX: Consolidate sovereign_agents policies - remove duplicates
DO $$
DECLARE
  policy_record record;
BEGIN
  -- Drop all existing SELECT policies except the ones we want to keep
  FOR policy_record IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'sovereign_agents' 
    AND policyname NOT IN ('Users can view their assigned agents only', 'Service role full access')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sovereign_agents', policy_record.policyname);
  END LOOP;
END $$;