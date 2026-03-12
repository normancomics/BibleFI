import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, BookOpen, Database } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { supabase } from '@/integrations/supabase/client';

interface AuditResult {
  totalVerses: number;
  validated: number;
  mismatches: number;
  errors: number;
  integrityScore: number;
  details: VerseResult[];
}

interface VerseResult {
  reference: string;
  status: 'match' | 'mismatch' | 'error';
  message?: string;
}

const ScriptureIntegrityPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [dbStats, setDbStats] = useState<{ total: number; categories: Record<string, number> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDbStats = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('biblical_knowledge_base')
      .select('id, category');
    if (err) return;
    const categories: Record<string, number> = {};
    (data || []).forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    setDbStats({ total: data?.length || 0, categories });
  }, []);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    const allDetails: VerseResult[] = [];
    let totalValidated = 0, totalMismatches = 0, totalErrors = 0, totalVerses = 0;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Admin authentication required');

      const batchSize = 25;
      for (let offset = 0; offset < 200; offset += batchSize) {
        const { data, error: fnErr } = await supabase.functions.invoke('scripture-integrity-validator', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { mode: 'audit_readonly', batchSize, offset },
        });
        if (fnErr) throw fnErr;
        if (!data?.results) break;

        const results = data.results;
        totalVerses = Math.max(totalVerses, (data.totalInDb || 0));
        totalValidated += results.validated || 0;
        totalMismatches += results.mismatches || 0;
        totalErrors += results.errors || 0;

        (results.details || []).forEach((d: any) => {
          allDetails.push({
            reference: d.reference,
            status: d.status,
            message: d.message,
          });
        });

        if ((results.validated + results.mismatches + results.errors) < batchSize) break;
      }

      const score = totalVerses > 0
        ? Math.round((totalValidated / (totalValidated + totalMismatches + totalErrors)) * 100 * 10) / 10
        : 0;

      setAuditResult({
        totalVerses,
        validated: totalValidated,
        mismatches: totalMismatches,
        errors: totalErrors,
        integrityScore: score,
        details: allDetails,
      });
    } catch (e: any) {
      setError(e.message || 'Audit failed');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchDbStats(); }, [fetchDbStats]);

  const scoreColor = (score: number) =>
    score >= 95 ? 'text-green-500' : score >= 80 ? 'text-yellow-500' : 'text-destructive';

  const statusIcon = (status: string) => {
    if (status === 'match') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'mismatch') return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-ancient-gold" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scripture Integrity Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              "Every word of God is pure" — Proverbs 30:5
            </p>
          </div>
        </div>

        {/* DB Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" /> Total Seeded Verses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{dbStats?.total ?? '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{dbStats ? Object.keys(dbStats.categories).length : '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" /> Integrity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${auditResult ? scoreColor(auditResult.integrityScore) : 'text-muted-foreground'}`}>
                {auditResult ? `${auditResult.integrityScore}%` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        {dbStats && Object.keys(dbStats.categories).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(dbStats.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}: {count}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Run Audit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">KJV Integrity Audit</CardTitle>
            <CardDescription>
              Validates all seeded verses against the canonical KJV text via bible-api.com
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runAudit} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running Audit…' : 'Run Full Audit'}
            </Button>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {auditResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-foreground">{auditResult.totalVerses}</p>
                    <p className="text-xs text-muted-foreground">Total in DB</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                    <p className="text-2xl font-bold text-green-500">{auditResult.validated}</p>
                    <p className="text-xs text-muted-foreground">Validated</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/10">
                    <p className="text-2xl font-bold text-destructive">{auditResult.mismatches}</p>
                    <p className="text-xs text-muted-foreground">Mismatches</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                    <p className="text-2xl font-bold text-yellow-500">{auditResult.errors}</p>
                    <p className="text-xs text-muted-foreground">API Errors</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Integrity</p>
                  <Progress value={auditResult.integrityScore} className="h-3" />
                </div>

                {/* Verse Results Table */}
                {auditResult.details.length > 0 && (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Status</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditResult.details.map((d, i) => (
                          <TableRow key={i}>
                            <TableCell>{statusIcon(d.status)}</TableCell>
                            <TableCell className="font-medium text-sm">{d.reference}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{d.message || 'Exact KJV match'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScriptureIntegrityPage;
