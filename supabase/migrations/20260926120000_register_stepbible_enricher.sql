-- Register stepbible-enricher in agent_ops permissions for sandboxed execution.
--
-- This agent enriches EXISTING rows in comprehensive_biblical_texts with
-- original-language text, Strong's numbers and word-level data parsed from
-- STEPBible (CC BY 4.0). It deliberately has no INSERT permission: kjv_text is
-- NOT NULL, so the agent cannot create verses, only augment ones another
-- loader has already seeded.

INSERT INTO agent_ops.agent_permissions (agent_name, allowed_tables, allowed_operations, rate_limit_per_hour, is_active, description)
VALUES (
  'stepbible-enricher',
  ARRAY['comprehensive_biblical_texts'],
  ARRAY['READ', 'UPDATE'],
  60,
  true,
  'Enriches existing verses with Hebrew/Greek text, Strong''s numbers and word-level morphology from STEPBible (CC BY 4.0)'
)
ON CONFLICT (agent_name) DO UPDATE SET
  allowed_tables = EXCLUDED.allowed_tables,
  allowed_operations = EXCLUDED.allowed_operations,
  rate_limit_per_hour = EXCLUDED.rate_limit_per_hour,
  is_active = true,
  description = EXCLUDED.description;
