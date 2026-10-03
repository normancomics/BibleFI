/**
 * Base Builder Code attribution (ERC-8021 transaction attribution).
 *
 * BibleFi's builder code from base.dev (dashboard.base.org → Settings → Builder Codes)
 * is appended to the calldata of every transaction BibleFi sends, so tithes, swaps
 * and vault interactions are attributed to BibleFi for Base builder rewards.
 *
 * The suffix is ERC-8021 schema 0 (canonical registry):
 *   codes (ASCII, comma-separated) ∥ codesLength (1 byte) ∥ schemaId (1 byte) ∥ ercSuffix (16 bytes)
 * It is byte-identical to `Attribution.toDataSuffix({ codes: [...] })` from `ox/erc8021`,
 * implemented locally to avoid an extra dependency. Verified against ox's documented
 * example output for `['baseapp', 'morpho']`.
 *
 * Smart contracts execute normally and ignore the extra calldata; attribution is
 * extracted by Base's indexers after the fact.
 *
 * "Commit thy works unto the LORD, and thy thoughts shall be established." — Proverbs 16:3
 */

/** BibleFi's builder code from base.dev — a public identifier, safe to ship in the bundle. */
export const BUILDER_CODE = 'bc_qv856cck' as const;

const ERC_8021_SUFFIX = '80218021802180218021802180218021';

function toDataSuffix(codes: readonly string[]): `0x${string}` {
  const codesHex = Array.from(new TextEncoder().encode(codes.join(","))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const codesLength = codesHex.length / 2;
  return `0x${codesHex}${codesLength.toString(16).padStart(2, '0')}00${ERC_8021_SUFFIX}`;
}

/** The ERC-8021 attribution suffix carrying BibleFi's builder code. */
export const BUILDER_DATA_SUFFIX = toDataSuffix([BUILDER_CODE]);

/**
 * Appends BibleFi's builder attribution to transaction calldata.
 * Used on the ethers v6 / raw-calldata send paths; wagmi `writeContract`
 * calls pass `BUILDER_DATA_SUFFIX` as the native `dataSuffix` parameter instead.
 */
export function withBuilderCode(data: string): `0x${string}` {
  const suffix = BUILDER_DATA_SUFFIX.slice(2);
  if (data.toLowerCase().endsWith(suffix)) return data as `0x${string}`;
  return `${data}${suffix}` as `0x${string}`;
}
