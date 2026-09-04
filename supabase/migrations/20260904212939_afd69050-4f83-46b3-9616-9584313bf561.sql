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
    AND created_at > now() - interval '1 hour'
    AND error_message IS NULL;

  IF v_recent_count >= v_rate_limit THEN
    INSERT INTO agent_ops.audit_log (agent_name, operation, target_table, target_schema, error_message)
    VALUES (p_agent_name, p_operation, p_target_table, 'public', 'RATE LIMITED');
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION agent_ops.check_agent_permission(p_agent_name text, p_operation text, p_target_table text)
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
    AND created_at > now() - interval '1 hour'
    AND error_message IS NULL;

  IF v_recent_count >= v_rate_limit THEN
    INSERT INTO agent_ops.audit_log (agent_name, operation, target_table, target_schema, error_message)
    VALUES (p_agent_name, p_operation, p_target_table, 'public', 'RATE LIMITED');
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;