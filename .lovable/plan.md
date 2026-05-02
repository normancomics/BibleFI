## Goal
Two scoped fixes:
1. Silence remaining auto-init wallet toasts (continuation of prior task — chain-switch + auto-reconnect events fire with no user intent).
2. Update the `@spandex/core` (spandex.sh) integration in the DeFi swap section to match the v0.6.2 API correctly, so quote requests actually execute instead of failing silently.

## Audit Summary — Auto-Init Toasts

| Source | Surfaces toast on background init? | Action |
|---|---|---|
| `useSuperfluid` | No (already silenced) | none |
| `useNoir` | No — console only | none |
| `useFarcasterFrame` | No — console only | none |
| `FarcasterAuthProvider` | No on init | none |
| `WalletContext` | **Yes** — auto-switch toast + connect-success toast fire on persisted reload | **Fix** |

## Spandex Integration — Issues Found

The `@spandex/core` v0.6.2 type definitions reveal that current `src/config/spandex.ts` and `src/hooks/useSpandexQuote.ts` are using an outdated/incorrect API shape. Verified against `node_modules/@spandex/core/dist/types/`:

| Issue | Current code | Correct per v0.6.2 |
|---|---|---|
| Config field name | `clients: [baseClient] as PublicClient[]` | `clients` accepts `PublicClient[]` ✅ (this is fine) but missing `appId` parity for fabric |
| `getQuote` requires `strategy` | Provided ✅ | OK |
| `getQuotes` return type | Treated as flat array of successful quotes | Returns `SimulatedQuote[]` = `SuccessfulSimulatedQuote \| FailedSimulatedQuote`. Must filter by `q.simulation.success === true` before reading `simulation.outputAmount` |
| Output amount path | `q.simulation?.outputAmount ?? q.outputAmount ?? 0n` | Only `q.simulation.outputAmount` exists, and only on successful quotes |
| Provider list | `fabric, odos, kyberswap, lifi` | All valid; can also add `relay`, `velora`, `zeroX` (zeroX needs apiKey) |
| Comparison logic in `BiblicalDeFiSwap.tsx` | Compares `parseFloat(spandexResult.outputAmount)` (formatted string) vs `parseFloat(uniQuote.toAmount)` — works but fragile when decimals differ | Compare normalized values using the known `toToken.decimals` |
| `useSpandexQuote(6)` hardcoded | Always formats with 6 decimals regardless of selected output token | Pass `toToken.decimals` from the component |

## Changes

### 1. `src/contexts/WalletContext.tsx` (silence background toasts)
- Add `userInitiatedRef = useRef(false)`. Set true inside `connectWallet`, `disconnectWallet`, `switchToBase`. Reset after the resolving effect runs.
- Wrap the "Wallet Connected" success toast (current lines 145–153) and the connect-error `playSound('error')` (line 49) so they only fire when `userInitiatedRef.current === true`. State updates remain so UI badges still reflect status.
- Refactor the auto-switch-to-Base effect (current lines 137–143) to call `switchChain` directly without the `switchToBase()` toasts. Keep the user-callable `switchToBase` toasts intact for explicit clicks.

### 2. `src/config/spandex.ts` (correct v0.6.2 config)
- Keep `createConfig` with `providers`, `clients`, `options`. Verify `clients` is typed as `ClientLookup` (PublicClient[] is supported).
- Add `attributes: { app: 'biblefi' }` to providers that accept it for analytics.
- Add `logging: { level: 'warn' }` to suppress noisy debug output.
- Document strategy options: `'bestPrice' | 'fastest' | 'estimatedGas' | 'priority'`.

### 3. `src/hooks/useSpandexQuote.ts` (fix type-safe quote handling)
- After `getQuotes(...)`, filter for successful simulations: `quotes.filter(q => q.simulation.success === true) as SuccessfulSimulatedQuote[]`.
- Map using `q.simulation.outputAmount` (no fallbacks needed — type-safe).
- Include `gasEstimate` from `q.simulation.gasUsed` and `latency` from `q.performance.latency` in the result for richer UI.
- For the single `getQuote` fallback, the return is `SuccessfulSimulatedQuote | null`; use `single.simulation.outputAmount` directly.
- Allow `outputDecimals` to be passed dynamically per call (move from hook arg to `fetchQuote` param) so the hook works for any token pair.

### 4. `src/components/defi/BiblicalDeFiSwap.tsx` and `src/components/defi/SimpleSwapForm.tsx`
- Pass `toToken.decimals` into `fetchSpandexQuote` instead of hardcoding 6 / using stale token info at hook-init time.
- Compare quotes by raw bigint (`spandexResult.outputAmountRaw`) using `parseUnits(uniQuote.toAmount, toToken.decimals)` so the "better price" detection is correct across decimal scales.
- Surface `spandexResult.gasEstimate` and provider latency in the comparison card.

## Out of scope
- `RealWalletConnect.tsx` and other components that fire toasts inside explicit click handlers — keep as-is (user-initiated).
- Adding new spandex providers (zeroX needs an API key — would prompt separately).

## Files edited
- `src/contexts/WalletContext.tsx`
- `src/config/spandex.ts`
- `src/hooks/useSpandexQuote.ts`
- `src/components/defi/BiblicalDeFiSwap.tsx`
- `src/components/defi/SimpleSwapForm.tsx`

## Verification
- Reload home with persisted wallet → no toasts. Manual Connect/Disconnect/Switch buttons → toasts as before.
- Open `/swap` (or DeFi swap page), enter an amount → spanDEX comparison card lists 1+ providers with output amounts and provider latency. If spanDEX beats Uniswap, "Better Price Found" toast fires and quote uses the spanDEX rate.
- No `[spanDEX] Quote error` in console for a normal WETH→USDC swap.
