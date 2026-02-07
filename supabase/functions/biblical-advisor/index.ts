import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Rate limit: 20 req/min per IP
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP, 20, 60000)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query, userContext } = await req.json();
    if (!query || typeof query !== "string" || query.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'query' (max 1000 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[biblical-advisor] Query: "${query.substring(0, 80)}"`);

    // ── RAG Step 1: Retrieve relevant scriptures ──
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length > 3);

    // Search bible_verses
    const verseFilters = keywords
      .slice(0, 5)
      .map((kw: string) => `text.ilike.%${kw}%`)
      .join(",");

    const { data: verses } = await supabase
      .from("bible_verses")
      .select("book_name, chapter, verse, text, wisdom_category, defi_keywords")
      .or(verseFilters || "text.ilike.%wisdom%")
      .limit(8);

    // Search biblical_knowledge_base
    const knowledgeFilters = keywords
      .slice(0, 5)
      .flatMap((kw: string) => [`verse_text.ilike.%${kw}%`, `principle.ilike.%${kw}%`])
      .join(",");

    const { data: knowledgeBase } = await supabase
      .from("biblical_knowledge_base")
      .select("reference, verse_text, principle, application, defi_relevance, category")
      .or(knowledgeFilters || "verse_text.ilike.%wisdom%")
      .limit(5);

    const retrievedVerses = verses || [];
    const retrievedKnowledge = knowledgeBase || [];

    console.log(
      `[biblical-advisor] RAG: ${retrievedVerses.length} verses, ${retrievedKnowledge.length} knowledge entries`
    );

    // ── RAG Step 2: Build LLM context ──
    const scriptureContext = retrievedVerses
      .map(
        (v: any) =>
          `${v.book_name} ${v.chapter}:${v.verse} — "${v.text}" [Categories: ${(v.wisdom_category || []).join(", ")}] [DeFi Keywords: ${(v.defi_keywords || []).join(", ")}]`
      )
      .join("\n");

    const knowledgeContext = retrievedKnowledge
      .map(
        (k: any) =>
          `${k.reference}: "${k.verse_text}" — Principle: ${k.principle || "N/A"} — Application: ${k.application || "N/A"} — DeFi Relevance: ${k.defi_relevance || "N/A"}`
      )
      .join("\n");

    const userCtxStr = userContext
      ? `User context: wallet balance $${userContext.walletBalance || "unknown"}, risk tolerance: ${userContext.riskTolerance || "moderate"}, tithing history: ${userContext.tithingHistory || 0} transactions, primary church: ${userContext.primaryChurch || "not set"}.`
      : "";

    const systemPrompt = `You are BibleFi's Biblical Wisdom Synthesis Protocol (BWSP) — a faith-based financial advisor that grounds every recommendation in Scripture. You serve Christians worldwide who seek to honor God with their finances.

RULES:
1. Always cite specific Bible verses with book, chapter, and verse.
2. Provide practical DeFi guidance on Base Chain (staking, tithing streams via Superfluid, stablecoin yields).
3. Never encourage reckless speculation. Emphasize faithful stewardship (1 Corinthians 4:2).
4. Include a Wisdom Score (0-100) based on how well the user's question aligns with Biblical financial principles.
5. Be warm, pastoral, and encouraging — never guilt-based or manipulative.
6. Respond ONLY with valid JSON matching this exact structure (no markdown, no code blocks):
{
  "biblicalPrinciple": "Primary biblical principle (2-3 sentences)",
  "scriptureReferences": [
    { "reference": "Book Chapter:Verse", "text": "The verse text" }
  ],
  "practicalGuidance": {
    "tithingAdvice": "advice or null",
    "investmentStrategy": "strategy or null",
    "riskManagement": "risk advice or null",
    "stakeRecommendations": ["recommendation 1", "recommendation 2"]
  },
  "wisdomScore": 75,
  "defiApplications": [
    {
      "protocol": "Protocol Name",
      "action": "What to do",
      "biblicalRationale": "Why, citing scripture",
      "riskLevel": "low"
    }
  ],
  "marketContext": {
    "marketTrend": "neutral",
    "riskAssessment": "medium"
  }
}`;

    const userPrompt = `RETRIEVED SCRIPTURES FROM BIBLEFI DATABASE:
${scriptureContext || "No matching verses found in database."}

BIBLICAL KNOWLEDGE BASE ENTRIES:
${knowledgeContext || "No matching knowledge entries found."}

${userCtxStr}

USER QUESTION: ${query}

Respond with comprehensive Biblical financial guidance. Include at least 2 scripture references and at least 1 DeFi application. Output ONLY the JSON object, no markdown wrapping.`;

    // ── RAG Step 3: Call AI Gateway ──
    console.log("[biblical-advisor] Calling AI gateway...");
    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      console.error(`[biblical-advisor] AI gateway error [${aiResponse.status}]:`, errBody);
      throw new Error(`AI gateway error [${aiResponse.status}]`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    console.log("[biblical-advisor] AI response received, length:", rawContent.length);

    // Parse JSON from response (handle possible markdown wrapping)
    let parsed;
    try {
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("[biblical-advisor] JSON parse error, building fallback from DB results");
      parsed = {
        biblicalPrinciple:
          "Seek wisdom and trust in the Lord with all your heart (Proverbs 3:5-6). " +
          rawContent.substring(0, 300),
        scriptureReferences: retrievedVerses.slice(0, 3).map((v: any) => ({
          reference: `${v.book_name} ${v.chapter}:${v.verse}`,
          text: v.text,
        })),
        practicalGuidance: {
          tithingAdvice: "Consider setting up consistent giving through automated streams.",
          investmentStrategy: "Build gradually, diversify, and avoid excessive risk.",
          riskManagement: "Never invest more than you can afford to lose.",
          stakeRecommendations: ["USDC staking for stable returns"],
        },
        wisdomScore: 50,
        defiApplications: [
          {
            protocol: "Superfluid Tithing",
            action: "Set up automated tithe streams to your church",
            biblicalRationale: "Malachi 3:10 — Bring the whole tithe into the storehouse",
            riskLevel: "low",
          },
        ],
        marketContext: { marketTrend: "neutral", riskAssessment: "medium" },
      };
    }

    // Ensure scripture references from DB are included if AI didn't provide any
    if (
      (!parsed.scriptureReferences || parsed.scriptureReferences.length === 0) &&
      retrievedVerses.length > 0
    ) {
      parsed.scriptureReferences = retrievedVerses.slice(0, 3).map((v: any) => ({
        reference: `${v.book_name} ${v.chapter}:${v.verse}`,
        text: v.text,
      }));
    }

    parsed.question = query;

    // Ensure marketContext has relevantTokens array
    if (!parsed.marketContext) parsed.marketContext = {};
    if (!parsed.marketContext.relevantTokens) {
      parsed.marketContext.relevantTokens = [
        { symbol: "ETH", price: 0, change24h: 0, marketCap: 0, volume24h: 0 },
        { symbol: "USDC", price: 1.0, change24h: 0, marketCap: 0, volume24h: 0 },
      ];
    }
    if (!parsed.marketContext.marketTrend) parsed.marketContext.marketTrend = "neutral";
    if (!parsed.marketContext.riskAssessment) parsed.marketContext.riskAssessment = "medium";

    console.log("[biblical-advisor] Success. Wisdom score:", parsed.wisdomScore);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[biblical-advisor] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: message,
        biblicalPrinciple:
          "Trust in the LORD with all your heart (Proverbs 3:5-6). We encountered a technical issue — please try again.",
        scriptureReferences: [
          {
            reference: "Proverbs 3:5-6",
            text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
          },
        ],
        practicalGuidance: {},
        wisdomScore: 50,
        defiApplications: [],
        marketContext: {
          marketTrend: "neutral",
          riskAssessment: "medium",
          relevantTokens: [],
        },
        question: "",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
