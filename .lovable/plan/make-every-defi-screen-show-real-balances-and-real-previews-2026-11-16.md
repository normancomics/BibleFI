# Make every DeFi screen show real balances and real previews

Covers swaps, vaults, staking and farming. Rule for every screen: show a real number from your wallet or the network, or clearly say why there isn't one. Never show a made-up number.

## What's wrong today (confirmed)
- **Swap boxes always show a 0.0 balance.** The balances are typed into the page in BiblicalDeFiSwap, DefiSwap and MultiDexAggregator.
- **Dollar values are fake.** ETH is fixed at $2,450.
- **No preview while typing.** The "To" box stays empty until you press Get Quote.
- **Get Quote fails** ("Could not fetch live pricing"). The cause isn't confirmed yet.
- **Mainnet only.** Your Base Sepolia test funds (0.052 ETH and 48.5 USDC) never appear.
- **Made-up starting numbers in wisdom token balances.** For example, 250 WISDOM and 75 xWISDOM are shown regardless of your wallet.

## Step 1 — Audit (first, before changing anything)
Go through each swap, vault, staking and farming screen. Tag every number as real, estimate or fake, and confirm which token and pool contracts actually exist on Base and Base Sepolia. Then find the real error behind "Quote failed".

## Step 2 — Shared wallet reader
One shared piece that reads your ETH and token balances, live prices, and your network (Base or Base Sepolia). Every screen uses it, so all balances agree.

## Step 3 — Swaps (all swap boxes and the /swap page)
- Real balance and MAX, with live dollar values.
- Automatic preview about half a second after you stop typing: amount you'd receive, rate, price impact, fee, and the route.
- Fix Get Quote. If live pricing is down, show a clearly labelled estimate instead of an error.
- On Base Sepolia, show test ETH and USDC with an "estimate only" preview. Swapping stays off there because test networks have no trading pools.

## Step 4 — Vaults
- Read live from the vault: your principal, accrued yield, 10% tithe, net share, and wallet USDC.
- Deposit preview as you type: projected yield over 1 month and 1 year, tithe amount, and the after-tithe result.
- Withdraw and claim previews.

## Step 5 — Staking and farming
- Wherever a real contract exists, show live staked balance, rewards, and lock time left, plus a preview of the rewards you'd get from the amount you type.
- Where a pool or token isn't live on-chain yet, replace the fake numbers with "Coming soon — not yet live on Base" plus a clearly marked example calculator. No fake balances.

## Step 6 — Check it end to end
Test with your wallet address on Base Sepolia: balances match the block explorer, previews fill in after typing, and the vault deposit preview matches the vault's own math.

## Technical details
- New `useWalletAssets(chainId)` hook: wagmi `useBalance` and multicall `balanceOf`, with per-chain token maps for 8453 and 84532 (Sepolia USDC 0x036CbD53842c5426634e7929541eC2318f3dCF7e).
- Prices from the existing live market data service.
- Debounced preview through the existing `getSwapQuote` with toast messages silenced.
- Debug `uniswap-quote` with a direct curl call and read its response body.
- Vault reads use the existing `useTitheVault` and bwtyaVault config. Previews use the vault's tithe and APY values.
- Remove the hardcoded balance and price constants and the `useState(250)`-style seeds.
- Verify with Playwright, a connected-wallet check on Sepolia, and the block explorer.
