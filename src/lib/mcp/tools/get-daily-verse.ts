import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { enforceMcpRateLimit, publicClient, requireMcpUser, sanitizeFilterText } from "../guard";

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
    const auth = requireMcpUser(ctx);
    if (auth.error) return auth.error;
    const limited = await enforceMcpRateLimit("get_daily_verse", ctx);
    if (limited.error) return limited.error;

    const supabase = publicClient();
    let q = supabase
      .from("biblical_knowledge_base")
      .select(
        "reference,verse_text,category,principle,application,defi_relevance,source_translation,source_name,source_url,source_version,reviewed_at",
      )
      .eq("provenance_status", "verified")
      .eq("review_status", "approved")
      .in("source_translation", ["KJV", "WEB"])
      .not("reviewed_at", "is", null)
      .not("source_name", "is", null)
      .not("source_url", "is", null)
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
      content: [{
        type: "text",
        text:
          `${pick.reference} (${pick.source_translation}) — ${pick.verse_text}\n\n` +
          `Source: ${pick.source_name} (${pick.source_url})` +
          `${pick.source_version ? ` · ${pick.source_version}` : ""}\n` +
          `Reviewed: ${pick.reviewed_at}\n\nPrinciple: ${pick.principle}`,
      }],
      structuredContent: { verse: pick },
    };
  },
});
