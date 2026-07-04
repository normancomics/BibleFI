import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "find_churches",
  title: "Find crypto-friendly churches",
  description:
    "Search the global BibleFi church directory. Returns masked public info only (no raw PII) — matches the app's public RLS view.",
  inputSchema: {
    query: z.string().min(1).describe("City, church name, denomination, or country."),
    limit: z.number().int().min(1).max(25).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("global_churches")
      .select("id,name,city,state_province,country,denomination,verified,accepts_crypto,accepts_fiat,rating,website")
      .or(
        `name.ilike.%${query}%,city.ilike.%${query}%,denomination.ilike.%${query}%,country.ilike.%${query}%`,
      )
      .limit(limit ?? 10);
    if (error) {
      return { content: [{ type: "text", text: `Search failed: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { churches: data ?? [] },
    };
  },
});
