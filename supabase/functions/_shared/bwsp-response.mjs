export const BWSP_DISCLAIMER =
  "Educational information only, not financial, investment, tax, or legal advice. " +
  "Scripture interpretation is not authoritative; consult qualified professionals and your own faith community.";

export const BWSP_RISK_NOTICE =
  "DeFi involves substantial risks, including loss of funds, smart-contract vulnerabilities, " +
  "liquidation, liquidity limits, and changing market conditions. Verify details independently.";

const ALLOWED_TRANSLATIONS = new Set(["KJV", "WEB"]);
const OFFICIAL_DEFI_SOURCE = /^https:\/\/(?:docs\.base\.org|base\.org|docs\.superfluid\.org|superfluid\.org|github\.com\/normancomics\/BibleFI\/(?:blob|tree)\/(?:main|[0-9a-f]{40})\/(?:contracts|contracts_forge))(?:\/|$)/i;

function validHttpsUrl(value) {
  return typeof value === "string" && /^https:\/\/\S+$/i.test(value);
}

export function buildBwspCitations(scriptures = [], defiSources = []) {
  const scriptureCitations = scriptures.flatMap((source) => {
    if (
      !source?.id ||
      !source.reference ||
      !source.reviewed_at ||
      !ALLOWED_TRANSLATIONS.has(source.source_translation) ||
      !source.source_name ||
      !source.reviewed_at ||
      !validHttpsUrl(source.source_url)
    ) return [];

    return [{
      id: String(source.id),
      type: "scripture",
      title: source.source_name,
      reference: source.reference,
      text: source.verse_text,
      translation: source.source_translation,
      version: source.source_version ?? null,
      url: source.source_url,
      reviewedAt: source.reviewed_at,
      similarity: Number(source.similarity),
    }];
  });

  const defiCitations = defiSources.flatMap((source) => {
    if (
      !source?.id ||
      !source.topic ||
      !source.source_name ||
      !validHttpsUrl(source.source_url) ||
      !OFFICIAL_DEFI_SOURCE.test(source.source_url)
    ) return [];

    return [{
      id: String(source.id),
      type: "defi",
      title: source.source_name,
      reference: source.topic,
      protocol: source.protocol ?? null,
      url: source.source_url,
      reviewedAt: source.reviewed_at,
      similarity: Number(source.similarity),
    }];
  });

  return [...scriptureCitations, ...defiCitations];
}

export function noReviewedSourcesResponse() {
  return unavailableBwspResponse(
    "No verified, human-reviewed source matched this question, so a sourced answer cannot be provided yet.",
  );
}

export function unavailableBwspResponse(
  guidance = "A sourced answer could not be generated. Please try again later.",
) {
  return {
    answerable: false,
    guidance,
    principle: "",
    action: "",
    defiSuggestions: "No DeFi suggestion is provided without a matching, reviewed official source.",
    primaryScripture: null,
    supportingScriptures: [],
    citations: [],
    confidenceScore: 0,
    riskNotice: BWSP_RISK_NOTICE,
    disclaimer: BWSP_DISCLAIMER,
  };
}

export function normalizeBwspAnswer(answer, citations) {
  const sourcesById = new Map(citations.map((source) => [source.id, source]));
  const requestedIds = Array.isArray(answer?.citationIds) ? answer.citationIds : [];
  const selected = [...new Set(requestedIds)]
    .map((id) => sourcesById.get(String(id)))
    .filter(Boolean);
  const scriptureCitations = selected.filter((source) => source.type === "scripture");
  const defiCitations = selected.filter((source) => source.type === "defi");
  const answerable = scriptureCitations.length > 0 &&
    typeof answer?.guidance === "string" &&
    answer.guidance.trim().length > 0;

  if (!answerable) return noReviewedSourcesResponse();

  const primaryScripture = scriptureCitations[0];
  return {
    answerable: true,
    guidance: answer.guidance.trim(),
    principle: typeof answer.principle === "string" ? answer.principle.trim() : "",
    action: typeof answer.action === "string" ? answer.action.trim() : "",
    defiSuggestions: defiCitations.length > 0 && typeof answer.defiSuggestions === "string"
      ? answer.defiSuggestions.trim()
      : "No DeFi suggestion is provided without a cited, reviewed official source.",
    primaryScripture: primaryScripture.reference,
    supportingScriptures: scriptureCitations.slice(1).map((source) => source.reference),
    citations: selected,
    confidenceScore: Number.isFinite(answer.confidenceScore)
      ? Math.min(Math.max(answer.confidenceScore, 0), 1)
      : 0,
    riskNotice: BWSP_RISK_NOTICE,
    disclaimer: BWSP_DISCLAIMER,
  };
}
