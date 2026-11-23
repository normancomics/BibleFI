# BWSP source review and staging gate

The BWSP agent only retrieves Bible passages and DeFi knowledge that have verified provenance and explicit human approval. New and pre-existing rows start as `unverified` and `pending`; embeddings alone do not qualify a source for use.

## Approved source scope

- Scripture: public-domain KJV or World English Bible (WEB) text only, with translation, edition/version, source name, and HTTPS source URL recorded.
- DeFi: official Base or Superfluid documentation, or the BibleFI contract source in this repository. The reviewed DeFi retrieval function enforces these source URL hosts and repository paths.
- Generated principles, applications, annotations, or protocol summaries remain pending until a human has checked their content against the cited source.

## Review procedure

1. Inspect the source text and confirm that its license and URL match the allowed source scope.
2. Check generated annotations against the cited passage or official documentation; reject unsupported claims.
3. Through an authorized staging database session, update the entry's source metadata, set `provenance_status = 'verified'`, set `review_status = 'approved'`, and record `reviewed_at` and `reviewed_by`. The database constraint requires review metadata.
4. Verify the entry is returned by `match_reviewed_biblical_knowledge` or `match_reviewed_defi_knowledge` and that the resulting answer cites the retrieved source ID and reference.
5. Keep source IDs, URLs, translation/version, similarity, and review timestamp in the response citations. Re-review entries when their cited source or annotations change.

Do not approve entries from unidentified, non-public-domain, unofficial, or unreviewed sources. This migration is intended for staging evaluation; do not apply it to production until the evaluation set and CI pass and the repository owner authorizes deployment.
