-- Set security_invoker=true on all api schema views that are missing it
ALTER VIEW api.biblical_knowledge_base SET (security_invoker = true);
ALTER VIEW api.comprehensive_biblical_texts SET (security_invoker = true);
ALTER VIEW api.biblical_financial_crossref SET (security_invoker = true);
ALTER VIEW api.global_churches_agent SET (security_invoker = true);

-- Recreate api.public_church_directory with security_invoker
DROP VIEW IF EXISTS api.public_church_directory;

CREATE VIEW api.public_church_directory 
WITH (security_invoker = true)
AS 
SELECT 
    global_churches.id,
    global_churches.name,
    global_churches.city,
    global_churches.state_province,
    global_churches.country,
    global_churches.denomination,
    global_churches.address,
    global_churches.website,
    global_churches.verified,
    global_churches.accepts_crypto,
    global_churches.accepts_fiat,
    global_churches.accepts_cards,
    global_churches.accepts_checks,
    global_churches.rating,
    global_churches.review_count,
    global_churches.coordinates,
    CASE
        WHEN global_churches.email IS NOT NULL THEN left(global_churches.email, 3) || '***@***'
        ELSE NULL
    END AS masked_email,
    CASE
        WHEN global_churches.phone IS NOT NULL THEN left(global_churches.phone, 3) || '***'
        ELSE NULL
    END AS masked_phone,
    CASE
        WHEN global_churches.crypto_address IS NOT NULL THEN left(global_churches.crypto_address, 6) || '...' || right(global_churches.crypto_address, 4)
        ELSE NULL
    END AS masked_crypto_address,
    global_churches.crypto_networks,
    global_churches.created_at
FROM public.global_churches;

GRANT SELECT ON api.public_church_directory TO anon, authenticated;