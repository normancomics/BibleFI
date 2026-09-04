ALTER VIEW api.biblical_original_texts SET (security_invoker = true);
GRANT SELECT ON public.biblical_original_texts TO anon, authenticated;