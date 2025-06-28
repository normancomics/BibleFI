
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

const projectId = 'your-walletconnect-project-id' // You'll need to get this from WalletConnect

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Bible.fi',
      appLogoUrl: 'https://biblefi.base.eth/api/generate-image?type=default',
    }),
    walletConnect({
      projectId: projectId,
      metadata: {
        name: 'Bible.fi',
        description: 'Biblical wisdom for your financial journey',
        url: 'https://biblefi.base.eth',
        icons: ['https://biblefi.base.eth/api/generate-image?type=default']
      }
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http(),
  },
})
