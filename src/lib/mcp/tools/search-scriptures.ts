import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_scriptures",
  title: "Search biblical financial scriptures",
  description:
    "Full-text search of the BibleFi biblical knowledge base for verses, principles, and DeFi application notes. Returns up to 10 matching scriptures.",
  inputSchema: {
    query: z.string().min(1).describe("Keyword or phrase to search for (e.g. 'tithing', 'stewardship', 'debt')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("biblical_knowledge_base")
      .select("reference,verse_text,category,principle,application,defi_relevance")
      .or(
        `verse_text.ilike.%${query}%,reference.ilike.%${query}%,principle.ilike.%${query}%,category.ilike.%${query}%`,
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
