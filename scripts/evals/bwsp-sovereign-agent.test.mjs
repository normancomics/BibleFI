import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBwspCitations,
  BWSP_DISCLAIMER,
  BWSP_RISK_NOTICE,
  noReviewedSourcesResponse,
  normalizeBwspAnswer,
} from "../../supabase/functions/_shared/bwsp-response.mjs";
import { mcpAuthenticationError } from "../../src/lib/mcp/auth.mjs";

const bibleSource = {
  id: "bible-1",
  reference: "Proverbs 3:9",
  source_translation: "KJV",
  source_name: "King James Version",
  source_url: "https://example.org/kjv/proverbs/3/9",
  source_version: "KJV public-domain text",
  reviewed_at: "2026-10-03T00:00:00Z",
  similarity: 0.82,
};

const defiSource = {
  id: "defi-1",
  topic: "Superfluid streams",
  protocol: "Superfluid",
  source_name: "Superfluid Protocol documentation",
  source_url: "https://docs.superfluid.org/docs/protocol/overview",
  reviewed_at: "2026-10-03T00:00:00Z",
  similarity: 0.78,
};

test("only provenance-complete KJV/WEB and official DeFi sources become citations", () => {
  const citations = buildBwspCitations(
    [
      bibleSource,
      { ...bibleSource, id: "unknown", source_translation: "NIV" },
      { ...bibleSource, id: "missing-url", source_url: null },
    ],
    [
      defiSource,
      { ...defiSource, id: "unofficial", source_url: "https://example.com/docs" },
    ],
  );

  assert.deepEqual(citations.map(({ id }) => id), ["bible-1", "defi-1"]);
  assert.equal(citations[0].translation, "KJV");
  assert.equal(citations[1].protocol, "Superfluid");
});

test("a sourced answer cites only retrieved sources and includes safety notices", () => {
  const citations = buildBwspCitations([bibleSource], [defiSource]);
  const response = normalizeBwspAnswer({
    guidance: "Consider the reviewed scripture and protocol documentation.",
    principle: "Use care.",
    action: "Read the linked documentation.",
    defiSuggestions: "Compare the stream parameters before choosing a flow.",
    citationIds: ["bible-1", "defi-1", "fabricated"],
    confidenceScore: 1.4,
    primaryScripture: "A fabricated reference",
  }, citations);

  assert.equal(response.answerable, true);
  assert.equal(response.primaryScripture, "Proverbs 3:9");
  assert.deepEqual(response.citations.map(({ id }) => id), ["bible-1", "defi-1"]);
  assert.equal(response.supportingScriptures.length, 0);
  assert.equal(response.confidenceScore, 1);
  assert.match(response.riskNotice, /loss of funds/);
  assert.match(response.disclaimer, /not authoritative/);
  assert.match(response.disclaimer, /not financial/);
});

test("DeFi suggestions are withheld unless a reviewed official DeFi source is cited", () => {
  const citations = buildBwspCitations([bibleSource], [defiSource]);
  const response = normalizeBwspAnswer({
    guidance: "A sourced educational response.",
    defiSuggestions: "Use a named protocol.",
    citationIds: ["bible-1"],
  }, citations);

  assert.match(response.defiSuggestions, /No DeFi suggestion/);
  assert.deepEqual(response.citations.map(({ type }) => type), ["scripture"]);
});

test("no reviewed sources produces a transparent non-answer, not fabricated citations", () => {
  const response = noReviewedSourcesResponse();

  assert.equal(response.answerable, false);
  assert.deepEqual(response.citations, []);
  assert.equal(response.primaryScripture, null);
  assert.match(response.guidance, /cannot be provided/);
  assert.match(response.defiSuggestions, /No DeFi suggestion/);
  assert.equal(response.riskNotice, BWSP_RISK_NOTICE);
  assert.equal(response.disclaimer, BWSP_DISCLAIMER);
});

test("an answer without a retrieved verse citation is rejected", () => {
  const response = normalizeBwspAnswer({
    guidance: "An unsupported response.",
    citationIds: ["defi-1"],
  }, buildBwspCitations([], [defiSource]));

  assert.equal(response.answerable, false);
  assert.deepEqual(response.citations, []);
});

test("read-only MCP tools reject anonymous and accept authenticated callers", () => {
  assert.equal(mcpAuthenticationError(undefined).isError, true);
  assert.equal(mcpAuthenticationError(null).isError, true);
  assert.equal(mcpAuthenticationError("").isError, true);
  assert.equal(mcpAuthenticationError("user-123"), undefined);
});
