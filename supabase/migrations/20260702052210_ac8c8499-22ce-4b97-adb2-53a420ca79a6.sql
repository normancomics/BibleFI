
CREATE TABLE public.security_monitor_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL,
  probe TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status TEXT NOT NULL CHECK (status IN ('pass','fail','error')),
  title TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_smf_detected_at ON public.security_monitor_findings (detected_at DESC);
CREATE INDEX idx_smf_severity ON public.security_monitor_findings (severity, acknowledged);

GRANT SELECT, UPDATE ON public.security_monitor_findings TO authenticated;
GRANT ALL ON public.security_monitor_findings TO service_role;

ALTER TABLE public.security_monitor_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security findings"
  ON public.security_monitor_findings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can acknowledge findings"
  ON public.security_monitor_findings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.security_monitor_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  probes_run INTEGER NOT NULL DEFAULT 0,
  probes_passed INTEGER NOT NULL DEFAULT 0,
  probes_failed INTEGER NOT NULL DEFAULT 0,
  high_severity_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_smr_started_at ON public.security_monitor_runs (started_at DESC);

GRANT SELECT ON public.security_monitor_runs TO authenticated;
GRANT ALL ON public.security_monitor_runs TO service_role;

ALTER TABLE public.security_monitor_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security monitor runs"
  ON public.security_monitor_runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
