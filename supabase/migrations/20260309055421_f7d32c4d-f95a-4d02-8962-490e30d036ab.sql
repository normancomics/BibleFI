-- Fix only the api schema view that PostgREST actually uses
ALTER VIEW api.public_church_directory SET (security_invoker = false);