
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Temporarily disable WalletConnect until you get a Project ID from cloud.walletconnect.com
// const projectId = 'your-project-id-here'

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Bible.fi',
      appLogoUrl: '/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png',
    }),
    // Commented out until you get a valid Project ID
    // walletConnect({
    //   projectId: projectId,
    //   metadata: {
    //     name: 'Bible.fi',
    //     description: 'Biblical wisdom for your financial journey on Base Chain',
    //     url: window.location.origin,
    //     icons: ['/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png']
    //   }
    // }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http(),
  },
})
