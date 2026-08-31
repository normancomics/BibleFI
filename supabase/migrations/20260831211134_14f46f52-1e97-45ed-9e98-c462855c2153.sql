CREATE VIEW api.church_onboarding WITH (security_invoker = true) AS
  SELECT * FROM public.church_onboarding;

CREATE VIEW api.church_nfc_cards WITH (security_invoker = true) AS
  SELECT * FROM public.church_nfc_cards;

CREATE VIEW api.church_tithe_payments WITH (security_invoker = true) AS
  SELECT * FROM public.church_tithe_payments;

GRANT SELECT, INSERT, UPDATE, DELETE ON api.church_onboarding TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api.church_nfc_cards TO authenticated;
GRANT SELECT ON api.church_tithe_payments TO authenticated;
GRANT ALL ON api.church_onboarding TO service_role;
GRANT ALL ON api.church_nfc_cards TO service_role;
GRANT ALL ON api.church_tithe_payments TO service_role;