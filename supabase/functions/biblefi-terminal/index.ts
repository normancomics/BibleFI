// BibleFi Terminal — the agentic command brain.
//
// Turns a natural-language command ("swap 1 ETH to USDC", "tithe $50 a month
// to my church", "send 0.1 ETH privately", "what's the safest yield?") into a
// STRUCTURED, non-custodial action plan that the client executes with the
// user's own wallet against BibleFi's existing rails:
//   swap          → Spandex meta-aggregator (useSpandexExecute)
//   tithe_stream  → Superfluid (useSuperfluid)
//   private_give  → Veil.cash (veilCashClient)
//   bwtya_invest  → x402-gated BWTYA (useX402StrategyExecute)
//   advice/balance→ read-only
//
// It NEVER moves funds or holds keys — it only returns an action plan plus a
// short biblical (BWSP) note. This is the Bankr-style "talk to it" UX on a
// non-custodial, wisdom-guided foundation.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Minimal self-contained helpers (in-memory rate limit, per cold start) ────
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(id: string, max: number, windowMs: number) {
  const now = Date.now();
  const cur = rateLimits.get(id);
  if (!cur || now > cur.resetAt) {
    rateLimits.set(id, { count: 1, resetAt: now + windowMs });
    return { allowed: true, resetAt: now + windowMs };
  }
  if (cur.count >= max) return { allowed: false, resetAt: cur.resetAt };
  cur.count++;
  return { allowed: true, resetAt: cur.resetAt };
}
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip') || 'unknown';
}
function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function rateLimitResponse(resetAt: number): Response {
  const retry = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: retry }),
    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(retry) } });
}

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');

const ACTION_TYPES = [
  'swap', 'tithe_stream', 'private_give', 'bwtya_invest', 'advice', 'balance', 'unknown',
] as const;

// Base-chain tokens the terminal understands (kept in sync with the app UI).
const KNOWN_TOKENS = ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'CBETH', 'WBTC'];

const SYSTEM_PROMPT = `You are the BibleFi Terminal, a natural-language command parser for a biblical DeFi app on Base chain.
Convert the user's message into ONE structured action by calling the dispatch_action tool.

Action types:
- swap: exchange one token for another (fields: from_token, to_token, amount). Tokens: ${KNOWN_TOKENS.join(', ')}.
- tithe_stream: start a real-time streaming tithe/offering (fields: amount, period one of day|week|month, asset default USDC, recipient optional church name or 0x address).
- private_give: anonymous/private give via ZK privacy pool (fields: amount, asset ETH|USDC, recipient optional).
- bwtya_invest: invest into a biblically-scored yield strategy (fields: amount, asset default USDC, risk one of conservative|moderate|aggressive).
- advice: the user is asking a question / wants biblical financial wisdom (field: question).
- balance: the user wants to see their portfolio/balances (no fields).
- unknown: intent unclear (field: clarification — a short question to ask back).

Rules:
- Amounts are numeric strings without currency symbols (e.g. "1", "0.5", "50").
- "$50" means amount "50" asset "USDC". "1 eth" means amount "1" token/asset "ETH".
- Never invent a recipient or amount that wasn't stated; leave optional fields empty.
- Also produce a one-sentence biblical wisdom note (scripture-grounded) relevant to the action.
- Prefer tithe_stream when the user says tithe/offering/give to a church over time.`;

// Anthropic tool schema for reliable structured extraction.
const DISPATCH_TOOL = {
  name: 'dispatch_action',
  description: 'Dispatch the parsed BibleFi action.',
  input_schema: {
    type: 'object',
    properties: {
      action_type: { type: 'string', enum: ACTION_TYPES as unknown as string[] },
      from_token: { type: 'string' },
      to_token: { type: 'string' },
      asset: { type: 'string' },
      amount: { type: 'string' },
      period: { type: 'string', enum: ['day', 'week', 'month'] },
      risk: { type: 'string', enum: ['conservative', 'moderate', 'aggressive'] },
      recipient: { type: 'string' },
      question: { type: 'string' },
      clarification: { type: 'string' },
      wisdom_note: { type: 'string' },
    },
    required: ['action_type', 'wisdom_note'],
  },
};

interface ParsedAction {
  action_type: string;
  from_token?: string;
  to_token?: string;
  asset?: string;
  amount?: string;
  period?: string;
  risk?: string;
  recipient?: string;
  question?: string;
  clarification?: string;
  wisdom_note?: string;
}

async function parseWithAnthropic(command: string): Promise<ParsedAction | null> {
  if (!ANTHROPIC_KEY) return null;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: [DISPATCH_TOOL],
      tool_choice: { type: 'tool', name: 'dispatch_action' },
      messages: [{ role: 'user', content: command }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const toolUse = (data.content ?? []).find((c: { type: string }) => c.type === 'tool_use');
  return (toolUse?.input as ParsedAction) ?? null;
}

async function parseWithOpenAI(command: string): Promise<ParsedAction | null> {
  if (!OPENAI_KEY) return null;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\nRespond ONLY with a JSON object matching the dispatch_action fields.` },
        { role: 'user', content: command },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content ?? '{}') as ParsedAction;
  } catch {
    return null;
  }
}

/** Normalise/validate the LLM output into a safe, typed action. */
function normalize(p: ParsedAction) {
  const type = ACTION_TYPES.includes(p.action_type as typeof ACTION_TYPES[number]) ? p.action_type : 'unknown';
  const upper = (s?: string) => (s ? s.trim().toUpperCase() : undefined);
  const num = (s?: string) => {
    if (!s) return undefined;
    const cleaned = s.replace(/[^0-9.]/g, '');
    return cleaned && Number(cleaned) > 0 ? cleaned : undefined;
  };
  return {
    type,
    fromToken: upper(p.from_token),
    toToken: upper(p.to_token),
    asset: upper(p.asset),
    amount: num(p.amount),
    period: ['day', 'week', 'month'].includes(p.period ?? '') ? p.period : undefined,
    risk: ['conservative', 'moderate', 'aggressive'].includes(p.risk ?? '') ? p.risk : undefined,
    recipient: p.recipient?.trim() || undefined,
    question: p.question?.trim() || undefined,
    clarification: p.clarification?.trim() || undefined,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return errorResponse('POST only', 405);

  // Rate-limit by IP (parsing is read-only, so anonymous is allowed).
  const ip = getClientIP(req);
  const rl = checkRateLimit(`biblefi-terminal:${ip}`, 30, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  let command = '';
  try {
    const body = await req.json();
    command = String(body.command ?? '').slice(0, 500).trim();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }
  if (!command) return errorResponse('command is required', 400);

  try {
    let parsed: ParsedAction | null = null;
    try {
      parsed = await parseWithAnthropic(command);
    } catch (e) {
      console.warn('[biblefi-terminal] anthropic failed, trying openai:', (e as Error).message);
    }
    if (!parsed) parsed = await parseWithOpenAI(command);
    if (!parsed) {
      return errorResponse('No LLM provider configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)', 503);
    }

    const action = normalize(parsed);
    return new Response(
      JSON.stringify({
        command,
        action,
        wisdom: parsed.wisdom_note ?? '',
        // The client executes this plan with the user's own wallet — the
        // server never holds keys or moves funds.
        custody: 'non-custodial',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('[biblefi-terminal] error:', e);
    return errorResponse('Failed to parse command', 500);
  }
});
