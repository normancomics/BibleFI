-- Register spandex-swap-agent in agent_ops permissions for sandboxed execution

INSERT INTO agent_ops.agent_permissions (agent_name, allowed_tables, allowed_operations, rate_limit_per_hour, is_active, description)
VALUES (
  'spandex-swap-agent',
  ARRAY['defi_knowledge_base'],
  ARRAY['INSERT', 'CORRELATE', 'READ'],
  300,
  true,
  'Scores Spandex swap provider quotes with BWTYA heuristics and persists advisory output'
)
ON CONFLICT (agent_name) DO UPDATE SET
  allowed_tables = EXCLUDED.allowed_tables,
  allowed_operations = EXCLUDED.allowed_operations,
  rate_limit_per_hour = EXCLUDED.rate_limit_per_hour,
  is_active = true,
  description = EXCLUDED.description;

