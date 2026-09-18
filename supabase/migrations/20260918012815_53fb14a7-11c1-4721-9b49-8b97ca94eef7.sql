CREATE OR REPLACE FUNCTION api.list_churches_with_giving_address(p_limit integer DEFAULT 24)
RETURNS TABLE(church_id uuid, name text, city text, state_province text, country text, denomination text, crypto_address text, crypto_networks text[], verified boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT gc.id, gc.name, gc.city, gc.state_province, gc.country, gc.denomination,
         gc.crypto_address, gc.crypto_networks, gc.verified
  FROM public.global_churches gc
  WHERE gc.accepts_crypto = true
    AND gc.crypto_address IS NOT NULL
    AND gc.crypto_address ~ '^0x[a-fA-F0-9]{40}$'
  ORDER BY gc.verified DESC NULLS LAST, gc.name
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 24), 1), 100);
$$;

REVOKE ALL ON FUNCTION api.list_churches_with_giving_address(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.list_churches_with_giving_address(integer) TO anon, authenticated, service_role;

COMMENT ON FUNCTION api.list_churches_with_giving_address(integer) IS
  'Churches that have published a Base giving wallet, for the Continuous Giving quick list. Public donation address only, no PII. "Bring ye all the tithes into the storehouse" - Malachi 3:10.';