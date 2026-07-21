
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Updated WalletConnect Project ID for BibleFi production
const projectId = '2589ec8e083adaa554ee06641ce2b93b' // BibleFi official project ID

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    // Farcaster mini app connector — the embedded wallet inside
    // Farcaster/Base App mini app hosts (connector id: 'farcaster')
    farcasterMiniApp(),
    // Rainbow — extension when installed; the wallet picker falls back to
    // WalletConnect QR (scannable by Rainbow mobile) when it isn't
    injected({
      target: {
        id: 'rainbow',
        name: 'Rainbow',
        provider: () => {
          if (typeof window === 'undefined') return undefined;
          const w = window as unknown as {
            rainbow?: typeof window.ethereum;
            ethereum?: typeof window.ethereum & { isRainbow?: boolean };
          };
          return w.rainbow ?? (w.ethereum?.isRainbow ? w.ethereum : undefined);
        },
      },
    }),
    // MetaMask / browser extension wallet
    injected({
      target: {
        id: 'injected',
        name: 'MetaMask',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      },
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'BibleFi - Biblical DeFi',
      appLogoUrl: '/bible-fi-brand-logo-v2.png',
      preference: 'all',
      version: '4',
    }),
    // WalletConnect v2 (Reown)
    walletConnect({
      projectId,
      metadata: {
        name: 'BibleFi',
        description: 'Biblical wisdom meets DeFi innovation on Base chain',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://biblefi.app',
        icons: [
          typeof window !== 'undefined'
            ? `${window.location.origin}/bible-fi-brand-logo-v2.png`
            : 'https://biblefi.app/bible-fi-brand-logo-v2.png',
        ],
        verifyUrl: 'https://verify.walletconnect.com',
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-accent-color': '#FFD700',
          '--wcm-background-color': '#0A0A0A',
          '--wcm-z-index': '1000',
        },
      },
    }),
  ],
  transports: {
    [base.id]: http('https://base.rpc.subquery.network/public', {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
    }),
    [mainnet.id]: http('https://1rpc.io/eth', {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
})
