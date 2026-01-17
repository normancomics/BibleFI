-- Fix security definer view by setting security_invoker = true
-- This ensures the view uses the permissions of the querying user, not the creator
ALTER VIEW api.global_churches SET (security_invoker = true);