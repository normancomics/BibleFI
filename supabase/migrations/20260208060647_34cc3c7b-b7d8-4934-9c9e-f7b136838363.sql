
-- Grant insert/update permissions on api.global_churches view to service_role and authenticated
GRANT INSERT, UPDATE ON api.global_churches TO service_role;
GRANT INSERT, UPDATE ON api.global_churches TO authenticated;

-- Also grant execute on the trigger functions
GRANT EXECUTE ON FUNCTION api.insert_global_church() TO service_role;
GRANT EXECUTE ON FUNCTION api.update_global_church() TO service_role;
GRANT EXECUTE ON FUNCTION api.insert_global_church() TO authenticated;
GRANT EXECUTE ON FUNCTION api.update_global_church() TO authenticated;
