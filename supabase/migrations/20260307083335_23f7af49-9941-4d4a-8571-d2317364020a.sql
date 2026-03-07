
-- ============================================================
-- AGENT SANDBOX: Dedicated schema, audit logging, scoped gateway functions
-- ============================================================

-- 1. Create dedicated agent_ops schema
CREATE SCHEMA IF NOT EXISTS agent_ops;

-- 2. Comprehensive audit log table
CREATE TABLE agent_ops.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('READ', 'INSERT', 'UPDATE', 'DELETE', 'SCAN', 'SEED', 'VALIDATE', 'CORRELATE')),
  target_table text NOT NULL,
  target_schema text NOT NULL DEFAULT 'public',
  record_ids uuid[] DEFAULT '{}',
  records_affected integer DEFAULT 0,
  input_summary jsonb DEFAULT '{}',
  output_summary jsonb DEFAULT '{}',
  error_message text,
  execution_time_ms integer,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_audit_log_agent ON agent_ops.audit_log(agent_name, created_at DESC);
CREATE INDEX idx_audit_log_operation ON agent_ops.audit_log(operation, created_at DESC);
CREATE INDEX idx_audit_log_target ON agent_ops.audit_log(target_table, created_at DESC);

-- 3. Agent permissions registry: defines what each agent can access
CREATE TABLE agent_ops.agent_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL UNIQUE,
  allowed_tables text[] NOT NULL DEFAULT '{}',
  allowed_operations text[] NOT NULL DEFAULT '{READ}',
  max_records_per_run integer DEFAULT 500,
  rate_limit_per_hour integer DEFAULT 60,
  is_active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Agent run history for tracking scheduled executions
CREATE TABLE agent_ops.run_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  run_mode text NOT NULL DEFAULT 'scheduled',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'rate_limited')),
  records_processed integer DEFAULT 0,
  records_created integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_details jsonb,
  run_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_run_history_agent ON agent_ops.run_history(agent_name, started_at DESC);

-- 5. Seed agent permissions with scoped access
INSERT INTO agent_ops.agent_permissions (agent_name, allowed_tables, allowed_operations, max_records_per_run, rate_limit_per_hour, description)
VALUES
  ('scripture-financial-scanner', 
   ARRAY['biblical_knowledge_base', 'comprehensive_biblical_texts', 'bible_verses', 'biblical_original_texts', 'strongs_concordance'],
   ARRAY['READ', 'INSERT', 'UPDATE', 'SCAN'],
   1000, 30,
   'Scans scripture for financial terms and seeds the biblical knowledge base'),
  ('church-data-validator',
   ARRAY['global_churches', 'church_payment_processors'],
   ARRAY['READ', 'UPDATE', 'VALIDATE'],
   500, 10,
   'Validates church records for data integrity and security threats'),
  ('church-seeder-agent',
   ARRAY['global_churches'],
   ARRAY['READ', 'INSERT', 'SEED'],
   200, 6,
   'Seeds new churches from external sources like OpenStreetMap'),
  ('defi-market-watchdog',
   ARRAY['defi_knowledge_base', 'currency_rates', 'biblical_knowledge_base'],
   ARRAY['READ', 'INSERT', 'UPDATE', 'CORRELATE'],
   500, 120,
   'Monitors Base chain DeFi protocols and correlates with Biblical wisdom'),
  ('biblical-wisdom-expander',
   ARRAY['biblical_knowledge_base', 'comprehensive_biblical_texts', 'biblical_financial_crossref', 'strongs_concordance'],
   ARRAY['READ', 'INSERT', 'UPDATE', 'SCAN'],
   2000, 30,
   'Expands biblical wisdom database across all 66 books'),
  ('market-wisdom-correlator',
   ARRAY['defi_knowledge_base', 'biblical_knowledge_base', 'currency_rates', 'flash_loan_strategies'],
   ARRAY['READ', 'INSERT', 'CORRELATE'],
   500, 80,
   'Correlates live market conditions with Biblical wisdom principles');

-- 6. SECURITY DEFINER gateway: Log and validate all agent operations
CREATE OR REPLACE FUNCTION agent_ops.log_agent_operation(
  p_agent_name text,
  p_operation text,
  p_target_table text,
  p_target_schema text DEFAULT 'public',
  p_record_ids uuid[] DEFAULT '{}',
  p_records_affected integer DEFAULT 0,
  p_input_summary jsonb DEFAULT '{}',
  p_output_summary jsonb DEFAULT '{}',
  p_error_message text DEFAULT NULL,
  p_execution_time_ms integer DEFAULT 0,
  p_ip_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = agent_ops, public
AS $$
DECLARE
  v_log_id uuid;
  v_allowed boolean;
BEGIN
  -- Verify agent has permission for this operation on this table
  SELECT EXISTS (
    SELECT 1 FROM agent_ops.agent_permissions
    WHERE agent_name = p_agent_name
      AND is_active = true
      AND p_target_table = ANY(allowed_tables)
      AND p_operation = ANY(allowed_operations)
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    -- Log the unauthorized attempt anyway
    INSERT INTO agent_ops.audit_log (
      agent_name, operation, target_table, target_schema,
      error_message, ip_address
    ) VALUES (
      p_agent_name, p_operation, p_target_table, p_target_schema,
      'UNAUTHORIZED: Agent does not have permission for this operation',
      p_ip_address
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
  END IF;

  -- Log the authorized operation
  INSERT INTO agent_ops.audit_log (
    agent_name, operation, target_table, target_schema,
    record_ids, records_affected, input_summary, output_summary,
    error_message, execution_time_ms, ip_address
  ) VALUES (
    p_agent_name, p_operation, p_target_table, p_target_schema,
    p_record_ids, p_records_affected, p_input_summary, p_output_summary,
    p_error_message, p_execution_time_ms, p_ip_address
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 7. SECURITY DEFINER gateway: Check if agent is allowed before data access
CREATE OR REPLACE FUNCTION agent_ops.check_agent_permission(
  p_agent_name text,
  p_operation text,
  p_target_table text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = agent_ops, public
AS $$
DECLARE
  v_allowed boolean;
  v_rate_ok boolean;
  v_max_rate integer;
  v_current_count integer;
BEGIN
  -- Check permission exists
  SELECT 
    is_active AND p_target_table = ANY(allowed_tables) AND p_operation = ANY(allowed_operations),
    rate_limit_per_hour
  INTO v_allowed, v_max_rate
  FROM agent_ops.agent_permissions
  WHERE agent_name = p_agent_name;

  IF v_allowed IS NULL OR NOT v_allowed THEN
    RETURN false;
  END IF;

  -- Check rate limit
  SELECT COUNT(*) INTO v_current_count
  FROM agent_ops.audit_log
  WHERE agent_name = p_agent_name
    AND created_at > now() - interval '1 hour';

  IF v_current_count >= v_max_rate THEN
    -- Log rate limit hit
    INSERT INTO agent_ops.audit_log (
      agent_name, operation, target_table,
      error_message
    ) VALUES (
      p_agent_name, p_operation, p_target_table,
      format('RATE_LIMITED: %s/%s requests in last hour', v_current_count, v_max_rate)
    );
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- 8. SECURITY DEFINER: Start agent run (returns run_id)
CREATE OR REPLACE FUNCTION agent_ops.start_agent_run(
  p_agent_name text,
  p_run_mode text DEFAULT 'scheduled',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = agent_ops, public
AS $$
DECLARE
  v_run_id uuid;
  v_is_active boolean;
BEGIN
  -- Check agent is active
  SELECT is_active INTO v_is_active
  FROM agent_ops.agent_permissions
  WHERE agent_name = p_agent_name;

  IF v_is_active IS NULL OR NOT v_is_active THEN
    RAISE EXCEPTION 'Agent % is not active or does not exist', p_agent_name;
  END IF;

  INSERT INTO agent_ops.run_history (agent_name, run_mode, run_metadata)
  VALUES (p_agent_name, p_run_mode, p_metadata)
  RETURNING id INTO v_run_id;

  RETURN v_run_id;
END;
$$;

-- 9. SECURITY DEFINER: Complete agent run
CREATE OR REPLACE FUNCTION agent_ops.complete_agent_run(
  p_run_id uuid,
  p_status text DEFAULT 'completed',
  p_records_processed integer DEFAULT 0,
  p_records_created integer DEFAULT 0,
  p_records_updated integer DEFAULT 0,
  p_records_failed integer DEFAULT 0,
  p_error_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = agent_ops, public
AS $$
BEGIN
  UPDATE agent_ops.run_history
  SET 
    completed_at = now(),
    status = p_status,
    records_processed = p_records_processed,
    records_created = p_records_created,
    records_updated = p_records_updated,
    records_failed = p_records_failed,
    error_details = p_error_details
  WHERE id = p_run_id;
END;
$$;

-- 10. SECURITY DEFINER: Get agent stats for dashboard
CREATE OR REPLACE FUNCTION agent_ops.get_agent_stats(p_agent_name text DEFAULT NULL)
RETURNS TABLE (
  agent_name text,
  total_runs bigint,
  successful_runs bigint,
  failed_runs bigint,
  total_records_processed bigint,
  total_records_created bigint,
  last_run_at timestamptz,
  last_run_status text,
  ops_last_hour bigint,
  rate_limit integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = agent_ops, public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.agent_name,
    COALESCE(COUNT(rh.id), 0)::bigint as total_runs,
    COALESCE(COUNT(rh.id) FILTER (WHERE rh.status = 'completed'), 0)::bigint as successful_runs,
    COALESCE(COUNT(rh.id) FILTER (WHERE rh.status = 'failed'), 0)::bigint as failed_runs,
    COALESCE(SUM(rh.records_processed), 0)::bigint as total_records_processed,
    COALESCE(SUM(rh.records_created), 0)::bigint as total_records_created,
    MAX(rh.started_at) as last_run_at,
    (SELECT status FROM agent_ops.run_history rh2 
     WHERE rh2.agent_name = ap.agent_name 
     ORDER BY rh2.started_at DESC LIMIT 1) as last_run_status,
    (SELECT COUNT(*) FROM agent_ops.audit_log al 
     WHERE al.agent_name = ap.agent_name 
     AND al.created_at > now() - interval '1 hour')::bigint as ops_last_hour,
    ap.rate_limit_per_hour as rate_limit,
    ap.is_active
  FROM agent_ops.agent_permissions ap
  LEFT JOIN agent_ops.run_history rh ON rh.agent_name = ap.agent_name
  WHERE (p_agent_name IS NULL OR ap.agent_name = p_agent_name)
  GROUP BY ap.agent_name, ap.rate_limit_per_hour, ap.is_active;
END;
$$;

-- 11. Auto-cleanup: purge audit logs older than 90 days
CREATE OR REPLACE FUNCTION agent_ops.cleanup_old_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = agent_ops
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM agent_ops.audit_log WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  DELETE FROM agent_ops.run_history WHERE created_at < now() - interval '180 days';
  
  RETURN v_deleted;
END;
$$;
