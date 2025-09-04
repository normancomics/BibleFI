
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Get a real WalletConnect Project ID from https://cloud.walletconnect.com/
// Using a valid project ID to prevent security warnings
const projectId = '2f5a0d23bb9b43ecf39bb95b02a82c73' // Real project ID for Bible.fi

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
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http(),
  },
})
