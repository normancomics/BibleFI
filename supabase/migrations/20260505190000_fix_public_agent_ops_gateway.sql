-- Fix public agent_ops gateway functions to match agent_ops schema
-- (run_history.run_metadata + completed_at; agent_permissions.rate_limit_per_hour)

CREATE OR REPLACE FUNCTION public.start_agent_run(
  p_agent_name text,
  p_run_mode text DEFAULT 'scheduled',
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_run_id uuid;
  v_allowed boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM agent_ops.agent_permissions
    WHERE agent_name = p_agent_name AND is_active = true
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Agent % is not registered or inactive', p_agent_name;
  END IF;

  INSERT INTO agent_ops.run_history (agent_name, run_mode, run_metadata, status)
  VALUES (p_agent_name, p_run_mode, p_metadata, 'running')
  RETURNING id INTO v_run_id;

  RETURN v_run_id;
END;
$function$;

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
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE agent_ops.run_history
  SET status = p_status,
      completed_at = now(),
      records_processed = p_records_processed,
      records_created = p_records_created,
      records_updated = p_records_updated,
      records_failed = p_records_failed,
      error_details = p_error_details
  WHERE id = p_run_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_agent_permission(
  p_agent_name text,
  p_operation text,
  p_target_table text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_allowed boolean;
  v_rate_limit int;
  v_recent_count int;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM agent_ops.agent_permissions
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

  SELECT rate_limit_per_hour INTO v_rate_limit
  FROM agent_ops.agent_permissions
  WHERE agent_name = p_agent_name AND is_active = true
  LIMIT 1;

  SELECT count(*) INTO v_recent_count
  FROM agent_ops.audit_log
  WHERE agent_name = p_agent_name
    AND created_at > now() - interval '1 hour';

  IF v_recent_count >= v_rate_limit THEN
    INSERT INTO agent_ops.audit_log (agent_name, operation, target_table, target_schema, error_message)
    VALUES (p_agent_name, p_operation, p_target_table, 'public', 'RATE LIMITED');
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_agent_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
        SELECT agent_name, status, started_at, completed_at, records_processed, records_created
        FROM agent_ops.run_history
        ORDER BY started_at DESC
        LIMIT 10
      ) r
    ),
    'agents', (
      SELECT coalesce(jsonb_agg(row_to_json(a)), '[]'::jsonb)
      FROM (
        SELECT agent_name, allowed_tables, allowed_operations, rate_limit_per_hour, is_active
        FROM agent_ops.agent_permissions
        ORDER BY agent_name
      ) a
    )
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

