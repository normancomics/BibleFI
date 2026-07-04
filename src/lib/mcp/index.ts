import { defineMcp } from "@lovable.dev/mcp-js";
import searchScripturesTool from "./tools/search-scriptures";
import findChurchesTool from "./tools/find-churches";
import getDailyVerseTool from "./tools/get-daily-verse";

export default defineMcp({
  name: "biblefi-mcp",
  title: "BibleFi MCP",
  version: "0.1.0",
  instructions:
    "Faith-based DeFi tools for BibleFi. Use `search_scriptures` to find biblical financial wisdom, `find_churches` to look up crypto-friendly congregations in the global directory, and `get_daily_verse` for a scripture drop. All tools read public, masked data only — no PII.",
  tools: [searchScripturesTool, findChurchesTool, getDailyVerseTool],
});
