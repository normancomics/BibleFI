import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { enforceMcpRateLimit, publicClient, sanitizeFilterText } from "../guard";

export default defineTool({
  name: "find_churches",
  title: "Find crypto-friendly churches",
  description:
    "Search the global BibleFi church directory. Returns masked public info only (no raw PII) — matches the app's public RLS view.",
  inputSchema: {
    query: z
      .string()
      .min(1)
      .max(100)
      .describe("City, church name, denomination, or country."),
    limit: z.number().int().min(1).max(25).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    const limited = await enforceMcpRateLimit("find_churches", ctx);
    if (limited.error) return limited.error;

    const safe = sanitizeFilterText(query);
    if (!safe) {
      return {
        content: [{ type: "text", text: "Please provide a city, church name, denomination, or country." }],
        isError: true,
      };
    }

    const supabase = publicClient();
    const { data, error } = await supabase.rpc("search_public_churches", {
      p_query: safe,
      p_limit: limit ?? 10,
    });
    if (error) {
      return { content: [{ type: "text", text: `Search failed: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { churches: data ?? [] },
    };
  },
});
