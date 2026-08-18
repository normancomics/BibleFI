# BibleFI Smart Contract Audit Report

**Audit Date:** 2026-08-18  
**Scope:** All Solidity contracts in `contracts/`  
**Compiler:** Solidity `^0.8.24` (unified post-audit)  
**Methodology:** Manual line-by-line review, correctness analysis, access-control review, economic security review

---

## Contracts Audited

| Contract | File | Lines | Role |
|---|---|---|---|
| BibleFiBWSP | `BibleFiBWSP.sol` | ~60 | On-chain scripture concordance registry |
| BibleFiUSD | `BibleFiUSD.sol` | ~230 | OUSD-style yield-bearing stablecoin (ERC4626 + Morpho) |
| BWTYAMath | `BWTYAMath.sol` | ~379 | Fixed-point math library for BWTYA algorithm |
| BWSPWisdomRegistry | `BWSPWisdomRegistry.sol` | ~530 | On-chain wisdom profile and tithe streak registry |
| BibleFiSpandexAdvisory | `BibleFiSpandexAdvisory.sol` | ~249 | Immutable advisory result registry |
| BibleFiSuperfluid | `BibleFiSuperfluid.sol` | ~207 | Superfluid CFA tithe streaming |
| BWTYAYieldVault | `BWTYAYieldVault.sol` | ~545 | Wisdom-gated yield vault with Joseph's Reserve |

---

## Summary of Findings

| ID | Severity | Contract | Title | Status |
|---|---|---|---|---|
| C-1 | Critical | BibleFiUSD | Missing `totalAssets()` override breaks ERC4626 share math | Fixed |
| C-2 | Critical | BWTYAYieldVault | TWAP accumulator initialized with absolute timestamp | Fixed |
| C-3 | Critical | BibleFiUSD | `rebaseAndTithe()` mints unbacked tokens | Fixed |
| H-1 | High | BibleFiSuperfluid | Uses `Ownable` instead of `Ownable2Step` | Fixed |
| H-2 | High | BibleFiSuperfluid | No CFA operator authorization check | Fixed |
| H-3 | High | BibleFiUSD | No withdrawal/redemption function | Fixed |
| H-4 | High | BWTYAYieldVault | Additional deposits blocked (`DepositAlreadyExists`) | Fixed |
| M-1 | Medium | BWSPWisdomRegistry | Unbounded `scriptureResonators` array with duplicates | Fixed |
| M-2 | Medium | BWSPWisdomRegistry | O(n) resonance loops vulnerable to gas DoS | Fixed |
| M-3 | Medium | BibleFiSpandexAdvisory | Mixed OpenZeppelin import paths | Fixed |
| M-5 | Medium | BWTYAYieldVault | `yieldOracle` stored but `reportYield()` missing | Fixed |
| L-1 | Low | BWTYAMath, BWSPWisdomRegistry | Pragma version inconsistency (`^0.8.20` vs `^0.8.24`) | Fixed |
| L-2 | Low | BWTYAMath | Wisdom decay binomial approximation inaccurate for n > 365 | Fixed |
| L-3 | Low | BWTYAYieldVault | Self-reported `portfolioTotalUsd` undocumented | Fixed |
| L-4 | Low | BWTYAYieldVault | Non-paused `withdraw()` undocumented | Fixed |
| L-5 | Low | BibleFiBWSP | `synthesizeWisdom` can silently overwrite entries | Fixed |

---

## Detailed Findings

### C-1 — Missing `totalAssets()` override in `BibleFiUSD` [CRITICAL]

**Impact:** All depositors after the first receive a catastrophically incorrect number of shares.

**Description:** `BibleFiUSD.depositUSDC()` routes all USDC into a Morpho vault immediately after
receipt. The contract inherits from ERC4626 but never overrides `totalAssets()`. ERC4626's default
implementation returns `IERC20(_asset).balanceOf(address(this))` — which is effectively zero after
every deposit (all USDC has been forwarded). This means `previewDeposit(assets)` computes:

```
shares = assets * (totalSupply + 1) / (0 + 1) = assets * totalSupply
```

The second depositor would receive `assets * totalSupply` shares — orders of magnitude too many,
permanently diluting existing holders and breaking the entire share accounting model.

**Fix:** Added `totalAssets()` override that returns `USDC.balanceOf(this) + Morpho.convertToAssets(vaultShares)`.

---

### C-2 — TWAP accumulator initialized with absolute timestamp [CRITICAL]

**Impact:** Every user's 7-day wisdom TWAP score is wildly inflated; wisdom-boost mechanics are
completely non-functional.

**Description:** In `BWTYAYieldVault.deposit()`, the accumulator was initialized as:
```solidity
wisdomTwapAccum: decayedScore * block.timestamp  // block.timestamp ≈ 1,700,000,000
```

The TWAP is computed by dividing this accumulator by `(block.timestamp - depositTime)` — a
relative elapsed seconds value. The initial value is off by ~`decayedScore * depositTime` (a
number on the order of `score * 1.7 billion`), making every TWAP score billions of times larger
than intended.

**Fix:** Initialize `wisdomTwapAccum = 0`. Accumulation starts from `depositTime`, not the Unix epoch.

---

### C-3 — `rebaseAndTithe()` mints unbacked tokens [CRITICAL]

**Impact:** Charity wallet receives BFiUSD tokens that are not backed by USDC in the vault,
permanently diluting all existing holders on every daily rebase.

**Description:** The original implementation detected yield and called `_mint(charityWallet, tithe)`
without withdrawing the underlying USDC from Morpho first. Newly minted tokens represented a claim
on vault assets that don't exist in a redeemable form — yield was already inside Morpho's vault,
and minting additional BFiUSD shares against it double-counted those assets.

**Fix:** Before minting to charity, the tithe amount of vault shares is redeemed from Morpho,
withdrawing real USDC into the contract. The minted BFiUSD is then backed 1:1 by that USDC.

---

### H-1 — `BibleFiSuperfluid` uses `Ownable` instead of `Ownable2Step` [HIGH]

**Impact:** Ownership can be transferred to the wrong address in a single transaction; no
two-step confirmation. A typo in the `transferOwnership` call permanently locks the contract.

**Fix:** Replaced `Ownable` import and base class with `Ownable2Step`, consistent with all other
contracts in the protocol.

---

### H-2 — No CFA operator authorization check in `openTitheStream` [HIGH]

**Impact:** Calls to `createFlowByOperator` / `updateFlowByOperator` silently revert at the
Superfluid protocol level if this contract is not pre-authorized as an operator by the user.
Users get no actionable error message.

**Description:** Superfluid's CFA operator model requires users to call
`host.authorizeFlowOperatorWithFullControl()` before a third-party contract can manage their
streams. The original code attempted to use these operator methods without verifying authorization,
leading to opaque revert messages deep in the Superfluid stack.

**Fix:** Added upfront check using `cfa.getFlowOperatorData()`. Reverts with `NotCFAOperator()`
if permissions are zero, giving users a clear and actionable error.

---

### H-3 — No withdrawal mechanism in `BibleFiUSD` [HIGH]

**Impact:** Users can deposit USDC and receive BFiUSD but have no on-chain way to redeem their
shares for USDC. Funds are permanently trapped.

**Fix:** Added `withdrawUSDC(uint256 shares)` function that burns the caller's shares, redeems
proportional Morpho vault shares for USDC, and returns USDC to the caller.

---

### H-4 — Additional deposits blocked with `DepositAlreadyExists` [HIGH]

**Impact:** Users with an existing position cannot add capital. They must `withdraw()` (forfeiting
unclaimed yield unless they call `claimYield` first), then re-deposit. This is a significant UX
flaw and can lead to inadvertent yield loss.

**Fix:** Removed `DepositAlreadyExists` guard. Additional deposits now merge into the existing
`Deposit` struct: principal is added, TWAP accumulator is updated before the merge, and the
rebalance lock is propagated if the new deposit triggers it.

---

### M-1 — Unbounded `scriptureResonators` array with duplicate entries [MEDIUM]

**Impact:** The same user can be added to `scriptureResonators[hash]` multiple times (once per
call to `logScriptureResonance`). `getScriptureResonatorCount` returns inflated values. The array
is unbounded and over time could become large enough to cause gas issues on reads.

**Fix:** Added `mapping(bytes32 => mapping(address => bool)) scriptureResonated` to track
per-scripture per-user presence. Users are only pushed once per scripture hash.

---

### M-2 — O(n) gas loops in `getAverageResonance` and `computeWisdomPowerScore` [MEDIUM]

**Impact:** An oracle submitting thousands of resonance entries for a single user would eventually
make `getAverageResonance` and `computeWisdomPowerScore` unusable due to gas limits. Both functions
iterated the full `resonanceLogs[user]` array.

**Fix:** Added `sumResonance` and `resonanceLogCount` fields to `WisdomProfile`. Both are updated
in O(1) at each `logScriptureResonance` call. All average calculations now use these fields.

---

### M-3 — Mixed OpenZeppelin import paths [MEDIUM]

**Impact:** `BibleFiSpandexAdvisory.sol` imported `ReentrancyGuard` from
`@openzeppelin/contracts/utils/ReentrancyGuard.sol` (OZ v5 path) while all other contracts used
`@openzeppelin/contracts/security/ReentrancyGuard.sol` (OZ v4 path). Using a mismatched path
can cause compilation failures or silent behavioral differences depending on the installed version.

**Fix:** Standardized all contracts to `@openzeppelin/contracts/security/ReentrancyGuard.sol`.

---

### M-5 — `yieldOracle` stored but `reportYield()` missing [MEDIUM]

**Impact:** The vault computes yield time-proportionally from `baseApyBps`, but the actual yield
tokens must be present in the vault's balance for `safeTransfer` calls in `claimYield()` to
succeed. Without a mechanism to fund the vault with externally generated yield, every `claimYield`
call would revert with insufficient balance.

**Fix:** Added `reportYield(uint256 amount)` callable only by `yieldOracle`. Transfers `amount`
of `depositToken` from the oracle into the vault and emits a `YieldReported` event.

---

### L-1 — Pragma version inconsistency [LOW]

`BWTYAMath.sol` and `BWSPWisdomRegistry.sol` used `^0.8.20` while all other contracts used
`^0.8.24`. Unified to `^0.8.24`.

---

### L-2 — Wisdom decay binomial approximation inaccurate for large n [LOW]

The two-term binomial approximation `(1-λ)^n ≈ 1 - nλ + n(n-1)/2 λ²` diverges from the true
exponential for `n > ~400` days. The 40% floor protects against catastrophic values, but the
curve is inaccurate in the 200–365 day range. Added a cap of 365 days: beyond that, the floor
dominates anyway and capping maintains accuracy.

---

### L-3 — Self-reported `portfolioTotalUsd` undocumented [LOW]

The Ecclesiastes concentration check in `BWTYAYieldVault.deposit()` is easily bypassed by passing
`0` or a very large value for `portfolioTotalUsd`. Added explicit NatSpec warning directing
integrators to use a price oracle for this value.

---

### L-4 — Non-paused `withdraw()` undocumented [LOW]

`deposit()` and `claimYield()` are protected by `whenNotPaused` but `withdraw()` is not. While
intentional (users should always be able to exit), this was undocumented. Added explicit NatSpec
comment confirming the design intent.

---

### L-5 — `synthesizeWisdom` silently overwrites scripture entries [LOW]

**Impact:** A botched call with an existing `verseHash` would silently replace immutable scripture
data without any audit trail of what changed. The on-chain concordance is intended to be an
immutable record.

**Fix:** `synthesizeWisdom` now reverts with `ScriptureAlreadySynthesized(verseHash)` if the
hash already has content. Added a separate `updateWisdom()` function for intentional corrections,
which emits `BWSP_ScriptureUpdated` for explicit auditability.

---

## Residual Risks

1. **Single submitter in `BibleFiSpandexAdvisory`** — The advisory submitter is a single EOA.
   Key compromise allows fabricated advisory injection. Recommend upgrading to a Gnosis Safe
   multisig as the submitter address post-deployment.

2. **Self-reported portfolio value** — Even with the new NatSpec warning, the Ecclesiastes
   rebalancing lock remains opt-in/bypassable until an on-chain price oracle is integrated.

3. **Superfluid operator flow** — Users must call Superfluid's `authorizeFlowOperatorWithFullControl`
   before `openTitheStream`. This UX step must be clearly documented in frontend flows.

4. **Yield vault solvency** — `BWTYAYieldVault` still relies on manual yield funding via
   `reportYield`. A proper DeFi integration (e.g., depositing into an external yield source and
   harvesting) should be considered for production to remove the centralized oracle dependency.

5. **Morpho vault trust** — `BibleFiUSD` places full trust in the `morphoVault` address. A
   compromised or malicious vault can drain all USDC. The owner should ensure the Morpho vault
   address is a well-audited, immutable vault or add a time-lock on `setMorphoVault`.
