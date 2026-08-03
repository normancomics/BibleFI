// Palantir Foundry REST Client
//
// Thin, authenticated wrapper around the Foundry REST API v2 and
// the Ontology Objects / Actions endpoints.  This is intentionally
// framework-agnostic so it can run in Deno (edge functions) or in
// the Vite browser bundle.
//
// Foundry API reference
// ─────────────────────
// Objects :  POST /api/v2/ontologies/{ontologyRid}/objects/{objectType}/search
// Actions  :  POST /api/v2/ontologies/{ontologyRid}/actions/{actionType}/apply
// Datasets :  GET  /foundry-catalog/api/catalog/datasets/{datasetRid}/branches/{branch}/files
//
// Configuration is read from environment variables at call time so
// the client is safe to instantiate at module load.

import type {
  FoundryConfig,
  FoundryObjectPage,
  FoundryObjectType,
  FoundryActionType,
  BWSPSynthesizeActionRequest,
  BWSPSynthesizeActionResponse,
  BWTYAScoreBatchActionRequest,
  BWTYAScoreBatchActionResponse,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function baseUrl(cfg: FoundryConfig): string {
  return cfg.baseUrl ?? `https://${cfg.stack}`;
}

function authHeader(cfg: FoundryConfig): Record<string, string> {
  return {
    'Authorization': 'Bearer ' + cfg.token,
    'Content-Type': 'application/json',
  };
}

async function foundryFetch<T>(
  cfg: FoundryConfig,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${baseUrl(cfg)}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeader(cfg),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new FoundryError(res.status, res.statusText, body, url);
  }

  return res.json() as Promise<T>;
}

export class FoundryError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
    public readonly url: string,
  ) {
    super(`Foundry API ${status} ${statusText} — ${url}: ${body.slice(0, 200)}`);
    this.name = 'FoundryError';
  }
}

// ────────────────────────────────────────────────────────────────────────────
// FoundryClient
// ────────────────────────────────────────────────────────────────────────────

export class FoundryClient {
  constructor(private readonly cfg: FoundryConfig) {}

  // ── Ontology Objects ───────────────────────────────────────────────────

  /**
   * Search ontology objects of a given type using Foundry's object search API.
   * Supports filter expressions and cursor-based pagination.
   */
  async searchObjects<T = Record<string, unknown>>(
    objectType: FoundryObjectType,
    options: {
      where?: Record<string, unknown>;
      orderBy?: { field: string; direction?: 'ASC' | 'DESC' }[];
      pageSize?: number;
      pageToken?: string;
    } = {},
  ): Promise<FoundryObjectPage<T>> {
    const path = `/api/v2/ontologies/${this.cfg.ontologyRid}/objects/${objectType}/search`;
    const body: Record<string, unknown> = { pageSize: options.pageSize ?? 100 };
    if (options.where)   body.where   = options.where;
    if (options.orderBy) body.orderBy = options.orderBy;
    if (options.pageToken) body.pageToken = options.pageToken;

    return foundryFetch<FoundryObjectPage<T>>(this.cfg, path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get a single ontology object by its primary key.
   */
  async getObject<T = Record<string, unknown>>(
    objectType: FoundryObjectType,
    primaryKey: string,
  ): Promise<T | null> {
    const path = `/api/v2/ontologies/${this.cfg.ontologyRid}/objects/${objectType}/${encodeURIComponent(primaryKey)}`;
    try {
      return await foundryFetch<T>(this.cfg, path);
    } catch (err) {
      if (err instanceof FoundryError && err.status === 404) return null;
      throw err;
    }
  }

  /**
   * Upsert an ontology object (create or update by primary key).
   * Uses the Foundry Objects Batch Write API.
   */
  async upsertObject<T extends { primaryKey: string }>(
    objectType: FoundryObjectType,
    obj: T,
  ): Promise<void> {
    const path = `/api/v2/ontologies/${this.cfg.ontologyRid}/objects/${objectType}/batchApplyObjectEdits`;
    await foundryFetch<void>(this.cfg, path, {
      method: 'POST',
      body: JSON.stringify({
        edits: [{ type: 'modifyObject', primaryKey: obj.primaryKey, properties: obj }],
      }),
    });
  }

  /**
   * Batch upsert multiple objects of the same type.
   */
  async batchUpsertObjects<T extends { primaryKey: string }>(
    objectType: FoundryObjectType,
    objects: T[],
  ): Promise<void> {
    if (objects.length === 0) return;
    const path = `/api/v2/ontologies/${this.cfg.ontologyRid}/objects/${objectType}/batchApplyObjectEdits`;
    // Foundry batch limit is 500 objects per request
    const BATCH_LIMIT = 500;
    for (let i = 0; i < objects.length; i += BATCH_LIMIT) {
      const slice = objects.slice(i, i + BATCH_LIMIT);
      await foundryFetch<void>(this.cfg, path, {
        method: 'POST',
        body: JSON.stringify({
          edits: slice.map((o) => ({
            type: 'modifyObject',
            primaryKey: o.primaryKey,
            properties: o,
          })),
        }),
      });
    }
  }

  /**
   * Create a link between two objects.
   */
  async createLink(
    objectType: FoundryObjectType,
    primaryKey: string,
    linkType: string,
    targetObjectType: FoundryObjectType,
    targetPrimaryKey: string,
  ): Promise<void> {
    const path = `/api/v2/ontologies/${this.cfg.ontologyRid}/objects/${objectType}/${encodeURIComponent(primaryKey)}/links/${linkType}/${encodeURIComponent(targetPrimaryKey)}`;
    await foundryFetch<void>(this.cfg, path, { method: 'PUT', body: '{}' });
  }

  // ── AIP Actions ─────────────────────────────────────────────────────────

  /**
   * Apply a Foundry Action and return its synchronous response.
   * For async actions use applyActionAsync.
   */
  async applyAction<TReq, TRes>(
    actionType: FoundryActionType,
    parameters: TReq,
  ): Promise<TRes> {
    const path = `/api/v2/ontologies/${this.cfg.ontologyRid}/actions/${actionType}/apply`;
    return foundryFetch<TRes>(this.cfg, path, {
      method: 'POST',
      body: JSON.stringify({ parameters }),
    });
  }

  // ── Typed AIP Action helpers ─────────────────────────────────────────────

  async bwspSynthesizeWisdom(
    params: BWSPSynthesizeActionRequest['parameters'],
  ): Promise<BWSPSynthesizeActionResponse> {
    return this.applyAction('biblefi.BWSPSynthesizeWisdom', params);
  }

  async bwtyaScoreBatch(
    params: BWTYAScoreBatchActionRequest['parameters'],
  ): Promise<BWTYAScoreBatchActionResponse> {
    return this.applyAction('biblefi.BWTYAScoreBatch', params);
  }

  // ── Vector / semantic search ─────────────────────────────────────────────

  /**
   * Search Scripture objects by semantic similarity using Foundry's
   * vector index (text-embedding-3-large 3072-d).
   */
  async semanticSearchScriptures(
    queryText: string,
    topK = 8,
    filters?: { category?: string; tripleCheckStatus?: 'passed' },
  ): Promise<Array<{ reference: string; text: string; similarity: number; strongsNumbers: string[] }>> {
    const path = `/api/v2/ontologies/${this.cfg.ontologyRid}/objects/biblefi.Scripture/semanticSearch`;
    const body: Record<string, unknown> = { query: queryText, limit: topK };
    if (filters) body.filters = filters;

    const res = await foundryFetch<{ results: Array<{
      properties: { reference: string; kjvText: string; strongsNumbers: string[] };
      score: number;
    }> }>(this.cfg, path, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return res.results.map((r) => ({
      reference: r.properties.reference,
      text: r.properties.kjvText,
      similarity: r.score,
      strongsNumbers: r.properties.strongsNumbers ?? [],
    }));
  }

  // ── Dataset access ───────────────────────────────────────────────────────

  /**
   * Read a page of rows from a Foundry dataset.
   * datasetRid format: "ri.foundry.main.dataset.<uuid>"
   */
  async readDataset<T = Record<string, unknown>>(
    datasetRid: string,
    branch = 'master',
    pageSize = 1000,
    pageToken?: string,
  ): Promise<{ data: T[]; nextPageToken?: string }> {
    const params = new URLSearchParams({ pageSize: String(pageSize) });
    if (pageToken) params.set('pageToken', pageToken);
    const path = `/foundry-catalog/api/catalog/datasets/${datasetRid}/branches/${branch}/rows?${params}`;
    return foundryFetch<{ data: T[]; nextPageToken?: string }>(this.cfg, path);
  }

  // ── Health check ─────────────────────────────────────────────────────────

  async ping(): Promise<{ status: 'ok'; stack: string }> {
    await foundryFetch(this.cfg, `/api/v2/ontologies/${this.cfg.ontologyRid}`, { method: 'GET' });
    return { status: 'ok', stack: this.cfg.stack };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Singleton factory — reads config from environment variables
// ────────────────────────────────────────────────────────────────────────────

export function createFoundryClient(): FoundryClient {
  const stack    = import.meta.env?.VITE_PALANTIR_STACK    ?? Deno?.env?.get('PALANTIR_STACK')    ?? '';
  const token    = import.meta.env?.VITE_PALANTIR_TOKEN    ?? Deno?.env?.get('PALANTIR_TOKEN')    ?? '';
  const ontRid   = import.meta.env?.VITE_PALANTIR_ONT_RID  ?? Deno?.env?.get('PALANTIR_ONT_RID')  ?? '';
  const baseUrl  = import.meta.env?.VITE_PALANTIR_BASE_URL ?? Deno?.env?.get('PALANTIR_BASE_URL') ?? undefined;

  if (!stack || !token || !ontRid) {
    throw new Error(
      'Palantir Foundry not configured. Set PALANTIR_STACK, PALANTIR_TOKEN, PALANTIR_ONT_RID.',
    );
  }

  return new FoundryClient({ stack, token, ontologyRid: ontRid, baseUrl });
}

// Lazy singleton (only instantiated when first used)
let _client: FoundryClient | null = null;

export function getFoundryClient(): FoundryClient {
  if (!_client) _client = createFoundryClient();
  return _client;
}
