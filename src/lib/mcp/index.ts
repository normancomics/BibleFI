import { defineMcp } from "@lovable.dev/mcp-js";
import searchScripturesTool from "./tools/search-scriptures";
import findChurchesTool from "./tools/find-churches";
import getDailyVerseTool from "./tools/get-daily-verse";

export default defineMcp({
  name: "biblefi-mcp",
  title: "BibleFi MCP",
  version: "0.1.0",
  instructions:
    "Read-only BibleFi tools. `search_scriptures` and `get_daily_verse` return only human-reviewed KJV/WEB passages with source provenance. `find_churches` searches the public church directory and returns masked data. All tools require authentication.",
  tools: [searchScripturesTool, findChurchesTool, getDailyVerseTool],
});
