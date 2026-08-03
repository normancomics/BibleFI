ALTER VIEW api.public_church_directory SET (security_invoker = off);
GRANT SELECT ON api.public_church_directory TO anon, authenticated;