
-- 1) Definer RPC that returns ONLY masked public directory columns
CREATE OR REPLACE FUNCTION public.search_public_churches(
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
  SELECT
    gc.id,
    gc.name,
    gc.city,
    gc.state_province,
    gc.country,
    gc.denomination,
    gc.verified,
    gc.accepts_crypto,
    gc.accepts_fiat,
    gc.rating,
    gc.website
  FROM public.global_churches gc
  WHERE p_query IS NOT NULL
    AND length(btrim(p_query)) > 0
    AND (
      gc.name ILIKE '%' || p_query || '%'
      OR gc.city ILIKE '%' || p_query || '%'
      OR gc.denomination ILIKE '%' || p_query || '%'
      OR gc.country ILIKE '%' || p_query || '%'
    )
  ORDER BY gc.verified DESC NULLS LAST, gc.rating DESC NULLS LAST, gc.name ASC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 25);
$$;

REVOKE ALL ON FUNCTION public.search_public_churches(text, int) FROM public;
GRANT EXECUTE ON FUNCTION public.search_public_churches(text, int) TO anon, authenticated, service_role;

-- 2) Tighten the api.public_church_directory view: restore security_invoker=on
-- so it enforces the caller's RLS instead of the view creator's privileges,
-- and revoke anon read access. Callers now use search_public_churches RPC.
ALTER VIEW api.public_church_directory SET (security_invoker = on);
REVOKE SELECT ON api.public_church_directory FROM anon;
