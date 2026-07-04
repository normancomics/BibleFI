import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "get_daily_verse",
  title: "Get a biblical financial verse",
  description: "Returns one scripture from the BibleFi knowledge base, optionally filtered by category (e.g. 'tithing', 'stewardship').",
  inputSchema: {
    category: z.string().optional().describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ category }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("biblical_knowledge_base")
      .select("reference,verse_text,category,principle,application,defi_relevance")
      .limit(50);
    if (category) q = q.ilike("category", `%${category}%`);
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
