# BWSP / BWTYA contract tests

```sh
cd contracts/test
npm install
npm test
```

Compiles the contracts with `solc`, deploys `BWSPWisdomRegistry` to an in-memory
EVM, and exercises the scoring path end-to-end.

## Why this is isolated

The dependencies live in `contracts/test/package.json`, not the root one, for two
reasons:

- Contracts are deployed outside the npm workflow (see `BASE_DEPLOYMENT_GUIDE.md`),
  and OpenZeppelin is not a root dependency. Adding `solc` and OpenZeppelin to the
  root would pull contract tooling into the frontend dependency graph for no benefit.
- The root `package.json` is a frequent merge-conflict site. Keeping contract
  tooling out of it means running tests can never break `npm run build`.

Nothing here is wired into the root `npm test` — the frontend has no test runner.

## What is covered

The suite is anchored on the three `BWTYAMath` defects that were fixed, so each
has a regression test that fails against the old implementation:

- **`tvlDepthScore` returned 0 for every input.** It divided an already-WAD-scaled
  square root by `1e9`, and integer division floored the result to zero — 15 of
  the 100 BWTYA points were dead. Asserted against known values at $1M/$10M/$50M/$100M.
- **`fruitSustainabilityCurve` had a dead zone and a boundary cliff.** 22–25 % APY
  scored 0 before jumping back to ~10 at 25.01 %, and exactly 5.00 % scored 5 points
  more than 5.01 %. Asserted for continuity at 5 %, a non-zero score across 22–25 %,
  and monotonic decay above the 12 % peak.
- **`wisdomDecay` inverted for long absences.** Covered by the numerical checks in
  the commit that fixed it; the on-chain surface here exercises the scoring path
  that consumes it.

Plus the `previewAdvisory` scoring path itself: composite bounds, conviction,
Kelly capping, drawdown banding, diversification behaviour, all input-validation
guards, and determinism.

## Note on `solc` warnings

The harness prints a warning count per contract and currently reports none. It does
not fail on warnings — raise that to an assertion if the project wants a zero-warning
policy.
