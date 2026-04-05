Biblical Finance AI Agents

This folder contains agent scaffolds that orchestrate the biblical finance crawler and ongoing enrichment workflows.

- `biblicalFinanceAgent.ts` — simple orchestrator to run the comprehensive crawl and lightweight keyword subagent.

Usage:
- Import the agent in a scheduled script or serverless function and call `runFullAnalysis()` to process and enrich verses.
- The agent uses `BiblicalFinanceCrawlerService` which reads from the `bible_verses` table and writes financial metadata back to the DB.

Next steps for enrichment:
- Integrate an LLM grader to verify original-language translations (Hebrew/Greek/Aramaic) and attach Strong's numbers.
- Add provenance records for each verse when external lexicons or textual criticism sources are used.
- Create worker pool to parallelize book-by-book processing and avoid supabase timeouts.
