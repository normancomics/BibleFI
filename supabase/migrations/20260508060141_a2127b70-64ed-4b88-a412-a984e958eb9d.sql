
-- 1. Restrict global_churches DELETE to authenticated role only
DROP POLICY IF EXISTS "Church creators can delete" ON public.global_churches;
CREATE POLICY "Church creators can delete"
  ON public.global_churches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- 2. Restrict ai_context_sessions write policies to authenticated only
DROP POLICY IF EXISTS "Users can create their own AI sessions" ON public.ai_context_sessions;
CREATE POLICY "Users can create their own AI sessions"
  ON public.ai_context_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own AI sessions" ON public.ai_context_sessions;
CREATE POLICY "Users can update their own AI sessions"
  ON public.ai_context_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their own AI sessions" ON public.ai_context_sessions;
CREATE POLICY "Users can view their own AI sessions"
  ON public.ai_context_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Restrict mcp_biblical_sessions to authenticated
DROP POLICY IF EXISTS "Users can create their own MCP sessions" ON public.mcp_biblical_sessions;
CREATE POLICY "Users can create their own MCP sessions"
  ON public.mcp_biblical_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their own MCP sessions" ON public.mcp_biblical_sessions;
CREATE POLICY "Users can view their own MCP sessions"
  ON public.mcp_biblical_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Sovereign agents: remove email/phone exposure via masked SECURITY DEFINER getter,
-- and restrict the existing SELECT policy to non-PII columns by replacing it with one
-- that only shows id + assignment context. Full PII access requires admin role.
DROP POLICY IF EXISTS "Users can view assigned agents only" ON public.sovereign_agents;
CREATE POLICY "Admins can view sovereign agent PII"
  ON public.sovereign_agents
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.get_assigned_agent_safe(p_agent_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row sovereign_agents%ROWTYPE;
  v_assigned boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM agent_assignments
    WHERE agent_id = p_agent_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) INTO v_assigned;

  IF NOT v_assigned AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row FROM sovereign_agents WHERE id = p_agent_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Admins see full PII; assigned users see masked email/phone
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN to_jsonb(v_row);
  END IF;

  RETURN to_jsonb(v_row)
    - 'email' - 'phone'
    || jsonb_build_object(
      'email_masked', CASE WHEN v_row.email IS NOT NULL
        THEN left(v_row.email, 2) || '***@' || split_part(v_row.email, '@', 2)
        ELSE NULL END,
      'phone_masked', CASE WHEN v_row.phone IS NOT NULL
        THEN '***-' || right(v_row.phone, 4)
        ELSE NULL END
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_assigned_agent_safe(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_assigned_agent_safe(uuid) TO authenticated;

-- 5. Lock down public-callable SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.get_masked_church_info(global_churches) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_masked_church_info(global_churches) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_full_church_details(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_full_church_details(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 6. Restrict church_payment_processors tax_id / contact PII access to admins only.
-- Replace permissive primary-member SELECT with masked view + admin-only raw access.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename='church_payment_processors' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.church_payment_processors', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins can view full processor records"
  ON public.church_payment_processors
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.get_church_processor_safe(p_church_id uuid)
RETURNS SETOF jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member boolean;
  v_admin boolean;
BEGIN
  v_admin := public.has_role(auth.uid(), 'admin'::app_role);
  v_member := EXISTS (
    SELECT 1 FROM church_memberships
    WHERE church_id = p_church_id
      AND user_id = auth.uid()
      AND status = 'approved'
      AND primary_church = true
  );

  IF NOT v_admin AND NOT v_member THEN RETURN; END IF;

  IF v_admin THEN
    RETURN QUERY SELECT to_jsonb(p) FROM church_payment_processors p WHERE p.church_id = p_church_id;
  ELSE
    RETURN QUERY
      SELECT to_jsonb(p)
        - 'tax_id' - 'tax_documentation_url'
        - 'tech_contact_email' - 'tech_contact_phone'
        - 'main_contact_email' - 'main_contact_phone'
      FROM church_payment_processors p WHERE p.church_id = p_church_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_church_processor_safe(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_church_processor_safe(uuid) TO authenticated;
