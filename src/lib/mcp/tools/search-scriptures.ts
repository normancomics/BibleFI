import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { enforceMcpRateLimit, publicClient, sanitizeFilterText } from "../guard";

export default defineTool({
  name: "search_scriptures",
  title: "Search biblical financial scriptures",
  description:
    "Full-text search of the BibleFi biblical knowledge base for verses, principles, and DeFi application notes. Returns up to 10 matching scriptures.",
  inputSchema: {
    query: z
      .string()
      .min(1)
      .max(100)
      .describe("Keyword or phrase to search for (e.g. 'tithing', 'stewardship', 'debt')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query }, ctx) => {
    const limited = await enforceMcpRateLimit("search_scriptures", ctx);
    if (limited.error) return limited.error;

    const safe = sanitizeFilterText(query);
    if (!safe) {
      return {
        content: [{ type: "text", text: "Please provide a searchable word or phrase." }],
        isError: true,
      };
    }

    const supabase = publicClient();
    const { data, error } = await supabase
      .from("biblical_knowledge_base")
      .select("reference,verse_text,category,principle,application,defi_relevance")
      .or(
        `verse_text.ilike.%${safe}%,reference.ilike.%${safe}%,principle.ilike.%${safe}%,category.ilike.%${safe}%`,
      )
      .limit(10);
    if (error) {
      return { content: [{ type: "text", text: `Search failed: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { results: data ?? [] },
    };
  },
});
