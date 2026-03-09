-- Register new subagents in agent_ops.agent_permissions

INSERT INTO agent_ops.agent_permissions (agent_name, allowed_tables, allowed_operations, rate_limit_per_hour, is_active)
VALUES 
  ('scripture-integrity-validator', 
   ARRAY['biblical_knowledge_base', 'comprehensive_biblical_texts', 'biblical_original_texts', 'biblical_financial_crossref'],
   ARRAY['READ', 'INSERT', 'UPDATE'],
   200, true),
  ('defi-opportunity-scanner',
   ARRAY['defi_knowledge_base', 'biblical_financial_crossref'],
   ARRAY['READ', 'INSERT', 'UPDATE'],
   300, true)
ON CONFLICT (agent_name) DO UPDATE SET 
  allowed_tables = EXCLUDED.allowed_tables,
  allowed_operations = EXCLUDED.allowed_operations,
  rate_limit_per_hour = EXCLUDED.rate_limit_per_hour,
  is_active = true;

-- Update existing agents with expanded permissions for full Bible scanning
UPDATE agent_ops.agent_permissions 
SET allowed_tables = ARRAY['biblical_knowledge_base', 'comprehensive_biblical_texts', 'biblical_original_texts', 'biblical_financial_crossref', 'bible_verses'],
    rate_limit_per_hour = 300
WHERE agent_name = 'scripture-financial-scanner';

UPDATE agent_ops.agent_permissions 
SET allowed_tables = ARRAY['biblical_knowledge_base', 'comprehensive_biblical_texts', 'biblical_financial_crossref', 'defi_knowledge_base'],
    rate_limit_per_hour = 300
WHERE agent_name = 'biblical-wisdom-expander';
