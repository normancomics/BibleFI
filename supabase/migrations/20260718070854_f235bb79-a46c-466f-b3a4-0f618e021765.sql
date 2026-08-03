
CREATE OR REPLACE FUNCTION api.search_public_churches(
  p_query text,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  state_province text,
  country text,
  denomination text,
  verified boolean,
  accepts_crypto boolean,
  accepts_fiat boolean,
  rating numeric,
  website text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.search_public_churches(p_query, p_limit);
$$;

REVOKE ALL ON FUNCTION api.search_public_churches(text, int) FROM public;
GRANT EXECUTE ON FUNCTION api.search_public_churches(text, int) TO anon, authenticated, service_role;
