/**
 * MCPValidationError
 *
 * Displays user-safe, actionable error messages when an MCP tool input is
 * rejected (validation failure, sanitization, or rate limit).  Maps known
 * error patterns to clear guidance with a biblical encouragement.
 */
import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export type MCPErrorKind =
  | 'rate_limited'
  | 'invalid_input'
  | 'sanitized'
  | 'bwsp_blocked'
  | 'generic';

export interface MCPValidationErrorProps {
  kind: MCPErrorKind;
  /** Raw error message from the MCP tool (will be sanitized before display) */
  rawMessage?: string;
  /** Seconds until rate-limit resets (for rate_limited kind) */
  retryAfterSeconds?: number;
  /** Called when the user clicks "Try Again" */
  onRetry?: () => void;
  className?: string;
}

const KIND_META: Record<
  MCPErrorKind,
  { icon: React.ReactNode; title: string; suggestion: string; scripture: string }
> = {
  rate_limited: {
    icon: <Clock className="w-4 h-4" />,
    title: 'Too Many Requests',
    suggestion:
      'You have reached the request limit. Please wait a moment before trying again. ' +
      'The system resets every minute.',
    scripture: '"Let all things be done decently and in order." — 1 Corinthians 14:40',
  },
  invalid_input: {
    icon: <ShieldAlert className="w-4 h-4" />,
    title: 'Input Not Accepted',
    suggestion:
      'Your search query contains characters that are not allowed (such as quotes, ' +
      'parentheses, or special symbols). Please use plain words and spaces only.',
    scripture: '"The entrance of thy words giveth light." — Psalm 119:130',
  },
  sanitized: {
    icon: <ShieldAlert className="w-4 h-4" />,
    title: 'Query Cleaned',
    suggestion:
      'Some characters were removed from your input to keep the search safe. ' +
      'Try rephrasing using simple words (e.g. "tithing" or "stewardship").',
    scripture: '"A pure heart produces pure speech." — Matthew 12:34',
  },
  bwsp_blocked: {
    icon: <AlertTriangle className="w-4 h-4" />,
    title: 'BWSP Approval Required',
    suggestion:
      'The yield strategy engine requires a completed Biblical Wisdom synthesis before ' +
      'it can run. Please submit a BWSP query first so the triple-check can pass.',
    scripture: '"Do not be hasty in the laying on of hands." — 1 Timothy 5:22',
  },
  generic: {
    icon: <AlertTriangle className="w-4 h-4" />,
    title: 'Something Went Wrong',
    suggestion:
      'An unexpected error occurred. Please check your input and try again. ' +
      'If the problem persists, refresh the page.',
    scripture: '"In all thy ways acknowledge him, and he shall direct thy paths." — Proverbs 3:6',
  },
};

/**
 * Infer the error kind from a raw MCP tool error message string.
 * Callers can also set the kind directly when they know it.
 */
export function inferMCPErrorKind(message: string): MCPErrorKind {
  const lower = message.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('retry in')) return 'rate_limited';
  if (lower.includes('bwsp') || lower.includes('triple-check') || lower.includes('blocked')) return 'bwsp_blocked';
  if (lower.includes('searchable word') || lower.includes('letters and spaces')) return 'invalid_input';
  return 'generic';
}

const MCPValidationError: React.FC<MCPValidationErrorProps> = ({
  kind,
  rawMessage,
  retryAfterSeconds,
  onRetry,
  className,
}) => {
  const meta = KIND_META[kind];

  return (
    <Alert
      variant="destructive"
      className={`border-red-500/30 bg-red-950/20 text-red-300 ${className ?? ''}`}
    >
      <span className="text-red-400">{meta.icon}</span>
      <AlertTitle className="text-red-300 font-semibold">{meta.title}</AlertTitle>
      <AlertDescription className="space-y-2 mt-1">
        <p className="text-red-200/80">{meta.suggestion}</p>
        {kind === 'rate_limited' && retryAfterSeconds != null && retryAfterSeconds > 0 && (
          <p className="text-yellow-400 text-xs">
            Please wait <strong>{retryAfterSeconds}s</strong> before trying again.
          </p>
        )}
        <p className="text-white/30 text-xs italic">{meta.scripture}</p>
        {/* Surface the raw message in a collapsed note for developers */}
        {rawMessage && (
          <details className="text-xs text-red-500/50 mt-1">
            <summary className="cursor-pointer">Technical details</summary>
            <pre className="mt-1 whitespace-pre-wrap break-all">{rawMessage.slice(0, 300)}</pre>
          </details>
        )}
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="mt-2 border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default MCPValidationError;
