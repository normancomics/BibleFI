/**
 * BibleFi Agent Sandbox SDK
 * 
 * All subagents MUST use this module to interact with the database.
 * It enforces per-agent permissions, rate limiting, and comprehensive audit logging
 * through the agent_ops schema's SECURITY DEFINER gateway functions.
 * 
 * "The integrity of the upright guides them" - Proverbs 11:3
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

export interface AgentContext {
  agentName: string;
  runId: string | null;
  supabase: SupabaseClient<any, any>;      // api schema - for sandbox RPC calls
  supabasePublic: SupabaseClient<any, any>; // public schema - for data operations
  startTime: number;
  stats: {
    processed: number;
    created: number;
    updated: number;
    failed: number;
  };
}

export interface SandboxConfig {
  agentName: string;
  runMode?: 'scheduled' | 'manual' | 'triggered';
  metadata?: Record<string, unknown>;
}

/**
 * Create a sandboxed agent context with service role access,
 * permission checks, and audit logging.
 */
export async function createAgentSandbox(config: SandboxConfig): Promise<AgentContext> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // API schema client for sandbox gateway RPCs
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'api' },
  });

  // Public data operations also go through api schema (PostgREST only exposes api)
  const supabasePublic = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'api' },
  });

  // Start the run via SECURITY DEFINER gateway
  const { data: runId, error: runError } = await supabase.rpc('start_agent_run', {
    p_agent_name: config.agentName,
    p_run_mode: config.runMode || 'scheduled',
    p_metadata: config.metadata || {},
  });

  if (runError) {
    console.error(`🚫 Agent ${config.agentName} failed to start:`, runError.message);
    throw new Error(`Agent sandbox denied: ${runError.message}`);
  }

  console.log(`🔒 Agent sandbox initialized: ${config.agentName} (run: ${runId})`);

  return {
    agentName: config.agentName,
    runId: runId as string,
    supabase,
    supabasePublic,
    startTime: Date.now(),
    stats: { processed: 0, created: 0, updated: 0, failed: 0 },
  };
}

/**
 * Check if the agent has permission before accessing a table.
 * Enforces per-agent scoped permissions + rate limiting.
 */
export async function checkPermission(
  ctx: AgentContext,
  operation: string,
  targetTable: string
): Promise<boolean> {
  const { data: allowed, error } = await ctx.supabase.rpc('check_agent_permission', {
    p_agent_name: ctx.agentName,
    p_operation: operation,
    p_target_table: targetTable,
  });

  if (error) {
    console.error(`🚫 Permission check failed for ${ctx.agentName}:`, error.message);
    return false;
  }

  if (!allowed) {
    console.warn(`🚫 DENIED: ${ctx.agentName} → ${operation} on ${targetTable}`);
  }

  return allowed as boolean;
}

/**
 * Log an agent operation to the audit trail.
 */
export async function logOperation(
  ctx: AgentContext,
  operation: string,
  targetTable: string,
  details: {
    recordIds?: string[];
    recordsAffected?: number;
    inputSummary?: Record<string, unknown>;
    outputSummary?: Record<string, unknown>;
    errorMessage?: string;
    ipAddress?: string;
  } = {}
): Promise<void> {
  const elapsed = Date.now() - ctx.startTime;

  await ctx.supabase.rpc('log_agent_operation', {
    p_agent_name: ctx.agentName,
    p_operation: operation,
    p_target_table: targetTable,
    p_target_schema: 'public',
    p_record_ids: details.recordIds || [],
    p_records_affected: details.recordsAffected || 0,
    p_input_summary: details.inputSummary || {},
    p_output_summary: details.outputSummary || {},
    p_error_message: details.errorMessage || null,
    p_execution_time_ms: elapsed,
    p_ip_address: details.ipAddress || null,
  });
}

/**
 * Sandboxed read: checks permission, logs the read, returns data.
 */
export async function sandboxedRead(
  ctx: AgentContext,
  table: string,
  query: (from: any) => any
): Promise<{ data: any[] | null; error: any }> {
  if (!await checkPermission(ctx, 'READ', table)) {
    return { data: null, error: { message: `Permission denied: ${ctx.agentName} cannot READ ${table}` } };
  }

  const result = await query(ctx.supabasePublic.from(table));

  await logOperation(ctx, 'READ', table, {
    recordsAffected: result.data?.length || 0,
    outputSummary: { count: result.data?.length || 0 },
    errorMessage: result.error?.message,
  });

  ctx.stats.processed += result.data?.length || 0;
  return result;
}

/**
 * Sandboxed insert: checks permission, logs the insert, returns result.
 */
export async function sandboxedInsert(
  ctx: AgentContext,
  table: string,
  records: any | any[],
  options?: { onConflict?: string }
): Promise<{ data: any; error: any }> {
  const operation = 'INSERT';
  if (!await checkPermission(ctx, operation, table)) {
    return { data: null, error: { message: `Permission denied: ${ctx.agentName} cannot INSERT into ${table}` } };
  }

  const arr = Array.isArray(records) ? records : [records];
  
  let q = ctx.supabasePublic.from(table).insert(arr);
  if (options?.onConflict) {
    q = ctx.supabasePublic.from(table).upsert(arr, { onConflict: options.onConflict });
  }
  const result = await q.select();

  const createdCount = result.data?.length || 0;
  await logOperation(ctx, operation, table, {
    recordsAffected: createdCount,
    inputSummary: { count: arr.length },
    outputSummary: { created: createdCount },
    errorMessage: result.error?.message,
  });

  ctx.stats.created += createdCount;
  if (result.error) ctx.stats.failed += arr.length;

  return result;
}

/**
 * Sandboxed update: checks permission, logs the update, returns result.
 */
export async function sandboxedUpdate(
  ctx: AgentContext,
  table: string,
  updates: Record<string, unknown>,
  filter: (from: any) => any
): Promise<{ data: any; error: any }> {
  if (!await checkPermission(ctx, 'UPDATE', table)) {
    return { data: null, error: { message: `Permission denied: ${ctx.agentName} cannot UPDATE ${table}` } };
  }

  const result = await filter(ctx.supabasePublic.from(table).update(updates));

  const updatedCount = result.data?.length || 0;
  await logOperation(ctx, 'UPDATE', table, {
    recordsAffected: updatedCount,
    inputSummary: { fields: Object.keys(updates) },
    outputSummary: { updated: updatedCount },
    errorMessage: result.error?.message,
  });

  ctx.stats.updated += updatedCount;
  return result;
}

/**
 * Complete the agent run with final stats.
 */
export async function completeAgentRun(
  ctx: AgentContext,
  status: 'completed' | 'failed' = 'completed',
  errorDetails?: Record<string, unknown>
): Promise<void> {
  if (!ctx.runId) return;

  await ctx.supabase.rpc('complete_agent_run', {
    p_run_id: ctx.runId,
    p_status: status,
    p_records_processed: ctx.stats.processed,
    p_records_created: ctx.stats.created,
    p_records_updated: ctx.stats.updated,
    p_records_failed: ctx.stats.failed,
    p_error_details: errorDetails || null,
  });

  const elapsed = Date.now() - ctx.startTime;
  console.log(`🔒 Agent ${ctx.agentName} run ${status} in ${elapsed}ms | P:${ctx.stats.processed} C:${ctx.stats.created} U:${ctx.stats.updated} F:${ctx.stats.failed}`);
}

/**
 * Wrap an entire agent function with sandbox lifecycle management.
 * Handles: init → permission checks → execution → audit → cleanup.
 */
export async function withAgentSandbox(
  config: SandboxConfig,
  handler: (ctx: AgentContext) => Promise<Record<string, unknown>>
): Promise<Record<string, unknown>> {
  let ctx: AgentContext | null = null;

  try {
    ctx = await createAgentSandbox(config);
    const result = await handler(ctx);
    await completeAgentRun(ctx, 'completed');
    return { success: true, runId: ctx.runId, stats: ctx.stats, ...result };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (ctx) {
      await completeAgentRun(ctx, 'failed', { error: errMsg });
    }
    return { success: false, error: errMsg, stats: ctx?.stats };
  }
}
