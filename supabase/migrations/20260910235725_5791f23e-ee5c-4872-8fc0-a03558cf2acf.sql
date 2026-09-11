CREATE OR REPLACE FUNCTION api.get_church_giving_address(p_church_id uuid)
RETURNS TABLE(church_id uuid, name text, crypto_address text, crypto_networks text[], accepts_crypto boolean, verified boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT gc.id, gc.name, gc.crypto_address, gc.crypto_networks, gc.accepts_crypto, gc.verified
  FROM public.global_churches gc
  WHERE gc.id = p_church_id
    AND gc.accepts_crypto = true
    AND gc.crypto_address IS NOT NULL
    AND gc.crypto_address ~ '^0x[a-fA-F0-9]{40}$';
$$;

REVOKE ALL ON FUNCTION api.get_church_giving_address(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.get_church_giving_address(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION api.get_church_giving_address(uuid) IS
  'Returns only the public donation wallet address a church has chosen to publish. No email, phone, tax id or contact PII. "Bring ye all the tithes into the storehouse" - Malachi 3:10.';