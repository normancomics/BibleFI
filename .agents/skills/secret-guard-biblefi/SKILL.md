---
name: secret-guard-biblefi
description: Security guard for Aaron's biblefi repo (https://github.com/normancomics/BibleFI), covering exposed-secret audits, .env leak checks, installing the Secret Guard alert and auto-fix system, and key rotation after a leak. Use this skill whenever the user mentions BibleFI, BibleFi, Bible.fi, biblefi.eth, Tap-To-Tithe, BWSP, BWTYA together with security, secrets, .env, API keys, leaks, exposure, gitleaks, push protection, alerts, rotating keys, or "is anything exposed", even if they don't say "Secret Guard".
---

# Secret Guard: biblefi

**Repo:** https://github.com/normancomics/BibleFI
**Project:** BibleFI (Bible.fi) faith-based DeFi protocol

## Repo facts
Biblically-based DeFi on Base (chain ID 8453), deployed as a Farcaster mini-app. Vite/React/TS frontend built with Lovable (`.lovable/`), bun + npm lockfiles, Supabase (`supabase/`: edge functions, pg_cron), Foundry contracts in `contracts_forge/` plus `contracts/`, `circuits/`, `script/` and `scripts/`, and `.claude/`. It **already has `.github/`**, so add files; never replace the folder. `.gitignore` already covers `.env`, `.env.*`, `!.env.example`, Foundry `lib/cache/out`, and `deployments/`.

## Repo-specific risks
- A stale cached listing once showed a root `.env`, but the live file returns 404 and it may have been the earlier false alarm. Confirm with `git log --all --oneline -- .env` (in a Codespace on iPad). Empty output means it was never committed.
- **Foundry:** `PRIVATE_KEY` / deployer keys belong only in the local `.env` or `cast wallet` keystores, never in `script/*.s.sol` or `foundry.toml`. `broadcast/` JSON holds tx data, not keys, but review before committing.
- **pg_cron credential wall:** `rotate_cron_job_secret()` updates the secrets table but not credentials hardcoded in cron command bodies. After any rotation, audit `cron.job` commands.
- 18 open PRs and many branches: secrets can live on non-`main` branches too.
- Lovable syncs commits directly, so its commits bypass local pre-commit hooks. Push protection and the workflow are the guards here.

## Modes (pick based on the request)

### 1. Audit ("is anything exposed?")
1. `web_fetch` the repo root and list the top-level files. Flag any `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, `keystore`, `id_rsa`, or `credentials*`.
2. Fetch `.gitignore` and confirm it contains `.env`, `.env.*`, and `!.env.example`.
3. Fetch `.env.example` if present and confirm it holds only placeholders or flags.
4. **Check freshness:** GitHub pages can be served from a stale cache. If a file is listed but its blob returns 404, report it as **unconfirmed** rather than exposed, and give the user `git log --all --oneline -- <file>` to settle it.
5. GitHub blocks automated access to commit history and some folders. Say exactly what could not be checked; never guess.
6. Report: clean / exposed / unconfirmed, plus the exact file and what it held.

### 2. Install Secret Guard
Deliver the three files in `assets/` with these exact repo paths:

| Asset | Save in repo as |
|---|---|
| `assets/secret-guard.yml` | `.github/workflows/secret-guard.yml` |
| `assets/gitleaks.toml` | `.gitleaks.toml` |
| `assets/pre-commit-config.yaml` | `.pre-commit-config.yaml` |

User setup, iPad-friendly (Safari at github.com, not the GitHub app):
1. **Settings → Actions → General:** Read and write, and allow Actions to create and approve PRs.
2. **Settings → Code security:** Secret scanning, Push protection, Dependabot alerts, CodeQL default setup. Uses bun + npm lockfiles; Dependabot npm works via `package-lock.json`.
3. **Add file → Create new file:** type the path (the `/` creates folders), paste the contents, commit to `main`.
4. Optional: add the `TG_ALERT_BOT_TOKEN` and `TG_ALERT_CHAT_ID` repo secrets for Telegram alerts (use a bot separate from any production bot).
5. **Actions tab:** confirm Secret Guard runs; merge any auto-fix PR.
6. Pre-commit hooks require a terminal (Mac, or a Codespace on iPad). They don't guard web or Lovable commits.

### 3. Incident response (a secret was exposed)
Order matters: **rotate first, purge second.**
- **Deployer / owner key (Base 8453):** transfer ownership, admin roles, treasury, and Superfluid streams to a fresh wallet (ideally a Safe) *before* retiring the old key.
- **Supabase:** roll the JWT secret/service_role, update Edge Function Secrets, then fix every pg_cron job body that embeds the old key.
- **Base/CDP, Superfluid, Neynar/Farcaster, Basescan/Etherscan, RPC, and OpenAI/Anthropic keys:** revoke and reissue each.
- Update the Lovable and Vercel env vars, then redeploy.

Then purge from history: `git filter-repo --path <file> --invert-paths`, followed by `git push --force --all` and `git push --force --tags`. Warn the user that this rewrites history and open PRs need rebasing. Close the Secret Guard alert issue when done.

## Rules
- Answer briefly and precisely. Never claim something is clean or exposed without having fetched it.
- Nothing can "un-leak" a pushed secret; always say rotation is required.
- Make surgical edits to existing files; never restructure the user's repo or overwrite existing `.github/` content.
