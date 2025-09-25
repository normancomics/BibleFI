
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Free WalletConnect Project ID - no cost for usage
const projectId = process.env.NODE_ENV === 'production' 
  ? '2f5a0d23bb9b43ecf39bb95b02a82c73' 
  : 'demo' // Demo mode for development

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
      appName: 'Bible.fi',
      appLogoUrl: '/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png',
      preference: 'all', // Allow both smart wallet and extension
      version: '4',
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'Bible.fi',
        description: 'Biblical wisdom meets DeFi innovation',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://bible.fi',
        icons: ['/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png']
      },
      showQrModal: true,
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
