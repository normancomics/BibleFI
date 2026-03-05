
import { createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Updated WalletConnect Project ID for BibleFi production
const projectId = '2589ec8e083adaa554ee06641ce2b93b' // BibleFi official project ID

// Detect Farcaster wallet provider (available inside Warpcast or Farcaster frames)
const getFarcasterProvider = () => {
  if (typeof window === 'undefined') return undefined;
  // Farcaster injects an EIP-1193 provider at window.ethereum when inside Warpcast
  // We detect it via the isFarcaster flag
  const eth = (window as any).ethereum;
  if (eth?.isFarcaster) return eth;
  // Also check providers array (MetaMask multi-provider)
  if (eth?.providers) {
    const fc = eth.providers.find((p: any) => p.isFarcaster);
    if (fc) return fc;
  }
  return undefined;
};

const buildConnectors = () => {
  const list = [];

  // Farcaster Wallet (only appears if inside Warpcast/Farcaster)
  const fcProvider = getFarcasterProvider();
  if (fcProvider) {
    list.push(
      injected({
        target: {
          id: 'farcaster',
          name: 'Farcaster Wallet',
          provider: fcProvider,
        },
      })
    );
  }

  // MetaMask / Browser Wallet
  list.push(
    injected({
      target: {
        id: 'injected',
        name: 'Browser Wallet',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      },
    })
  );

  // Coinbase Wallet
  list.push(
    coinbaseWallet({
      appName: 'BibleFi - Biblical DeFi',
      appLogoUrl: '/bible-fi-brand-logo-v2.png',
      preference: 'all',
      version: '4',
    })
  );

  // WalletConnect v2 (Reown)
  list.push(
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
    })
  );

  return list;
};

export const config = createConfig({
  chains: [base, mainnet],
  connectors: buildConnectors(),
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
