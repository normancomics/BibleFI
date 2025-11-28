
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Updated WalletConnect Project ID for Bible.fi production
const projectId = '2f0f97a31e2243c89db717c84c2e7ee6' // Bible.fi official project ID

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected({
      target: {
        id: 'injected',
        name: 'Browser Wallet',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      }
    }),
    coinbaseWallet({
      appName: 'Bible.fi - Biblical DeFi',
      appLogoUrl: '/bible-fi-brand-logo-v2.png',
      preference: 'all',
      version: '4',
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'Bible.fi',
        description: 'Biblical wisdom meets DeFi innovation on Base chain',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://bible.fi',
        icons: [
          typeof window !== 'undefined' 
            ? `${window.location.origin}/bible-fi-brand-logo-v2.png`
            : 'https://bible.fi/bible-fi-brand-logo-v2.png'
        ],
        verifyUrl: 'https://verify.walletconnect.com'
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-accent-color': '#FFD700',
          '--wcm-background-color': '#0A0A0A',
          '--wcm-z-index': '1000'
        }
      }
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
