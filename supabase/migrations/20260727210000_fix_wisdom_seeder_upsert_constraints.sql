-- Fix the silently-failing scripture/wisdom seeders.
--
-- ROOT CAUSE
-- ----------
-- The seeding agents upsert with an ON CONFLICT target:
--     sandboxedInsert(ctx, 'biblical_knowledge_base',      {...}, { onConflict: 'reference' })
--     sandboxedInsert(ctx, 'comprehensive_biblical_texts', {...}, { onConflict: 'book,chapter,verse' })
--
-- ...but neither table had a unique constraint on those columns — only
-- PRIMARY KEY (id). Postgres therefore rejects every one of those writes with
--     42P10: there is no unique or exclusion constraint matching the
--            ON CONFLICT specification
-- The scanner never checks sandboxedInsert's return value, so the failure was
-- swallowed and pg_cron still recorded "succeeded". Net effect: the jobs ran
-- on schedule for months and wrote nothing. Newest row was 2026-03-16, with
-- 0 rows added in the 7 days before this fix.
--
-- Proof the upsert was never deduping: biblical_knowledge_base held 122 rows
-- with only 109 distinct references — 13 duplicates that an working upsert
-- could not have produced.
--
-- THE FIX: dedupe, then add the unique constraints the ON CONFLICT targets
-- require. After this the seeders can actually write (and re-runs update
-- rather than duplicate).

-- 1. Collapse duplicate references, keeping the most recently created row.
DELETE FROM public.biblical_knowledge_base a
USING public.biblical_knowledge_base b
WHERE a.reference = b.reference
  AND (a.created_at, a.ctid) < (b.created_at, b.ctid);

-- 2. Unique constraint backing `onConflict: 'reference'`.
ALTER TABLE public.biblical_knowledge_base
  DROP CONSTRAINT IF EXISTS biblical_knowledge_base_reference_key;
ALTER TABLE public.biblical_knowledge_base
  ADD CONSTRAINT biblical_knowledge_base_reference_key UNIQUE (reference);

-- 3. Same for comprehensive_biblical_texts (already duplicate-free, but guard
--    anyway so this migration is safe to re-run against dirtier data).
DELETE FROM public.comprehensive_biblical_texts a
USING public.comprehensive_biblical_texts b
WHERE a.book = b.book AND a.chapter = b.chapter AND a.verse = b.verse
  AND a.ctid < b.ctid;

ALTER TABLE public.comprehensive_biblical_texts
  DROP CONSTRAINT IF EXISTS comprehensive_biblical_texts_book_chapter_verse_key;
ALTER TABLE public.comprehensive_biblical_texts
  ADD CONSTRAINT comprehensive_biblical_texts_book_chapter_verse_key
  UNIQUE (book, chapter, verse);
