**GitHub Copilot Workflow Conventions — BibleFI**

- Keep feature boundaries explicit:
  - `src/pages/auth/*` — UI for authentication (Supabase email/password flows)
  - `supabase/functions/*` — Edge functions (Deno) for server-side operations (CORS, limited runtime)
  - `src/services/*` — Reusable application services (crawler, payment services, church services)
  - `scripts/*` — One-off or maintenance scripts (db upserts, migrations)
  - `src/ai/*` — AI agents and orchestration

- Naming:
  - Use `process-` prefix for serverless function names (e.g., `process-fiat-tithe`) so Copilot can infer intent.
  - Keep service classes singular and focused (e.g., `FiatPaymentService`, `BiblicalFinanceCrawlerService`).

- Copilot-friendly patterns:
  - Small, focused files with clear exports (one primary responsibility per file).
  - Provide explicit JSDoc or top-of-file comments describing intent and side-effects.
  - Prefer small helper functions instead of huge monolithic functions.

- Testing & Safety:
  - Use `scripts/` for idempotent DB tasks and provide `--dry-run` flags when possible.
  - Edge functions should be resilient to missing env vars and use safe defaults.

- Onboarding Copilot to the codebase:
  - Keep `src/ai/README.md` and `docs/copilot-workflow.md` up to date; they are Copilot discovery points.
  - Add small `EXAMPLES.md` in new features showing how to call the API endpoints and agent methods.

This document is intentionally short — expand as needed when adding larger features or workflows.
