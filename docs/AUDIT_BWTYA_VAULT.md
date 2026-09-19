# Internal security review — BWTYAYieldVault (Base Sepolia deployment)

Reviewed contract: `contracts/BWTYAYieldVault.sol`
Deployed (testnet only): `0x8549E2c482517c8E57E68178c0D2Df98D1847197` — Base Sepolia
Treasury: `0x7bEda57074AA917FF0993fb329E16C2c188baF08`
Tithe rate: 10% (`TITHE_RATE = 1_000` bps, immutable constant)
Date: 2026-09-19
Reviewer: internal (BibleFi build agent). **Not** a substitute for an
independent third-party audit before any mainnet value.

> "The prudent considereth his steps" — Proverbs 14:15 (KJV)

## Verdict

**Do not deploy to Base mainnet with real funds in the current form.**
The tithe-first logic itself is correct and enforced on-chain, but the vault
pays yield out of the same token balance that holds depositor principal, with
no solvency accounting. That is a fund-loss class issue, not a style issue.
Fix the findings below (at minimum C-1, C-2, H-1), add full Foundry coverage,
then obtain an external audit.

## Critical

**C-1 — Yield is paid from depositor principal (insolvency / first-claimer drain)**
`claimYield()` computes `grossYield` purely from `baseApyBps × elapsed` and then
`safeTransfer`s tithe + net to treasury and user. Nothing verifies that the
vault holds yield tokens in excess of `stats.totalDeposited + stats.totalReserve`.
Where external yield has not been funded via `reportYield`, the transfers come
straight out of other depositors' principal; the earliest/largest claimers
drain the vault and later depositors cannot `withdraw()`.
*Fix:* track a dedicated `yieldPool` balance credited only by `reportYield`,
cap every payout at `min(computedYield, yieldPool)`, decrement it on claim, and
assert `token.balanceOf(this) >= totalDeposited + totalReserve` after transfers.

**C-2 — Wisdom boost and tithe blessing are unfunded**
`wisdomBonus` and `titheBlessingBonus` are added to `finalAmount` and paid out,
but no mechanism funds them. Bonuses are therefore paid from principal, and a
high-score depositor with a long tithe streak can extract up to 1.30× plus the
blessing multiplier of other users' capital.
*Fix:* pay bonuses only from the funded `yieldPool`, and pro-rate them down
when the pool is short instead of transferring.

## High

**H-1 — `withdraw()` silently forfeits accrued yield**
`withdraw()` deletes the deposit without paying `dep.accruedYield`, and
`accruedYield` is incremented on claim but never read or reset anywhere — it is
write-only dead state. A user who withdraws without claiming first loses value
and the contract keeps no record.
*Fix:* either settle yield inside `withdraw()` or revert when unclaimed yield
exists; remove or properly consume `accruedYield`.

**H-2 — Yield accrues while the vault is paused**
`claimYield` is `whenNotPaused` but `lastClaimTime` keeps advancing in real
time, so a multi-week emergency pause accumulates a large unfunded claim that
lands the moment the vault unpauses.
*Fix:* record pause start/end and subtract paused seconds from `elapsed`.

**H-3 — Unbounded owner control over the payout rate**
`setBaseApy` accepts any value with no cap and no timelock, and `setTreasury`
can be repointed at will. A compromised owner key can set a very high APY and
claim out the vault, or redirect the tithe.
*Fix:* hard `MAX_BASE_APY_BPS` cap, a timelock (or multisig owner) on
`setBaseApy` / `setTreasury`, and an event for `setYieldOracle`.

## Medium

**M-1 — Joseph's Reserve is not segregated.** Reserve tokens sit in the same
balance and can be transferred out as yield, defeating the Genesis 41 liquidity
guarantee. Track and exclude it from payable balance.

**M-2 — `totalYieldGenerated` is double-counted.** Incremented both in
`reportYield` (funding) and in `claimYield` (computation), so vault statistics
and any UI reading them overstate lifetime yield.

**M-3 — TWAP window is not 7 days.** `_getWisdomTwap` divides the accumulator by
`block.timestamp - depositTime`, i.e. a lifetime average, while the docs and
`TWAP_WINDOW` claim a 7-day window. Long-term depositors get a stale score in
both directions. Implement a real rolling window or correct the documentation
and delete the unused constant.

**M-4 — Fee-on-transfer / rebasing tokens.** `deposit` credits `amount` rather
than the measured balance delta. Restrict `depositToken` to vetted standard
ERC20s (USDC on Base) or measure the delta.

## Low / informational

- **L-1** `portfolioTotalUsd` is self-reported, so the Ecclesiastes 11:2
  concentration check is advisory and trivially bypassed with `0` (already
  documented in code — keep it documented in the UI too).
- **L-2** `claimYield` returns silently on zero elapsed/zero yield; prefer an
  explicit revert so callers do not pay gas for a no-op.
- **L-3** OpenZeppelin v4 import paths (`security/ReentrancyGuard`,
  `security/Pausable`) — pin `openzeppelin-contracts@4.9.6` in `lib/`; these
  paths do not exist in v5.
- **L-4** No `ERC20` rescue path for tokens sent by mistake.

## What is correct

- Tithe is deducted before any user transfer and cannot be disabled — the rate
  is a `constant`, not owner-settable.
- `nonReentrant` on all state-changing external functions, with
  checks-effects-interactions ordering in `withdraw()`.
- `Ownable2Step` (two-step ownership handover), `SafeERC20`, custom errors.
- `withdraw()` deliberately excluded from `whenNotPaused`, so users can always
  exit during an emergency.
- Zero-address validation in the constructor and `setTreasury`.

## Mainnet gate

1. Fix C-1, C-2, H-1 (and ideally H-2, H-3).
2. Full Foundry test suite: solvency invariants, tithe-first ordering,
   boost bounds, pause behaviour, fuzzed deposit/claim/withdraw sequences.
3. Slither clean of high/medium findings.
4. Independent third-party audit.
5. Deploy from a hardware-held or multisig owner key — never a key pasted into
   a chat or stored in a build environment.
6. Register the mainnet address (`VITE_BWTYA_VAULT_BASE`); the app then flips
   Continuous Giving's settlement card from testnet to real Base money
   automatically.

*"The tithe is the LORD's" — Leviticus 27:30*
