# Memory: tech-stack/base-pay-integration

The app integrates Base Pay SDK (`@base-org/account`) for "tap-to-tithe" functionality, supporting future `burner.pro` physical terminal integration. Key features:

- **Payment Flow**: Uses `pay()` for transaction initiation with `getPaymentStatus()` polling for confirmation
- **Supported Tokens**: USDC, DAI, USDT, ETH/WETH (live); $BIBLEFI, $WISDOM, $cbBTC (future roadmap)
- **Component**: `src/components/payment/BasePayTithe.tsx` - handles Base Pay transactions with testnet toggle
- **Integration Point**: Primary "Base Pay" tab in `CostOptimizedPaymentHub.tsx`
- **Roadmap**: Physical terminal integration → custom token support → multi-chain expansion
