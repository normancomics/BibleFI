import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, RefreshCw, Search, Info } from 'lucide-react';
import {
  fetchAvailableVersions,
  fetchVersesByVersion,
  LICENSED_VERSIONS,
  type VersionedVerse,
} from '@/services/scriptureVersionService';

const ScripturesPage: React.FC = () => {
  const [versions, setVersions] = useState<string[]>([]);
  const [version, setVersion] = useState<string>('');
  const [verses, setVerses] = useState<VersionedVerse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVersions = async () => {
    try {
      const list = await fetchAvailableVersions();
      setVersions(list);
      setVersion((current) => current || list.find((v) => v === 'KJV') || list[0] || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load translations');
    }
  };

  const loadVerses = async (v: string, term: string) => {
    if (!v) return;
    setLoading(true);
    setError(null);
    try {
      setVerses(await fetchVersesByVersion(v, term));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load scriptures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (!version) {
      setLoading(false);
      return;
    }
    const id = window.setTimeout(() => loadVerses(version, search), 250);
    return () => window.clearTimeout(id);
  }, [version, search]);

  const missingLicensed = useMemo(
    () => LICENSED_VERSIONS.filter((v) => !versions.includes(v)),
    [versions],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Scripture Library
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Every financial and stewardship scripture powering BWSP, viewable across multiple
            translations. Compare the same verse word-for-word before acting on it.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Select value={version} onValueChange={setVersion}>
            <SelectTrigger className="sm:w-56 bg-black/30 border-ancient-gold/40">
              <SelectValue placeholder="Select translation" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search book or verse text (e.g. tithe, Proverbs)"
              className="pl-9 bg-black/30 border-ancient-gold/40"
              aria-label="Search scriptures"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => loadVerses(version, search)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {missingLicensed.length > 0 && (
          <Alert className="mb-6 border-ancient-gold/40 bg-black/30">
            <Info className="w-4 h-4" />
            <AlertTitle>{missingLicensed.join(' & ')} not available from free sources</AlertTitle>
            <AlertDescription>
              NIV and ESV are copyrighted; BibleGateway has no public API and bible-api.com serves
              only freely redistributable texts. Add an <code>ESV_API_KEY</code> (Crossway) or
              <code> API_BIBLE_KEY</code> (api.bible, NIV licence required) and the seeder will
              include them automatically. Public-domain translations below are complete and legal to
              redistribute.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Could not load scriptures</AlertTitle>
            <AlertDescription>
              {error} — “Trust in the LORD with all thine heart” (Proverbs 3:5). Try Refresh.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="bg-black/30 border-ancient-gold/30 animate-pulse h-36" />
            ))}
          </div>
        ) : verses.length === 0 ? (
          <Card className="bg-black/30 border-ancient-gold/30">
            <CardContent className="py-10 text-center text-muted-foreground">
              No verses found{search ? ` for “${search}”` : ''} in {version || 'this translation'}.
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              {verses.length} verses · {version}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {verses.map((v) => (
                <Card key={v.id} className="bg-black/30 border-ancient-gold/30 backdrop-blur">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                    <CardTitle className="text-base text-ancient-gold font-scroll uppercase tracking-tight">
                      {v.book_name} {v.chapter}:{v.verse}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{v.version}</Badge>
                      {typeof v.financial_relevance === 'number' && (
                        <Badge variant="secondary">FR {v.financial_relevance}/10</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground italic leading-relaxed">{v.text}</p>
                    {v.wisdom_category?.length ? (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {v.wisdom_category.map((c) => (
                          <Badge key={c} variant="outline" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ScripturesPage;
