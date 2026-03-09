-- Set security_invoker=false so the view runs as owner (postgres),
-- bypassing RLS on global_churches. The view already masks sensitive PII.
ALTER VIEW public.public_church_directory SET (security_invoker = false);

-- Also fix public_church_reviews and public_agents views  
ALTER VIEW public.public_church_reviews SET (security_invoker = false);
ALTER VIEW public.public_agents SET (security_invoker = false);