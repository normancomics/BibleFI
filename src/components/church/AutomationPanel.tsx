import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, BookOpen, Zap, Shield, Church, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AggregatorResult {
  success: boolean;
  newChurches?: number;
  updatedChurches?: number;
  verifiedData?: number;
  regionsProcessed?: string[];
  categoriesProcessed?: number;
  versesAdded?: number;
  crossRefsCreated?: number;
  duplicatesSkipped?: number;
  errors?: string[];
  timestamp?: string;
}

const AutomationPanel: React.FC = () => {
  const { toast } = useToast();
  const [churchLoading, setChurchLoading] = useState<string | null>(null);
  const [wisdomLoading, setWisdomLoading] = useState<string | null>(null);
  const [churchResult, setChurchResult] = useState<AggregatorResult | null>(null);
  const [wisdomResult, setWisdomResult] = useState<AggregatorResult | null>(null);

  const runChurchAggregator = async (mode: string, region?: string) => {
    setChurchLoading(mode);
    try {
      const { data, error } = await supabase.functions.invoke('church-data-aggregator', {
        body: { mode, region },
      });

      if (error) throw new Error(error.message);
      setChurchResult(data);
      toast({
        title: '⛪ Church Aggregator Complete',
        description: `New: ${data.newChurches || 0} | Updated: ${data.updatedChurches || 0} | Verified: ${data.verifiedData || 0}`,
      });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setChurchLoading(null);
    }
  };

  const runWisdomAggregator = async (mode: string, category?: string) => {
    setWisdomLoading(mode);
    try {
      const { data, error } = await supabase.functions.invoke('biblical-wisdom-aggregator', {
        body: { mode, category },
      });

      if (error) throw new Error(error.message);
      setWisdomResult(data);
      toast({
        title: '📖 Biblical Wisdom Aggregator Complete',
        description: `Verses: ${data.versesAdded || 0} | Cross-refs: ${data.crossRefsCreated || 0} | Skipped: ${data.duplicatesSkipped || 0}`,
      });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setWisdomLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Church Data Aggregator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="h-5 w-5 text-primary" />
            Continuous Church Data Aggregator
          </CardTitle>
          <CardDescription>
            Automatically discover, verify, and enrich church data from OpenStreetMap globally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => runChurchAggregator('discover')}
              disabled={!!churchLoading}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              {churchLoading === 'discover' ? <RefreshCw className="h-5 w-5 animate-spin mb-1" /> : <Bot className="h-5 w-5 mb-1" />}
              <span className="text-xs font-semibold">Discover New</span>
              <span className="text-[10px] text-muted-foreground">Find churches via OSM</span>
            </Button>
            <Button
              onClick={() => runChurchAggregator('verify')}
              disabled={!!churchLoading}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              {churchLoading === 'verify' ? <RefreshCw className="h-5 w-5 animate-spin mb-1" /> : <Shield className="h-5 w-5 mb-1" />}
              <span className="text-xs font-semibold">Verify Data</span>
              <span className="text-[10px] text-muted-foreground">Check websites exist</span>
            </Button>
            <Button
              onClick={() => runChurchAggregator('enrich')}
              disabled={!!churchLoading}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              {churchLoading === 'enrich' ? <RefreshCw className="h-5 w-5 animate-spin mb-1" /> : <Zap className="h-5 w-5 mb-1" />}
              <span className="text-xs font-semibold">Enrich Missing</span>
              <span className="text-[10px] text-muted-foreground">Fill gaps via Nominatim</span>
            </Button>
            <Button
              onClick={() => runChurchAggregator('full')}
              disabled={!!churchLoading}
              className="flex-col h-auto py-3"
            >
              {churchLoading === 'full' ? <RefreshCw className="h-5 w-5 animate-spin mb-1" /> : <RefreshCw className="h-5 w-5 mb-1" />}
              <span className="text-xs font-semibold">Full Pipeline</span>
              <span className="text-[10px] text-muted-foreground">All steps combined</span>
            </Button>
          </div>

          {/* Region-specific discovery */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Target specific regions:</p>
            <div className="flex flex-wrap gap-2">
              {['us_southeast', 'us_northeast', 'us_west', 'us_midwest', 'us_south', 'africa', 'europe', 'latin_america', 'asia_pacific'].map(r => (
                <Button
                  key={r}
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  disabled={!!churchLoading}
                  onClick={() => runChurchAggregator('discover', r)}
                >
                  {r.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {churchResult && (
            <AggregatorResultCard result={churchResult} type="church" />
          )}
        </CardContent>
      </Card>

      {/* Biblical Wisdom Aggregator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            Biblical Financial Wisdom Automation
          </CardTitle>
          <CardDescription>
            Continuously seed and cross-reference Biblical financial wisdom with DeFi concepts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => runWisdomAggregator('seed')}
              disabled={!!wisdomLoading}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              {wisdomLoading === 'seed' ? <RefreshCw className="h-5 w-5 animate-spin mb-1" /> : <BookOpen className="h-5 w-5 mb-1" />}
              <span className="text-xs font-semibold">Seed Scriptures</span>
              <span className="text-[10px] text-muted-foreground">Add financial verses</span>
            </Button>
            <Button
              onClick={() => runWisdomAggregator('crossref')}
              disabled={!!wisdomLoading}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              {wisdomLoading === 'crossref' ? <RefreshCw className="h-5 w-5 animate-spin mb-1" /> : <Zap className="h-5 w-5 mb-1" />}
              <span className="text-xs font-semibold">Cross-Reference</span>
              <span className="text-[10px] text-muted-foreground">Link Bible → DeFi</span>
            </Button>
            <Button
              onClick={() => runWisdomAggregator('full')}
              disabled={!!wisdomLoading}
              className="flex-col h-auto py-3"
            >
              {wisdomLoading === 'full' ? <RefreshCw className="h-5 w-5 animate-spin mb-1" /> : <RefreshCw className="h-5 w-5 mb-1" />}
              <span className="text-xs font-semibold">Full Pipeline</span>
              <span className="text-[10px] text-muted-foreground">Seed + Cross-reference</span>
            </Button>
          </div>

          {/* Category-specific seeding */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Seed specific categories:</p>
            <div className="flex flex-wrap gap-2">
              {['tithing_and_giving', 'debt_and_borrowing', 'saving_and_investment', 'taxes_and_governance', 'stewardship_and_wisdom', 'contentment_and_ethics', 'generosity_and_charity'].map(c => (
                <Button
                  key={c}
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  disabled={!!wisdomLoading}
                  onClick={() => runWisdomAggregator('seed', c)}
                >
                  {c.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>

          {wisdomResult && (
            <AggregatorResultCard result={wisdomResult} type="wisdom" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AggregatorResultCard: React.FC<{ result: AggregatorResult; type: 'church' | 'wisdom' }> = ({ result, type }) => (
  <Card className="border-dashed">
    <CardContent className="p-3">
      <div className="flex items-center gap-2 mb-2">
        {result.success ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm font-medium">
          {result.success ? 'Completed Successfully' : 'Completed with Errors'}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {type === 'church' ? (
          <>
            <div>
              <div className="text-lg font-bold text-primary">{result.newChurches || 0}</div>
              <div className="text-[10px] text-muted-foreground">New Churches</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-500">{result.updatedChurches || 0}</div>
              <div className="text-[10px] text-muted-foreground">Enriched</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">{result.verifiedData || 0}</div>
              <div className="text-[10px] text-muted-foreground">Verified</div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-lg font-bold text-primary">{result.versesAdded || 0}</div>
              <div className="text-[10px] text-muted-foreground">Verses Added</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-500">{result.crossRefsCreated || 0}</div>
              <div className="text-[10px] text-muted-foreground">Cross-Refs</div>
            </div>
            <div>
              <div className="text-lg font-bold text-muted-foreground">{result.duplicatesSkipped || 0}</div>
              <div className="text-[10px] text-muted-foreground">Skipped</div>
            </div>
          </>
        )}
      </div>

      {result.errors && result.errors.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-red-400 cursor-pointer">{result.errors.length} error(s)</summary>
          <ul className="text-[10px] text-red-300 mt-1 max-h-20 overflow-y-auto">
            {result.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        </details>
      )}

      {result.regionsProcessed && result.regionsProcessed.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {result.regionsProcessed.map((r, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">{r}</Badge>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default AutomationPanel;
