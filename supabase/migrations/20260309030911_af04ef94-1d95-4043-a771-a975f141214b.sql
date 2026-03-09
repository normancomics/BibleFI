-- Grant SELECT on api.global_churches view to anon and authenticated roles
-- This allows the church search to work for all users
GRANT SELECT ON api.global_churches TO anon;
GRANT SELECT ON api.global_churches TO authenticated;