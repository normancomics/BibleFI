
-- Move agent_ops gateway functions to public schema so PostgREST can access them
-- Drop the agent_ops versions if they exist (they may have failed to create properly)

-- 1. start_agent_run - returns run_id
CREATE OR REPLACE FUNCTION public.start_agent_run(
  p_agent_name text,
  p_run_mode text DEFAULT 'scheduled',
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run_id uuid;
  v_allowed boolean;
BEGIN
  -- Check agent exists in permissions
  SELECT EXISTS(
    SELECT 1 FROM agent_ops.agent_permissions 
    WHERE agent_name = p_agent_name AND is_active = true
  ) INTO v_allowed;
  
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Agent % is not registered or inactive', p_agent_name;
  END IF;

  INSERT INTO agent_ops.run_history (agent_name, run_mode, metadata, status)
  VALUES (p_agent_name, p_run_mode, p_metadata, 'running')
  RETURNING id INTO v_run_id;
  
  RETURN v_run_id;
END;
$$;

-- 2. check_agent_permission
CREATE OR REPLACE FUNCTION public.check_agent_permission(
  p_agent_name text,
  p_operation text,
  p_target_table text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed boolean;
  v_rate_limit int;
  v_recent_count int;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM agent_ops.agent_permissions
    WHERE agent_name = p_agent_name
      AND is_active = true
      AND p_target_table = ANY(allowed_tables)
      AND p_operation = ANY(allowed_operations)
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    INSERT INTO agent_ops.audit_log (agent_name, operation, target_table, target_schema, error_message)
    VALUES (p_agent_name, p_operation, p_target_table, 'public', 'PERMISSION DENIED');
    RETURN false;
  END IF;

  -- Rate limit check
  SELECT rate_limit_per_minute INTO v_rate_limit
  FROM agent_ops.agent_permissions
  WHERE agent_name = p_agent_name AND is_active = true
  LIMIT 1;

  SELECT count(*) INTO v_recent_count
  FROM agent_ops.audit_log
  WHERE agent_name = p_agent_name
    AND created_at > now() - interval '1 minute';

  IF v_recent_count >= v_rate_limit THEN
    INSERT INTO agent_ops.audit_log (agent_name, operation, target_table, target_schema, error_message)
    VALUES (p_agent_name, p_operation, p_target_table, 'public', 'RATE LIMITED');
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- 3. log_agent_operation
CREATE OR REPLACE FUNCTION public.log_agent_operation(
  p_agent_name text,
  p_operation text,
  p_target_table text,
  p_target_schema text DEFAULT 'public',
  p_record_ids uuid[] DEFAULT '{}',
  p_records_affected int DEFAULT 0,
  p_input_summary jsonb DEFAULT '{}',
  p_output_summary jsonb DEFAULT '{}',
  p_error_message text DEFAULT NULL,
  p_execution_time_ms int DEFAULT 0,
  p_ip_address text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO agent_ops.audit_log (
    agent_name, operation, target_table, target_schema,
    record_ids, records_affected, input_summary, output_summary,
    error_message, execution_time_ms, ip_address
  ) VALUES (
    p_agent_name, p_operation, p_target_table, p_target_schema,
    p_record_ids, p_records_affected, p_input_summary, p_output_summary,
    p_error_message, p_execution_time_ms, p_ip_address
  );
END;
$$;

-- 4. complete_agent_run
CREATE OR REPLACE FUNCTION public.complete_agent_run(
  p_run_id uuid,
  p_status text DEFAULT 'completed',
  p_records_processed int DEFAULT 0,
  p_records_created int DEFAULT 0,
  p_records_updated int DEFAULT 0,
  p_records_failed int DEFAULT 0,
  p_error_details jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE agent_ops.run_history
  SET status = p_status,
      ended_at = now(),
      records_processed = p_records_processed,
      records_created = p_records_created,
      records_updated = p_records_updated,
      records_failed = p_records_failed,
      error_details = p_error_details
  WHERE id = p_run_id;
END;
$$;

-- 5. get_agent_stats
CREATE OR REPLACE FUNCTION public.get_agent_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_runs', (SELECT count(*) FROM agent_ops.run_history),
    'completed_runs', (SELECT count(*) FROM agent_ops.run_history WHERE status = 'completed'),
    'failed_runs', (SELECT count(*) FROM agent_ops.run_history WHERE status = 'failed'),
    'total_audit_entries', (SELECT count(*) FROM agent_ops.audit_log),
    'recent_runs', (
      SELECT coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb)
      FROM (
        SELECT agent_name, status, started_at, ended_at, records_processed, records_created
        FROM agent_ops.run_history ORDER BY started_at DESC LIMIT 10
      ) r
    ),
    'agents', (
      SELECT coalesce(jsonb_agg(row_to_json(a)), '[]'::jsonb)
      FROM (
        SELECT agent_name, allowed_tables, allowed_operations, rate_limit_per_minute, is_active
        FROM agent_ops.agent_permissions ORDER BY agent_name
      ) a
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;
