import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Finding {
  id: string;
  probe: string;
  endpoint: string;
  severity: string;
  status: string;
  title: string;
  evidence: Record<string, unknown>;
  detected_at: string;
  acknowledged: boolean;
}
interface Run {
  id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  probes_run: number;
  probes_passed: number;
  probes_failed: number;
  high_severity_count: number;
}

const severityColor = (s: string) =>
  s === "critical" ? "destructive" : s === "high" ? "destructive" : s === "medium" ? "default" : "secondary";

const SecurityMonitorPanel: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [running, setRunning] = useState(false);

  const load = async () => {
    const [f, r] = await Promise.all([
      supabase
        .from("security_monitor_findings" as never)
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(50),
      supabase
        .from("security_monitor_runs" as never)
        .select("*")
        .order("started_at", { ascending: false })
        .limit(10),
    ]);
    if (f.data) setFindings(f.data as unknown as Finding[]);
    if (r.data) setRuns(r.data as unknown as Run[]);
  };

  useEffect(() => {
    load();
  }, []);

  const runNow = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke("security-endpoint-monitor");
      if (error) toast.error(`Scan failed: ${error.message}`);
      else {
        toast.success("Security scan complete");
        await load();
      }
    } finally {
      setRunning(false);
    }
  };

  const acknowledge = async (id: string) => {
    const { error } = await supabase
      .from("security_monitor_findings" as never)
      .update({ acknowledged: true } as never)
      .eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const openFindings = findings.filter((f) => !f.acknowledged);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Endpoint Security Monitor</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-runs every 6 hours. Records HIGH severity findings only.
            </p>
          </div>
          <Button onClick={runNow} disabled={running}>
            {running ? "Scanning..." : "Run now"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{openFindings.length}</div>
              <div className="text-xs text-muted-foreground">Open HIGH findings</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{runs[0]?.probes_run ?? 0}</div>
              <div className="text-xs text-muted-foreground">Probes last run</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{runs[0]?.probes_failed ?? 0}</div>
              <div className="text-xs text-muted-foreground">Failed last run</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {findings.length === 0 && (
            <p className="text-sm text-muted-foreground">No HIGH severity findings recorded. ✓</p>
          )}
          {findings.map((f) => (
            <div key={f.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={severityColor(f.severity) as never}>{f.severity.toUpperCase()}</Badge>
                  <span className="font-medium">{f.title}</span>
                  {f.acknowledged && <Badge variant="outline">Ack</Badge>}
                </div>
                {!f.acknowledged && (
                  <Button size="sm" variant="outline" onClick={() => acknowledge(f.id)}>
                    Acknowledge
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">{f.endpoint}</div>
              <div className="text-xs text-muted-foreground">
                Probe: {f.probe} · Detected {new Date(f.detected_at).toLocaleString()}
              </div>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(f.evidence, null, 2)}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b pb-2">
                <span>{new Date(r.started_at).toLocaleString()}</span>
                <span className="text-muted-foreground">
                  {r.probes_passed}/{r.probes_run} passed · {r.high_severity_count} HIGH
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitorPanel;