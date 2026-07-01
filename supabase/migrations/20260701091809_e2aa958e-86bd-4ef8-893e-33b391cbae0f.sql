
-- church_reviews: restrict write policies to authenticated only
DROP POLICY IF EXISTS "Users can create reviews" ON public.church_reviews;
CREATE POLICY "Users can create reviews" ON public.church_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their reviews" ON public.church_reviews;
CREATE POLICY "Users can update their reviews" ON public.church_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- superfluid_streams: restrict write policies to authenticated only
DROP POLICY IF EXISTS "Users can create their own streams" ON public.superfluid_streams;
CREATE POLICY "Users can create their own streams" ON public.superfluid_streams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own streams" ON public.superfluid_streams;
CREATE POLICY "Users can update their own streams" ON public.superfluid_streams
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own streams" ON public.superfluid_streams;
CREATE POLICY "Users can delete their own streams" ON public.superfluid_streams
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- global_churches: revoke direct table SELECT of PII columns from non-admin roles.
-- Admin/creator access to raw PII goes through SECURITY DEFINER RPCs
-- (get_masked_church_info, get_full_church_details) which run as the function
-- owner and are unaffected by column-level grants.
REVOKE SELECT ON public.global_churches FROM authenticated;
REVOKE SELECT ON public.global_churches FROM anon;

GRANT SELECT (
  id, name, denomination, address, city, state_province, country, postal_code,
  website, accepts_crypto, crypto_networks, accepts_fiat, fiat_currencies,
  accepts_cards, accepts_checks, accepts_wire_transfer, has_tech_assistance,
  assistance_languages, assistance_hours, verified, verification_date,
  verified_by, rating, review_count, created_at, updated_at, created_by,
  last_updated_by, coordinates
) ON public.global_churches TO authenticated;
