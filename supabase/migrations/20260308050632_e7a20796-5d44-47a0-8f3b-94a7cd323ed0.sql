-- Update agent permissions to use the agent view
UPDATE agent_ops.agent_permissions 
SET allowed_tables = array_replace(allowed_tables, 'global_churches', 'global_churches_agent')
WHERE agent_name IN ('church-seeder-agent', 'church-data-validator')
  AND 'global_churches' = ANY(allowed_tables);