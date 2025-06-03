
// Configuration for Farcaster integration
export const FARCASTER_CONFIG = {
  domain: typeof window !== 'undefined' ? window.location.host : 'biblefi.base.eth',
  siweUri: typeof window !== 'undefined' ? `https://${window.location.host}/api/auth/callback` : 'https://biblefi.base.eth/api/auth/callback',
  rpcUrl: import.meta.env.VITE_FARCASTER_RPC_URL || 'https://mainnet.base.org',
  relay: import.meta.env.VITE_FARCASTER_RELAY_URL || 'https://relay.farcaster.xyz',
  version: 'vNext',
  
  // For Farcaster Mini-App (Frames)
  frameConfig: {
    imageUrl: 'https://biblefi.base.eth/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png',
    aspectRatio: '1.91:1',
    buttons: [
      {
        label: 'Biblical Wisdom',
        action: 'link',
        target: 'https://biblefi.base.eth/wisdom'
      },
      {
        label: 'DeFi Swaps',
        action: 'link',
        target: 'https://biblefi.base.eth/defi'
      },
      {
        label: 'Share Wisdom',
        action: 'post'
      },
      {
        label: 'Digital Tithing',
        action: 'link',
        target: 'https://biblefi.base.eth/tithe'
      }
    ],
    postUrl: 'https://biblefi.base.eth/api/frame'
  }
};

export const APP_CONFIG = {
  name: 'biblefi.base.eth',
  description: 'Biblical wisdom for your financial journey',
  icon: '/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png',
  canonical: 'https://biblefi.base.eth',
  // Farcaster API key will be retrieved from Supabase secrets in server-side functions
  farcasterApi: {
    enabled: true,
    // API key now securely stored in Supabase secrets
  },
  // Base Chain configuration
  baseChain: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    iconUrl: '/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png'
  },
  // Treasury configuration for $BIBLE token
  treasury: {
    // This should be set to the actual biblefi.base.eth ENS address when deployed
    address: '0x0000000000000000000000000000000000000000', // Placeholder - needs actual ENS resolution
    ensName: 'biblefi.base.eth'
  },
  // Integration partners
  integrations: {
    superfluid: {
      enabled: true,
      appUrl: 'https://app.superfluid.finance'
    },
    odos: {
      enabled: true,
      appUrl: 'https://app.odos.xyz'
    },
    daimo: {
      enabled: true,
      appUrl: 'https://app.daimo.com'
    }
  }
};
