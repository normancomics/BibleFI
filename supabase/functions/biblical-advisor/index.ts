import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fireworks.ai API endpoint
const FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/chat/completions";

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
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIREWORKS_API_KEY = Deno.env.get("FIREWORKS_API_KEY");
    if (!FIREWORKS_API_KEY) {
      throw new Error("FIREWORKS_API_KEY is not configured");
    }

    // Rate limit: 20 req/min per user
    if (!checkRateLimit(user.id, 20, 60000)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // ── RAG Step 1: Retrieve relevant scriptures from multiple tables ──
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length > 3);

    // Search bible_verses by keyword
    const verseFilters = keywords
      .slice(0, 5)
      .map((kw: string) => `text.ilike.%${kw}%`)
      .join(",");

    const { data: verses } = await supabase
      .from("bible_verses")
      .select("book_name, chapter, verse, text, wisdom_category, defi_keywords")
      .or(verseFilters || "text.ilike.%wisdom%")
      .order("financial_relevance", { ascending: false })
      .limit(8);

    // Search biblical_knowledge_base by keyword + principle
    const knowledgeFilters = keywords
      .slice(0, 5)
      .flatMap((kw: string) => [`verse_text.ilike.%${kw}%`, `principle.ilike.%${kw}%`])
      .join(",");

    const { data: knowledgeBase } = await supabase
      .from("biblical_knowledge_base")
      .select("reference, verse_text, principle, application, defi_relevance, category, financial_keywords")
      .or(knowledgeFilters || "verse_text.ilike.%wisdom%")
      .limit(5);

    // Search biblical_financial_crossref for DeFi-specific mappings
    const crossrefFilters = keywords
      .slice(0, 3)
      .flatMap((kw: string) => [`biblical_term.ilike.%${kw}%`, `financial_term.ilike.%${kw}%`])
      .join(",");

    const { data: crossrefs } = await supabase
      .from("biblical_financial_crossref")
      .select("biblical_term, financial_term, defi_concept, explanation, practical_application, risk_consideration")
      .or(crossrefFilters || "biblical_term.ilike.%steward%")
      .limit(5);

    // Search defi_knowledge_base for protocol context
    const defiFilters = keywords
      .slice(0, 3)
      .map((kw: string) => `description.ilike.%${kw}%`)
      .join(",");

    const { data: defiProtocols } = await supabase
      .from("defi_knowledge_base")
      .select("protocol_name, protocol_type, description, apy, risk_level, chain")
      .or(defiFilters || "chain.eq.base")
      .limit(5);

    const retrievedVerses = verses || [];
    const retrievedKnowledge = knowledgeBase || [];
    const retrievedCrossrefs = crossrefs || [];
    const retrievedDefi = defiProtocols || [];

    console.log(
      `[biblical-advisor] RAG: ${retrievedVerses.length} verses, ${retrievedKnowledge.length} knowledge, ${retrievedCrossrefs.length} crossrefs, ${retrievedDefi.length} DeFi protocols`
    );

    // ── RAG Step 2: Build rich LLM context ──
    const scriptureContext = retrievedVerses
      .map(
        (v: any) =>
          `${v.book_name} ${v.chapter}:${v.verse} — "${v.text}" [Categories: ${(v.wisdom_category || []).join(", ")}] [DeFi Keywords: ${(v.defi_keywords || []).join(", ")}]`
      )
      .join("\n");

    const knowledgeContext = retrievedKnowledge
      .map(
        (k: any) =>
          `${k.reference}: "${k.verse_text}" — Principle: ${k.principle || "N/A"} — Application: ${k.application || "N/A"} — DeFi Relevance: ${k.defi_relevance || "N/A"} — Keywords: ${(k.financial_keywords || []).join(", ")}`
      )
      .join("\n");

    const crossrefContext = retrievedCrossrefs
      .map(
        (c: any) =>
          `Biblical: "${c.biblical_term}" ↔ Financial: "${c.financial_term}" — DeFi: ${c.defi_concept || "N/A"} — ${c.explanation || ""} — Practical: ${c.practical_application || "N/A"} — Risk: ${c.risk_consideration || "N/A"}`
      )
      .join("\n");

    const defiContext = retrievedDefi
      .map(
        (d: any) =>
          `${d.protocol_name} (${d.protocol_type}, ${d.chain}) — ${d.description || "N/A"} — APY: ${d.apy || "N/A"}% — Risk: ${d.risk_level || "N/A"}`
      )
      .join("\n");

    const userCtxStr = userContext
      ? `User context: wallet balance $${userContext.walletBalance || "unknown"}, risk tolerance: ${userContext.riskTolerance || "moderate"}, tithing history: ${userContext.tithingHistory || 0} transactions, primary church: ${userContext.primaryChurch || "not set"}, wisdom score: ${userContext.wisdomScore || "unrated"}.`
      : "";

    const systemPrompt = `You are BibleFi's Biblical Wisdom Synthesis Protocol (BWSP) — the world's first faith-based DeFi financial advisor that grounds every recommendation in Holy Scripture. You serve 2.3 billion Christians worldwide who seek to honor God with their finances on Base Chain.

CORE RULES:
1. Always cite specific Bible verses with book, chapter, and verse (KJV preferred).
2. Provide practical DeFi guidance on Base Chain (staking, tithing streams via Superfluid, stablecoin yields, liquidity pools).
3. Never encourage reckless speculation. Emphasize faithful stewardship (1 Corinthians 4:2).
4. Include a Wisdom Score (0-100) based on how well the user's question aligns with Biblical financial principles.
5. Be warm, pastoral, and encouraging — never guilt-based or manipulative.
6. When discussing debt, always reference Proverbs 22:7. When discussing tithing, cite Malachi 3:10.
7. For savings/reserves, reference Genesis 41 (Joseph's 7-year strategy).
8. For diversification, reference Ecclesiastes 11:2.
9. For taxes, reference Matthew 22:21 (Render unto Caesar).

Respond ONLY with valid JSON matching this exact structure (no markdown, no code blocks):
{
  "biblicalPrinciple": "Primary biblical principle (2-3 sentences)",
  "scriptureReferences": [
    { "reference": "Book Chapter:Verse", "text": "The verse text (KJV)" }
  ],
  "practicalGuidance": {
    "tithingAdvice": "advice or null",
    "investmentStrategy": "strategy or null",
    "riskManagement": "risk advice or null",
    "stakeRecommendations": ["recommendation 1"]
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

BIBLICAL-FINANCIAL CROSS-REFERENCES:
${crossrefContext || "No cross-references found."}

DEFI PROTOCOL CONTEXT (BASE CHAIN):
${defiContext || "No matching DeFi protocol data."}

${userCtxStr}

USER QUESTION: ${query}

Respond with comprehensive Biblical financial guidance grounded in the retrieved scriptures and knowledge. Include at least 2 scripture references and at least 1 DeFi application. Output ONLY the JSON object, no markdown wrapping.`;

    // ── RAG Step 3: Call Fireworks.ai for LLM inference ──
    console.log("[biblical-advisor] Calling Fireworks.ai...");
    const aiResponse = await fetch(FIREWORKS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIREWORKS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3p3-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      console.error(`[biblical-advisor] Fireworks.ai error [${aiResponse.status}]:`, errBody);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service payment required. Please check your Fireworks.ai account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Fireworks.ai error [${aiResponse.status}]`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    console.log("[biblical-advisor] Fireworks.ai response received, length:", rawContent.length);

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
          tithingAdvice: "Consider setting up consistent giving through automated Superfluid streams.",
          investmentStrategy: "Build gradually, diversify per Ecclesiastes 11:2, and avoid excessive risk.",
          riskManagement: "Never invest more than you can afford to lose. The borrower is slave to the lender (Proverbs 22:7).",
          stakeRecommendations: ["USDC staking for stable returns on Base Chain"],
        },
        wisdomScore: 50,
        defiApplications: [
          {
            protocol: "Superfluid Tithing",
            action: "Set up automated tithe streams to your church",
            biblicalRationale: "Malachi 3:10 — Bring ye all the tithes into the storehouse",
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

    // Ensure marketContext fields
    if (!parsed.marketContext) parsed.marketContext = {};
    if (!parsed.marketContext.relevantTokens) {
      parsed.marketContext.relevantTokens = [
        { symbol: "ETH", price: 0, change24h: 0, marketCap: 0, volume24h: 0 },
        { symbol: "USDC", price: 1.0, change24h: 0, marketCap: 0, volume24h: 0 },
      ];
    }
    if (!parsed.marketContext.marketTrend) parsed.marketContext.marketTrend = "neutral";
    if (!parsed.marketContext.riskAssessment) parsed.marketContext.riskAssessment = "medium";

    // Enrich with cross-reference data if available
    if (retrievedCrossrefs.length > 0 && !parsed.biblicalFinancialLinks) {
      parsed.biblicalFinancialLinks = retrievedCrossrefs.slice(0, 3).map((c: any) => ({
        biblicalTerm: c.biblical_term,
        financialTerm: c.financial_term,
        defiConcept: c.defi_concept,
        application: c.practical_application,
      }));
    }

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
            text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
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
