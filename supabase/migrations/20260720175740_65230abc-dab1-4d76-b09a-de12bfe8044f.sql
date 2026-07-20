CREATE OR REPLACE FUNCTION api.get_public_church_directory()
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  state_province text,
  country text,
  denomination text,
  address text,
  website text,
  verified boolean,
  accepts_crypto boolean,
  accepts_fiat boolean,
  accepts_cards boolean,
  accepts_checks boolean,
  rating numeric,
  review_count integer,
  coordinates point,
  masked_email text,
  masked_phone text,
  masked_crypto_address text,
  crypto_networks text[],
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT
    gc.id, gc.name, gc.city, gc.state_province, gc.country, gc.denomination,
    gc.address, gc.website, gc.verified, gc.accepts_crypto, gc.accepts_fiat,
    gc.accepts_cards, gc.accepts_checks, gc.rating, gc.review_count, gc.coordinates,
    CASE WHEN gc.email IS NOT NULL THEN '***@' || split_part(gc.email, '@', 2) ELSE NULL END,
    CASE WHEN gc.phone IS NOT NULL THEN '***-' || right(gc.phone, 4) ELSE NULL END,
    CASE WHEN gc.crypto_address IS NOT NULL THEN left(gc.crypto_address, 6) || '...' || right(gc.crypto_address, 4) ELSE NULL END,
    gc.crypto_networks, gc.created_at
  FROM public.global_churches gc;
$$;

REVOKE ALL ON FUNCTION api.get_public_church_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.get_public_church_directory() TO anon, authenticated, service_role;

DROP VIEW api.public_church_directory;
CREATE VIEW api.public_church_directory
WITH (security_invoker = true)
AS
SELECT
  id, name, city, state_province, country, denomination, address, website,
  verified, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks,
  rating::numeric(3,2) AS rating, review_count, coordinates, masked_email,
  masked_phone, masked_crypto_address, crypto_networks, created_at
FROM api.get_public_church_directory();

GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT SELECT ON api.public_church_directory TO anon, authenticated;
GRANT ALL ON api.public_church_directory TO service_role;
REVOKE ALL ON public.global_churches FROM anon;
REVOKE ALL ON public.global_churches FROM authenticated;