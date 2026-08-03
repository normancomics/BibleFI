import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { enforceMcpRateLimit, publicClient, sanitizeFilterText } from "../guard";

export default defineTool({
  name: "get_daily_verse",
  title: "Get a biblical financial verse",
  description:
    "Returns one scripture from the BibleFi knowledge base, optionally filtered by category (e.g. 'tithing', 'stewardship').",
  inputSchema: {
    category: z.string().max(60).optional().describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ category }, ctx) => {
    const limited = await enforceMcpRateLimit("get_daily_verse", ctx);
    if (limited.error) return limited.error;

    const supabase = publicClient();
    let q = supabase
      .from("biblical_knowledge_base")
      .select("reference,verse_text,category,principle,application,defi_relevance")
      .limit(50);
    const safeCategory = category ? sanitizeFilterText(category, 60) : "";
    if (safeCategory) q = q.ilike("category", `%${safeCategory}%`);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: `Query failed: ${error.message}` }], isError: true };
    }
    const rows = data ?? [];
    if (rows.length === 0) {
      return { content: [{ type: "text", text: "No verses found." }] };
    }
    const pick = rows[Math.floor(Math.random() * rows.length)];
    return {
      content: [{ type: "text", text: `${pick.reference} — ${pick.verse_text}\n\nPrinciple: ${pick.principle}` }],
      structuredContent: { verse: pick },
    };
  },
});
