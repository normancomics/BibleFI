
-- Fix column names in gateway functions
CREATE OR REPLACE FUNCTION api.start_agent_run(
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
  SELECT EXISTS(
    SELECT 1 FROM agent_ops.agent_permissions 
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
$$;

CREATE OR REPLACE FUNCTION api.complete_agent_run(
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
      completed_at = now(),
      records_processed = p_records_processed,
      records_created = p_records_created,
      records_updated = p_records_updated,
      records_failed = p_records_failed,
      error_details = p_error_details
  WHERE id = p_run_id;
END;
$$;
