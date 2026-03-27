// BWSP Sovereign Agent – Supabase Edge Function
// Accepts query + context, generates embeddings, does pgvector search,
// calls gpt-4o-mini and returns structured biblical wisdom.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// Offline fallback – deterministic wisdom by intent
// ---------------------------------------------------------------------------

const OFFLINE_WISDOM: Record<string, { guidance: string; principle: string; action: string }> = {
  yield_advice: {
    guidance:
      "Be faithful stewards of the talents entrusted to you (Matthew 25:14-30). " +
      "Seek protocols with proven track records, transparent smart contracts, and sustainable APY.",
    principle: "Faithful stewardship multiplies; reckless speculation diminishes.",
    action: "Allocate capital across 2-3 audited, low-risk protocols. Reserve 10% as tithe before compounding.",
  },
  tithe_guidance: {
    guidance:
      "Honour the LORD with your wealth, with the firstfruits of all your crops (Proverbs 3:9). " +
      "On-chain tithing allows you to route 10% automatically to your chosen ministry wallet.",
    principle: "The firstfruits belong to the Lord; the rest flows with His blessing.",
    action:
      "Configure a wallet split to send 10% of each yield harvest to your church or charity wallet.",
  },
  risk_assessment: {
    guidance:
      "A prudent person foresees danger and takes precautions (Proverbs 27:12). " +
      "Evaluate every DeFi position by its audit history, team transparency, and TVL stability.",
    principle: "The prudent sees danger and hides; the simple pass on and are punished.",
    action:
      "Review smart-contract audits, check protocol insurance options, and never invest more than you can lose.",
  },
  general_wisdom: {
    guidance:
      "The plans of the diligent lead to profit as surely as haste leads to poverty (Proverbs 21:5). " +
      "Approach every financial decision with prayer, research, and counsel.",
    principle: "Wisdom, patience, and diligence are the foundations of lasting financial health.",
    action: "Set a weekly financial review cadence: check positions, tithe allocation, and wisdom score.",
  },
};

function getOfflineWisdom(intent?: string) {
  const key = intent && OFFLINE_WISDOM[intent] ? intent : "general_wisdom";
  return OFFLINE_WISDOM[key];
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      query,
      intent,
      context,
      wisdomScore,
      walletAddress,
    } = await req.json() as {
      query: string;
      intent?: string;
      context?: string;
      wisdomScore?: number;
      walletAddress?: string;
    };

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "query field is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Sanitize input
    const sanitizedQuery = query.slice(0, 1000).replace(/<[^>]*>/g, "");

    // ---------------------------------------------------------------------------
    // 1. Generate embedding
    // ---------------------------------------------------------------------------
    let embedding: number[] | null = null;

    if (openAIApiKey) {
      const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: sanitizedQuery,
        }),
      });

      if (embedRes.ok) {
        const embedData = await embedRes.json();
        embedding = embedData?.data?.[0]?.embedding ?? null;
      }
    }

    // ---------------------------------------------------------------------------
    // 2. pgvector similarity search
    // ---------------------------------------------------------------------------
    let biblicalResults: Array<{
      reference: string;
      verse_text: string;
      principle: string;
      application: string;
      similarity: number;
    }> = [];

    let defiResults: Array<{
      topic: string;
      content: string;
      protocol: string;
      similarity: number;
    }> = [];

    if (embedding) {
      const [bibleSearch, defiSearch] = await Promise.allSettled([
        supabase.rpc("match_biblical_knowledge", {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 5,
        }),
        supabase.rpc("match_defi_knowledge", {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 3,
        }),
      ]);

      if (bibleSearch.status === "fulfilled" && bibleSearch.value.data) {
        biblicalResults = bibleSearch.value.data;
      }
      if (defiSearch.status === "fulfilled" && defiSearch.value.data) {
        defiResults = defiSearch.value.data;
      }
    }

    // ---------------------------------------------------------------------------
    // 3. Build RAG context for LLM
    // ---------------------------------------------------------------------------
    const ragContext = [
      context ?? "",
      "",
      "=== VECTOR-RETRIEVED SCRIPTURES ===",
      ...biblicalResults.map(
        (r) =>
          `${r.reference}: "${r.verse_text}" | Principle: ${r.principle} | DeFi: ${r.application}`,
      ),
      "",
      "=== VECTOR-RETRIEVED DEFI KNOWLEDGE ===",
      ...defiResults.map((r) => `[${r.topic}] ${r.content}`),
    ]
      .join("\n")
      .slice(0, 6000);

    // ---------------------------------------------------------------------------
    // 4. LLM synthesis (gpt-4o-mini) or offline fallback
    // ---------------------------------------------------------------------------
    let guidance: string;
    let principle: string;
    let action: string;
    let primaryScripture = biblicalResults[0]?.reference ?? "Proverbs 3:9";
    let supportingScriptures = biblicalResults.slice(1, 4).map((r) => r.reference);
    let confidenceScore = 0.85;
    let tokenCount = 0;
    let synthesisMethod = "rag_vector";

    if (openAIApiKey) {
      const systemPrompt = `You are a biblical financial wisdom advisor for the BibleFI DeFi platform.
You combine deep scriptural knowledge with practical DeFi expertise.
Always ground your advice in specific Bible verses and provide actionable DeFi guidance.
Be concise, wise, and encouraging. Use the RAG context provided to give personalised answers.
${wisdomScore !== undefined ? `The user's wisdom score is ${wisdomScore}/100.` : ""}

Respond ONLY with a JSON object in this exact shape:
{
  "guidance": "2-3 sentence biblical wisdom answer",
  "principle": "One-sentence core financial principle from scripture",
  "action": "One concrete actionable step the user should take",
  "primaryScripture": "Book chapter:verse",
  "supportingScriptures": ["ref1", "ref2"],
  "confidenceScore": 0.0-1.0
}`;

      const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Context:\n${ragContext}\n\nQuestion: ${sanitizedQuery}\nIntent: ${intent ?? "general_wisdom"}`,
            },
          ],
          max_tokens: 600,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (llmRes.ok) {
        const llmData = await llmRes.json();
        const parsed = JSON.parse(llmData.choices?.[0]?.message?.content ?? "{}");
        guidance = parsed.guidance ?? "";
        principle = parsed.principle ?? "";
        action = parsed.action ?? "";
        primaryScripture = parsed.primaryScripture ?? primaryScripture;
        supportingScriptures = parsed.supportingScriptures ?? supportingScriptures;
        confidenceScore = parsed.confidenceScore ?? confidenceScore;
        tokenCount = llmData.usage?.total_tokens ?? 0;
      } else {
        const offline = getOfflineWisdom(intent);
        guidance = offline.guidance;
        principle = offline.principle;
        action = offline.action;
        synthesisMethod = "offline_fallback";
        confidenceScore = 0.72;
      }
    } else {
      const offline = getOfflineWisdom(intent);
      guidance = offline.guidance;
      principle = offline.principle;
      action = offline.action;
      synthesisMethod = "offline_fallback";
      confidenceScore = 0.72;
    }

    // ---------------------------------------------------------------------------
    // 5. Optionally log to bwsp_query_log
    // ---------------------------------------------------------------------------
    if (walletAddress) {
      await supabase.from("bwsp_query_log").insert({
        wallet_address: walletAddress,
        query: sanitizedQuery,
        intent: intent ?? "general_wisdom",
        synthesis_method: synthesisMethod,
        confidence_score: confidenceScore,
        primary_scripture_ref: primaryScripture,
      }).then(() => {/* fire-and-forget */});
    }

    // ---------------------------------------------------------------------------
    // 6. Return structured response
    // ---------------------------------------------------------------------------
    return new Response(
      JSON.stringify({
        guidance,
        principle,
        action,
        primaryScripture,
        supportingScriptures,
        confidenceScore,
        tokenCount,
        synthesisMethod,
        protocol: "BWSP-v1.0",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("BWSP sovereign agent error:", error);
    const offline = getOfflineWisdom("general_wisdom");
    return new Response(
      JSON.stringify({
        guidance: offline.guidance,
        principle: offline.principle,
        action: offline.action,
        primaryScripture: "Proverbs 3:9",
        supportingScriptures: ["Matthew 25:14", "Luke 16:10"],
        confidenceScore: 0.5,
        tokenCount: 0,
        synthesisMethod: "offline_fallback",
        protocol: "BWSP-v1.0",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
