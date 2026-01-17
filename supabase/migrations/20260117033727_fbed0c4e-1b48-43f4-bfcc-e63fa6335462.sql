-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Create a view in the api schema that exposes the global_churches table
CREATE OR REPLACE VIEW api.global_churches AS
SELECT 
  id,
  name,
  denomination,
  address,
  city,
  state_province,
  country,
  postal_code,
  website,
  phone,
  email,
  pastor_name,
  accepts_crypto,
  crypto_address,
  crypto_networks,
  accepts_fiat,
  fiat_currencies,
  accepts_cards,
  accepts_checks,
  accepts_wire_transfer,
  has_tech_assistance,
  assistance_contact,
  assistance_languages,
  assistance_hours,
  verified,
  verification_date,
  verified_by,
  rating,
  review_count,
  created_at,
  updated_at,
  coordinates
FROM public.global_churches;

-- Grant usage on the api schema to authenticated and anon roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;

-- Grant select permissions on the view
GRANT SELECT ON api.global_churches TO anon, authenticated;

-- Also ensure the public schema is accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.global_churches TO anon, authenticated;