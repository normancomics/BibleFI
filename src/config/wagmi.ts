
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'

// Updated WalletConnect Project ID for BibleFi production
const projectId = '2589ec8e083adaa554ee06641ce2b93b' // BibleFi official project ID

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    // Farcaster Frame connector — auto-connects inside Warpcast/Farcaster frames
    farcasterFrame() as any,
    // MetaMask / Browser Wallet
    injected({
      target: {
        id: 'injected',
        name: 'Browser Wallet',
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
