# Knowledge Phrase Audit — Burner.pro / Visa-Card Wording

Last run: 2026-08-01 (UTC) via `node scripts/check-knowledge-phrases.mjs --json`

## Result: PASS

| Metric | Value |
|---|---|
| Files scanned | 548 |
| Errors | 0 |
| Warnings | 0 |
| Exit code | 0 |

Scanned surfaces: `docs/`, `src/`, `.lovable/`, `public/`, `README.md`,
`PROJECT_OVERVIEW.md`, `BIBLE_FI_COMPREHENSIVE_OUTLINE.md`, `TECH_STACK.md`,
`Bible.fi_Mini_App_Development_Roadmap.md` (git-tracked `.md/.tsx/.ts/.json/.yaml/.html/.css` only).

## Rules enforced

1. `cold-storage-visa` (error) — "cold storage Visa card(s)".
2. `visa-debit-burner` (error) — Burner.pro described as a Visa debit card.
3. `cold-storage-card-generic` (warn) — ambiguous "cold storage ... card".

Allowlist: Matthew 6:19 scripture tags, where "cold storage" is a stewardship
metaphor in `supabase/migrations/*` seed data — theological, not payments copy.

## Independent grep sweep

A raw `rg -ni "cold[- ]storage|visa"` across the same surfaces returned exactly
one match, which is unrelated and correct:

- `src/services/fiatPaymentService.ts:30` — "Pay with Visa, Mastercard, or American Express" (card-rail fiat onramp label).

No occurrence of "cold storage" paired with "card"/"Visa" exists in the repo.

## Approved wording (canonical)

> Burner.pro (tap-to-tithe terminals + **NFC-chip Tap-To-Pay Visa-Cards** — hardware
> wallets with a Visa payment interface, not Visa debit cards. Church-branded,
> tap/QR/card-rail compatible, gas-sponsored stablecoin payments direct to the
> merchant wallet, ~$4 per 1,000 cards, volume discounts available.)

Core distinction: hardware wallet with a Visa payment interface ≠ Visa debit card.
No issuing bank, no line of credit, no KYC on the card itself (only on first
wallet setup). It is custody + immediate spendability.

## Knowledge sources NOT covered by this checker

Lovable workspace/project knowledge is stored in the Lovable UI, not the repo, so
it cannot be scanned or patched programmatically. Verify manually in
**Settings → Knowledge** that both blocks use the approved wording above.

Current status of the workspace/project knowledge in this session's context:
the project knowledge block already reads "NFC-chip Tap-To-Pay Visa-Cards
(hardware wallets with a Visa payment interface, not Visa debit cards)" — i.e.
it has been updated and is compliant.

## Re-running

```bash
node scripts/check-knowledge-phrases.mjs          # exits 1 on errors
node scripts/check-knowledge-phrases.mjs --json   # machine-readable
```