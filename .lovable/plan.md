# Fix the Wisdom-Guided Swaps box: real balance and live swap preview

## What's wrong
- **Balance is always 0.0.** The swap box never reads your wallet. Every token's balance is typed into the page as "0.0".
- **The dollar value is fake.** ETH is priced at a fixed $2,450 instead of the live price.
- **No preview while you type.** Nothing shows in the "To" box until you press Get Quote.
- **Mainnet only.** Quotes and token addresses are for real Base, so your test funds on Base Sepolia (0.052 ETH and 48.5 USDC) can't show up or be swapped here.

## What I'll change
1. **Real balances.** Read your connected wallet's ETH and token balances on whatever network your wallet is on, refresh them after each swap, and add a tap-to-use MAX.
2. **Live prices.** Use the app's existing live market price for the dollar value.
3. **Automatic preview.** About half a second after you stop typing, fill in the "To" amount, the rate, and the price impact. Get Quote stays as the confirm step.
4. **Test network.** When your wallet is on Base Sepolia, show the test token list (ETH and test USDC) with a "Test network" label. Swap prices there come from the live mainnet rate, marked as an estimate, because test networks have no real trading pools. Swapping stays turned off on the test network, and the box points you to the test vault deposit instead.
5. **Clear messages.** If the wallet isn't connected, show "Connect wallet to see your balance". If you type more than you hold, show "Not enough ETH — Proverbs 21:5".

## Technical details
- Edit `src/components/defi/BiblicalDeFiSwap.tsx`: replace hardcoded `balance` and `price` with wagmi `useBalance` (native) and `useReadContracts` `balanceOf` (ERC-20) for `useChainId()`.
- Token maps per chain: 8453 (current) and 84532 (ETH, USDC 0x036CbD53842c5426634e7929541eC2318f3dCF7e).
- Debounced auto-quote (500ms) calls the existing `getSwapQuote` in preview mode, with the toast messages silenced.
- On 84532, quote with mainnet addresses for estimate only and turn off execution.
- Price comes from the existing live market data hook, falling back to the `uniswap-quote` implied rate.
- Verify with Playwright: connected-state rendering on both chains, and the preview filling in after typing.
