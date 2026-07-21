# Church Directory Health Endpoint

`GET https://<project>.supabase.co/functions/v1/church-directory-health`

Health/diagnostic endpoint for the public church directory
(`api.public_church_directory`). Reports whether the directory is serving rows
and returns a paginated sample.

## Caller modes (auto-detected)

The mode is derived from the `Authorization` header — **no query flag is
required**:

| Caller | Result |
|---|---|
| No bearer token | **200** public mode |
| Anon/publishable key as bearer (valid JWT, no user `sub`) | **200** public mode |
| Signed-in user **with** `admin` role | **200** authenticated (masked) mode |
| Signed-in user **without** `admin` role | **403** `Forbidden: admin role required` |
| Malformed/expired bearer token | **401** `Invalid or expired token` |
| Directory query fails (RLS/grant/view breakage) | **503** with the DB error message |

The legacy `?auth=1` flag is still honored for backwards compatibility: it
*forces* authenticated mode, so anonymous callers receive **401**
(`Missing bearer token`) instead of a public response.

## Query parameters

| Param | Default | Notes |
|---|---|---|
| `page` | `1` | 1-based page index |
| `pageSize` | `25` | clamped to 1–100 |
| `auth` | – | legacy: `1`/`true`/`yes` forces authenticated mode |

## Response contract

### 200 — public mode

```json
{
  "status": "ok",
  "healthy": true,
  "mode": "public",
  "count": 846,
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalPages": 34,
    "from": 0,
    "to": 24,
    "returned": 25,
    "hasMore": true
  },
  "sample": [
    {
      "id": "91109128-767c-4cbc-9565-8bf801161e7a",
      "name": "Grace Community Church",
      "city": "New York",
      "country": "United States",
      "denomination": "Baptist",
      "verified": false,
      "accepts_crypto": true
    }
  ],
  "checked_at": "2026-07-21T01:48:46.501Z",
  "latency_ms": 317
}
```

`healthy` is `true` iff `count > 0`. Pagination metadata: `from`/`to` are
0-based row offsets into the full result set (`to` is clamped to the last
row), `returned` is the number of sample rows actually included, and
`hasMore` is `page < totalPages`.

### 200 — authenticated (masked) mode, admin only

Same top-level shape, but `"mode": "authenticated"` and each sample row is
masked: `name` and `city` are replaced with `name_masked` / `city_masked`.
`name` keeps its first **3** characters, `city` its first **2**; the remainder
becomes `*` (minimum 3 asterisks). `null`/empty values stay `null`.

```json
{
  "status": "ok",
  "healthy": true,
  "mode": "authenticated",
  "count": 846,
  "pagination": { "page": 1, "pageSize": 25, "totalPages": 34, "from": 0, "to": 24, "returned": 25, "hasMore": true },
  "sample": [
    {
      "id": "91109128-767c-4cbc-9565-8bf801161e7a",
      "name_masked": "Gra*******************",
      "city_masked": "Ne******",
      "country": "United States",
      "denomination": "Baptist",
      "verified": false,
      "accepts_crypto": true
    }
  ],
  "checked_at": "2026-07-21T01:48:46.501Z",
  "latency_ms": 245
}
```

### Error responses (401 / 403 / 500 / 503)

```json
{
  "status": "error",
  "healthy": false,
  "error": "Forbidden: admin role required",
  "checked_at": "2026-07-21T01:48:46.827Z"
}
```

| Status | `error` value |
|---|---|
| 401 | `Missing bearer token` (forced auth, no token) or `Invalid or expired token` |
| 403 | `Forbidden: admin role required` |
| 500 | `Role lookup failed` (has_role RPC errored) |
| 503 | the underlying DB/PostgREST error message (`latency_ms` included) |

All responses are `Content-Type: application/json` with `Cache-Control:
no-store` and permissive CORS headers.

## Integration test

`npm run test:health` runs
[`scripts/test-church-directory-health.mjs`](../scripts/test-church-directory-health.mjs)
against the live endpoint. The public/anonymous assertions always run; the
non-admin (403) and admin (masked 200) assertions additionally require
`SUPABASE_SERVICE_ROLE_KEY` in the environment — the script then creates two
ephemeral email-confirmed test users (one granted `admin` in
`public.user_roles`), asserts both paths, and deletes the users and role
grant afterwards.

```sh
# public-mode checks only
npm run test:health

# full three-mode matrix
SUPABASE_SERVICE_ROLE_KEY=<service role key> npm run test:health
```

Admin role is checked via the `public.has_role(user_id, 'admin')` SECURITY
DEFINER function backed by `public.user_roles`.
