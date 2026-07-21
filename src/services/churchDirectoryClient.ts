/**
 * Reliability + observability wrapper for church directory reads.
 *
 * Every read of the public church directory should go through runDirectoryQuery,
 * which adds:
 *  - structured logging: one JSON console line per request with the exact path
 *    (view vs RPC), PostgREST error code/message/details/hint, row count and
 *    duration — RLS/grant failures (e.g. 42501) become immediately visible
 *  - server-side failure reporting via api.log_church_directory_request, so
 *    breakages are queryable in public.church_directory_request_logs
 *  - retry with backoff for transient PostgREST/permission glitches
 *  - fallback to the api.get_public_church_directory() SECURITY DEFINER RPC
 *    when the view path fails
 *  - a short-lived cache with stale-if-error fallback, so a temporary Supabase
 *    glitch doesn't render as an empty list or a zero count
 */
import { supabaseApi } from '@/integrations/supabase/apiClient';

export const DIRECTORY_VIEW_PATH = 'api.public_church_directory';
export const DIRECTORY_RPC_PATH = 'api.get_public_church_directory';

/** Row shape served by api.public_church_directory and its RPC equivalent. */
export interface DirectoryRow {
  id: string;
  name: string;
  city: string;
  state_province: string | null;
  country: string;
  denomination: string | null;
  address: string | null;
  postal_code?: string | null;
  website: string | null;
  verified: boolean;
  accepts_crypto: boolean;
  accepts_fiat: boolean;
  accepts_cards: boolean;
  accepts_checks?: boolean | null;
  rating: number;
  review_count?: number | null;
  /** Postgres `point` — shape varies by client, cast at the use site. */
  coordinates: unknown;
  masked_email: string | null;
  masked_phone: string | null;
  masked_crypto_address: string | null;
  crypto_networks: string[] | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DirectoryError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export type DirectorySource = 'view' | 'rpc-fallback' | 'cache' | 'stale-cache';

export interface DirectoryQueryOutcome<T> {
  data: T[];
  count: number | null;
  source: DirectorySource;
  /** Last error seen — set when serving stale data or when everything failed. */
  error: DirectoryError | null;
}

interface QueryResponse<T> {
  data: T[] | null;
  error: unknown;
  count?: number | null;
}

const FRESH_TTL_MS = 60_000; // serve from cache without hitting the network
const STALE_TTL_MS = 10 * 60_000; // acceptable as fallback when all retries fail
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 300;

const cache = new Map<string, { at: number; data: unknown[]; count: number | null }>();

function newRequestId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function toDirectoryError(error: unknown): DirectoryError {
  const e = error as { code?: string; message?: string; details?: string; hint?: string };
  return {
    code: e?.code,
    message: e?.message ?? String(error),
    details: e?.details,
    hint: e?.hint,
  };
}

interface LogEntry {
  requestId: string;
  operation: string;
  path: string;
  success: boolean;
  rowCount?: number | null;
  durationMs?: number;
  error?: DirectoryError | null;
  context?: Record<string, unknown>;
  /** Failures and fallback recoveries are also reported to the server log. */
  reportToServer?: boolean;
}

function logDirectoryEvent(entry: LogEntry): void {
  const payload = {
    tag: 'church-directory',
    request_id: entry.requestId,
    operation: entry.operation,
    path: entry.path,
    success: entry.success,
    row_count: entry.rowCount ?? null,
    duration_ms: entry.durationMs ?? null,
    error_code: entry.error?.code ?? null,
    error_message: entry.error?.message ?? null,
    error_details: entry.error?.details ?? null,
    error_hint: entry.error?.hint ?? null,
    ...entry.context,
  };
  if (entry.success) {
    console.info('[church-directory]', JSON.stringify(payload));
  } else {
    console.error('[church-directory]', JSON.stringify(payload));
  }

  if (entry.reportToServer) {
    // Fire-and-forget; never let telemetry break the caller.
    supabaseApi
      .rpc('log_church_directory_request', {
        p_operation: entry.operation,
        p_path: entry.path,
        p_success: entry.success,
        p_row_count: entry.rowCount ?? null,
        p_duration_ms: entry.durationMs ?? null,
        p_error_code: entry.error?.code ?? null,
        p_error_message: entry.error?.message ?? null,
        p_error_details: entry.error?.details ?? null,
        p_error_hint: entry.error?.hint ?? null,
        p_request_id: entry.requestId,
        p_context: entry.context ?? {},
      })
      .then(({ error }) => {
        if (error) console.warn('[church-directory] server log failed:', error.message);
      });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  run: () => PromiseLike<QueryResponse<T>>,
  attempts: number,
): Promise<QueryResponse<T>> {
  let last: QueryResponse<T> = { data: null, error: new Error('no attempts made') };
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(RETRY_BASE_DELAY_MS * Math.pow(3, i - 1));
    try {
      last = await run();
    } catch (e) {
      last = { data: null, error: e };
    }
    if (!last.error) return last;
  }
  return last;
}

export interface RunDirectoryQueryOptions<T> {
  /** e.g. 'count', 'search', 'get' — shows up in logs. */
  operation: string;
  /** Cache key; identical keys share cached results. */
  cacheKey: string;
  /** Builds and runs the primary (view) query. Called fresh on each retry. */
  run: () => PromiseLike<QueryResponse<T>>;
  /**
   * Optional fallback when the view path exhausts its retries — typically the
   * api.get_public_church_directory() RPC plus client-side filtering.
   */
  fallback?: () => Promise<QueryResponse<T>>;
  context?: Record<string, unknown>;
}

export async function runDirectoryQuery<T>(opts: RunDirectoryQueryOptions<T>): Promise<DirectoryQueryOutcome<T>> {
  const requestId = newRequestId();
  const cached = cache.get(opts.cacheKey);
  const now = Date.now();

  if (cached && now - cached.at < FRESH_TTL_MS) {
    logDirectoryEvent({
      requestId, operation: opts.operation, path: 'client-cache', success: true,
      rowCount: cached.count ?? cached.data.length, context: opts.context,
    });
    return { data: cached.data as T[], count: cached.count, source: 'cache', error: null };
  }

  // Primary path: the api.public_church_directory view, with retries.
  const t0 = Date.now();
  const primary = await withRetry(opts.run, RETRY_ATTEMPTS);
  if (!primary.error) {
    const data = primary.data ?? [];
    const count = primary.count ?? data.length;
    cache.set(opts.cacheKey, { at: Date.now(), data, count });
    logDirectoryEvent({
      requestId, operation: opts.operation, path: DIRECTORY_VIEW_PATH, success: true,
      rowCount: count, durationMs: Date.now() - t0, context: opts.context,
    });
    return { data, count, source: 'view', error: null };
  }

  const viewError = toDirectoryError(primary.error);
  logDirectoryEvent({
    requestId, operation: opts.operation, path: DIRECTORY_VIEW_PATH, success: false,
    durationMs: Date.now() - t0, error: viewError, reportToServer: true,
    context: { ...opts.context, attempts: RETRY_ATTEMPTS },
  });

  // Fallback path: SECURITY DEFINER RPC.
  if (opts.fallback) {
    const t1 = Date.now();
    const fb = await withRetry(opts.fallback, 2);
    if (!fb.error) {
      const data = fb.data ?? [];
      const count = fb.count ?? data.length;
      cache.set(opts.cacheKey, { at: Date.now(), data, count });
      // Recovered — report it so the broken view path is visible server-side.
      logDirectoryEvent({
        requestId, operation: opts.operation, path: DIRECTORY_RPC_PATH, success: true,
        rowCount: count, durationMs: Date.now() - t1, reportToServer: true,
        context: {
          ...opts.context,
          recovered_from: DIRECTORY_VIEW_PATH,
          view_error_code: viewError.code,
          view_error_message: viewError.message,
        },
      });
      return { data, count, source: 'rpc-fallback', error: viewError };
    }
    logDirectoryEvent({
      requestId, operation: opts.operation, path: DIRECTORY_RPC_PATH, success: false,
      durationMs: Date.now() - t1, error: toDirectoryError(fb.error), reportToServer: true,
      context: opts.context,
    });
  }

  // Last resort: stale cache beats an empty list during a temporary glitch.
  if (cached && now - cached.at < STALE_TTL_MS) {
    logDirectoryEvent({
      requestId, operation: opts.operation, path: 'client-stale-cache', success: true,
      rowCount: cached.count ?? cached.data.length,
      context: { ...opts.context, stale_age_ms: now - cached.at },
    });
    return { data: cached.data as T[], count: cached.count, source: 'stale-cache', error: viewError };
  }

  return { data: [], count: null, source: 'view', error: viewError };
}

/** Church count for the home page — cached, retried, with RPC fallback. */
export async function getChurchDirectoryCount(): Promise<number> {
  const result = await runDirectoryQuery<{ id: string }>({
    operation: 'count',
    cacheKey: 'count',
    run: () => supabaseApi.from('public_church_directory').select('id', { count: 'exact', head: true }),
    fallback: async () => {
      const { data, error } = await supabaseApi.rpc('get_public_church_directory');
      return { data: (data as { id: string }[] | null) ?? null, error, count: data?.length ?? null };
    },
  });
  return result.count ?? 0;
}

/** Full directory rows via the RPC — shared fallback for filtered searches. */
export async function fetchDirectoryRowsViaRpc<T>(): Promise<QueryResponse<T>> {
  const { data, error } = await supabaseApi.rpc('get_public_church_directory');
  return { data: (data as T[] | null) ?? null, error, count: data?.length ?? null };
}
