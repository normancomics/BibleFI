CREATE TABLE public.church_search_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  normalized_query text NOT NULL UNIQUE,
  search_count integer NOT NULL DEFAULT 1,
  found_in_directory boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  churches_added integer NOT NULL DEFAULT 0,
  last_error text,
  last_searched_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.church_search_queue TO service_role;
GRANT SELECT ON public.church_search_queue TO authenticated;

ALTER TABLE public.church_search_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view church search queue"
ON public.church_search_queue FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_church_search_queue_status ON public.church_search_queue (status, search_count DESC);

CREATE TRIGGER update_church_search_queue_updated_at
BEFORE UPDATE ON public.church_search_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION api.record_church_search(p_query text, p_found boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_query text;
  v_norm text;
BEGIN
  v_query := btrim(coalesce(p_query, ''));
  IF length(v_query) < 3 OR length(v_query) > 120 THEN
    RETURN;
  END IF;
  -- strip anything that is not a letter, number, space, apostrophe, hyphen, period or comma
  v_query := regexp_replace(v_query, '[^A-Za-z0-9 ''\-\.,]', ' ', 'g');
  v_query := btrim(regexp_replace(v_query, '\s+', ' ', 'g'));
  IF length(v_query) < 3 THEN
    RETURN;
  END IF;
  v_norm := lower(v_query);

  INSERT INTO public.church_search_queue (query, normalized_query, found_in_directory, status)
  VALUES (v_query, v_norm, coalesce(p_found, false),
          CASE WHEN coalesce(p_found, false) THEN 'found' ELSE 'pending' END)
  ON CONFLICT (normalized_query) DO UPDATE
    SET search_count = public.church_search_queue.search_count + 1,
        found_in_directory = EXCLUDED.found_in_directory,
        last_searched_at = now(),
        status = CASE
          WHEN EXCLUDED.found_in_directory THEN 'found'
          WHEN public.church_search_queue.status IN ('seeded', 'skipped') THEN public.church_search_queue.status
          ELSE 'pending'
        END;
END;
$$;

REVOKE ALL ON FUNCTION api.record_church_search(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION api.record_church_search(text, boolean) TO anon, authenticated, service_role;