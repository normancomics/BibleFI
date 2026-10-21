# Foundry Bridge (Palantir Foundry/AIP)

`supabase/functions/foundry-bridge` lets BWSP/BWTYA call Palantir Foundry
Ontology queries, including published AIP Logic functions. It stays inert
(`503 not configured`) until the secrets below are set.

## Setup

1. In Foundry, open **Developer Console → New application** and create a
   backend service app (OAuth2 client credentials). Give it access to the
   Ontology and the AIP Logic functions BibleFi should use.
2. In Supabase → Edge Functions → **Secrets**, set:

| Secret | Value |
|---|---|
| `FOUNDRY_URL` | `https://<yourname>.palantirfoundry.com` |
| `FOUNDRY_CLIENT_ID` | client ID from the Developer Console |
| `FOUNDRY_CLIENT_SECRET` | client secret (never commit or paste it anywhere else) |
| `FOUNDRY_ONTOLOGY` | Ontology API name |
| `FOUNDRY_ALLOWED_QUERIES` | comma-separated query API names the bridge may run |
| `FOUNDRY_SCOPE` | optional OAuth scopes, if your app requires them |

## Usage

Both routes require a signed-in BibleFi user (`Authorization: Bearer <supabase jwt>`).

- `GET /functions/v1/foundry-bridge` → `{ configured, allowedQueries }`
- `POST /functions/v1/foundry-bridge` with
  `{ "query": "<queryApiName>", "parameters": { ... } }` → `{ ok, query, value }`

Only allowlisted queries run, calls are rate-limited to 10/min per user, and
upstream errors return Foundry's error name only.
