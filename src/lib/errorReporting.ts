/**
 * Client error reporting.
 *
 * The app previously had NO error monitoring — a throw anywhere produced a
 * white screen and left no trace. This captures crashes to the Supabase
 * project already in use (public.client_error_logs via the anonymous-callable
 * api.log_client_error RPC), so beta failures are visible without standing up
 * a third-party account.
 *
 * If VITE_SENTRY_DSN is set, errors are ALSO forwarded to Sentry. That path is
 * a runtime dynamic import, so @sentry/browser is only fetched when a DSN is
 * configured and never enters the default bundle.
 *
 * Design rules:
 *  - Never throw. An error reporter that crashes is worse than none.
 *  - Never block. All sends are fire-and-forget.
 *  - Rate-limit + dedupe, so a render loop can't spam the table or the user's
 *    network.
 */
import { supabaseApi } from '@/integrations/supabase/apiClient';

export type ErrorSource = 'react' | 'unhandledrejection' | 'window.onerror' | 'manual';

interface ReportOptions {
  source: ErrorSource;
  error: unknown;
  componentStack?: string;
  severity?: 'error' | 'warning';
  context?: Record<string, unknown>;
}

const MAX_REPORTS_PER_SESSION = 25;
const DEDUPE_WINDOW_MS = 60_000;

let sentThisSession = 0;
const recentFingerprints = new Map<string, number>();

/** Build a stable-ish group key from the message + first stack frame. */
function fingerprint(message: string, stack?: string): string {
  const firstFrame = stack?.split('\n').find((l) => l.includes('at ') || l.includes('@'))?.trim() ?? '';
  const raw = `${message}::${firstFrame}`;
  // Cheap deterministic hash (FNV-1a 32-bit), hex-encoded.
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function normalizeError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message || error.name || 'Unknown error', stack: error.stack };
  }
  if (typeof error === 'string') return { message: error };
  try {
    return { message: JSON.stringify(error).slice(0, 500) };
  } catch {
    return { message: String(error) };
  }
}

function shouldSend(fp: string): boolean {
  if (sentThisSession >= MAX_REPORTS_PER_SESSION) return false;
  const now = Date.now();
  const last = recentFingerprints.get(fp);
  if (last && now - last < DEDUPE_WINDOW_MS) return false;
  recentFingerprints.set(fp, now);
  return true;
}

function release(): string {
  try {
    return import.meta.env?.VITE_APP_RELEASE ?? import.meta.env?.MODE ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/** Optional Sentry forwarding — only if a DSN is configured. */
let sentryInit: Promise<{ captureException: (e: unknown) => void } | null> | null = null;
function getSentry() {
  if (sentryInit) return sentryInit;
  let dsn: string | undefined;
  try {
    dsn = import.meta.env?.VITE_SENTRY_DSN;
  } catch { /* ignore */ }
  if (!dsn) {
    sentryInit = Promise.resolve(null);
    return sentryInit;
  }
  const SENTRY_MODULE = '@sentry/browser';
  sentryInit = import(/* @vite-ignore */ SENTRY_MODULE)
    .then((S: { init: (o: Record<string, unknown>) => void; captureException: (e: unknown) => void }) => {
      S.init({ dsn, release: release(), tracesSampleRate: 0 });
      return { captureException: S.captureException };
    })
    .catch(() => null);
  return sentryInit;
}

/**
 * Report an error. Safe to call from anywhere; never throws, never awaits.
 */
export function reportError(opts: ReportOptions): void {
  try {
    const { message, stack } = normalizeError(opts.error);
    const fp = fingerprint(message, stack);
    if (!shouldSend(fp)) return;
    sentThisSession++;

    const route = typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : undefined;

    // Always log locally so it's visible in devtools too.
    console.error(`[biblefi:${opts.source}]`, message, { fingerprint: fp, route, stack });

    supabaseApi
      .rpc('log_client_error', {
        p_source: opts.source,
        p_message: message,
        p_severity: opts.severity ?? 'error',
        p_stack: stack ?? null,
        p_component_stack: opts.componentStack ?? null,
        p_route: route ?? null,
        p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        p_release: release(),
        p_fingerprint: fp,
        p_context: opts.context ?? {},
      })
      .then(({ error }) => {
        if (error) console.warn('[biblefi] error report failed to send:', error.message);
      });

    getSentry().then((s) => s?.captureException(opts.error));
  } catch {
    // Swallow — reporting must never break the app.
  }
}

/**
 * Install global handlers for errors React boundaries can't catch:
 * unhandled promise rejections and non-React runtime errors.
 * Idempotent.
 */
let installed = false;
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('unhandledrejection', (event) => {
    reportError({ source: 'unhandledrejection', error: event.reason });
  });

  window.addEventListener('error', (event) => {
    // Ignore resource-load errors (img/script 404s) — they have no useful error.
    if (!event.error && !event.message) return;
    reportError({
      source: 'window.onerror',
      error: event.error ?? event.message,
      context: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });
}
