CREATE VIEW api.church_search_queue
WITH (security_invoker = true)
AS SELECT id, query, normalized_query, search_count, found_in_directory,
          status, attempts, churches_added, last_error,
          last_searched_at, processed_at, created_at, updated_at
   FROM public.church_search_queue;

GRANT SELECT, UPDATE ON api.church_search_queue TO service_role;