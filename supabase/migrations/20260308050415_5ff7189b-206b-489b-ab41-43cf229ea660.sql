-- Fix api.check_agent_permission to use correct column name
CREATE OR REPLACE FUNCTION api.check_agent_permission(p_agent_name text, p_operation text, p_target_table text)
RETURNS boolean
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

-- Also fix api.get_agent_stats
CREATE OR REPLACE FUNCTION api.get_agent_stats()
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
        FROM agent_ops.run_history ORDER BY started_at DESC LIMIT 10
      ) r
    ),
    'agents', (
      SELECT coalesce(jsonb_agg(row_to_json(a)), '[]'::jsonb)
      FROM (
        SELECT agent_name, allowed_tables, allowed_operations, rate_limit_per_hour, is_active
        FROM agent_ops.agent_permissions ORDER BY agent_name
      ) a
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$function$;