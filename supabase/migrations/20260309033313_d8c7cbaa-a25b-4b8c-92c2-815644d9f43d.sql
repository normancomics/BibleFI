-- Create a masked church directory view in the api schema
-- so it's accessible via PostgREST (which only exposes the api schema)
CREATE OR REPLACE VIEW api.public_church_directory AS
SELECT
  id,
  name,
  denomination,
  address,
  city,
  state_province,
  country,
  website,
  verified,
  accepts_crypto,
  accepts_fiat,
  accepts_cards,
  accepts_checks,
  rating,
  review_count,
  coordinates,
  crypto_networks,
  created_at,
  CASE WHEN email IS NOT NULL 
    THEN left(email, 3) || '***@***' 
    ELSE NULL END AS masked_email,
  CASE WHEN phone IS NOT NULL 
    THEN left(phone, 3) || '***' 
    ELSE NULL END AS masked_phone,
  CASE WHEN crypto_address IS NOT NULL 
    THEN left(crypto_address, 6) || '...' || right(crypto_address, 4)
    ELSE NULL END AS masked_crypto_address
FROM public.global_churches;

GRANT SELECT ON api.public_church_directory TO anon, authenticated;