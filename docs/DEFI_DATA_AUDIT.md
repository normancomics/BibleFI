# DeFi screens: real vs. estimate vs. fake numbers

Rule: show a real number from the wallet/network, or say why there isn't one.

| Screen | Before | Now |
|---|---|---|
| BiblicalDeFiSwap (/swap) | balances typed `'0.0'` (fake), ETH `$2,450` (fake), preview only after Get Quote | Real balance + MAX (`useWalletAssets`), live USD (CoinGecko via `useRealTokenPrices`), auto preview 500 ms after typing, labelled estimate fallback |
| DefiSwap | `Balance: 1.0` / `100.0` (fake), default prices `1800` (fake), random slippage | Real balances, live prices only, flat 0.3% fee estimate; "unavailable" if no price |
| MultiDexAggregator | invented per-DEX prices around `1800`, random confidence | Single labelled market-price estimate from live prices |
| WisdomTokenSystem | `useState(250)`, `useState(75)`, streak, earned (fake) | "Coming soon — not yet live on Base" + clearly marked example calculator; no `$WISDOM` contract exists in the repo |
| Tithe vault (`useTitheVault`) | Live reads from the BWTYA vault | Unchanged (already real); deposit/withdraw/claim previews are a follow-up |

## Networks / contracts
- Base (8453): token list in `src/data/baseTokens.ts`.
- Base Sepolia (84532): WETH `0x4200000000000000000000000000000000000006`, USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e`. No DEX pools, so swapping is disabled (estimate only).

## "Quote failed" root cause
`supabase/functions/uniswap-quote` calls `requireAuth` and returns 401 for unauthenticated users (and 500 if `UNISWAP_API_KEY` is unset). The client previously discarded the response body and showed a generic error. It now reads the body, shows the real reason and falls back to a labelled estimate. A direct `curl` against the deployed function is still needed to confirm which of the two applies in production.
