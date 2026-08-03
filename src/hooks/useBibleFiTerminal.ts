/**
 * useBibleFiTerminal — client for the natural-language command brain.
 *
 * Sends a plain-English command ("swap 1 ETH to USDC", "tithe $50 a month",
 * "send 0.1 ETH privately") to the biblefi-terminal edge function, which
 * returns a STRUCTURED, non-custodial action plan + a biblical (BWSP) note.
 * The client then routes that plan to the existing execution hooks — the
 * user's own wallet signs. Nothing is custodial.
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TerminalActionType =
  | 'swap' | 'tithe_stream' | 'private_give' | 'bwtya_invest' | 'advice' | 'balance' | 'unknown';

export interface TerminalAction {
  type: TerminalActionType;
  fromToken?: string;
  toToken?: string;
  asset?: string;
  amount?: string;
  period?: 'day' | 'week' | 'month';
  risk?: 'conservative' | 'moderate' | 'aggressive';
  recipient?: string;
  question?: string;
  clarification?: string;
}

export interface TerminalResult {
  command: string;
  action: TerminalAction;
  wisdom: string;
}

export interface UseBibleFiTerminalReturn {
  isParsing: boolean;
  result: TerminalResult | null;
  error: string | null;
  /** True when the AI parser isn't configured yet (LLM key missing). */
  notConfigured: boolean;
  parse: (command: string) => Promise<TerminalResult | null>;
  reset: () => void;
}

export function useBibleFiTerminal(): UseBibleFiTerminalReturn {
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<TerminalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const reset = useCallback(() => {
    setIsParsing(false);
    setResult(null);
    setError(null);
    setNotConfigured(false);
  }, []);

  const parse = useCallback(async (command: string): Promise<TerminalResult | null> => {
    const trimmed = command.trim();
    if (!trimmed) return null;
    setIsParsing(true);
    setResult(null);
    setError(null);
    setNotConfigured(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('biblefi-terminal', {
        body: { command: trimmed },
      });

      if (fnError) {
        // supabase-js wraps non-2xx as a generic message; read the real body
        // from the attached Response to detect the "no LLM provider" 503.
        let bodyMsg = '';
        let status = 0;
        const ctx = (fnError as { context?: Response }).context;
        if (ctx && typeof ctx.json === 'function') {
          status = ctx.status;
          try {
            const body = await ctx.clone().json();
            bodyMsg = String(body?.error ?? '');
          } catch { /* ignore */ }
        }
        if (status === 503 || /no llm provider/i.test(bodyMsg)) {
          setNotConfigured(true);
          setError('The AI command parser is not configured yet (an LLM API key is required).');
        } else {
          setError(bodyMsg || fnError.message || 'Command parsing failed');
        }
        return null;
      }

      if (!data?.action) {
        setError('Could not understand that command. Try rephrasing.');
        return null;
      }

      const parsed: TerminalResult = {
        command: data.command ?? trimmed,
        action: data.action as TerminalAction,
        wisdom: data.wisdom ?? '',
      };
      setResult(parsed);
      return parsed;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Command parsing failed');
      return null;
    } finally {
      setIsParsing(false);
    }
  }, []);

  return { isParsing, result, error, notConfigured, parse, reset };
}
