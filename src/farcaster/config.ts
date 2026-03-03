
// Configuration for Farcaster integration
export const FARCASTER_CONFIG = {
  domain: typeof window !== 'undefined' ? window.location.hostname : 'id-preview--fa7c5ef0-7079-46e3-a705-c9b6e519b067.lovable.app',
  siweUri: typeof window !== 'undefined' ? window.location.origin : 'https://id-preview--fa7c5ef0-7079-46e3-a705-c9b6e519b067.lovable.app',
  rpcUrl: 'https://mainnet.base.org',
  
  // For Farcaster Mini-App (Frames)
  frameConfig: {
    imageUrl: 'https://biblefi.base.eth/api/generate-image?type=default',
    aspectRatio: '1.91:1',
    buttons: [
      {
        label: 'Biblical Wisdom',
        action: 'post'
      },
      {
        label: 'DeFi Swaps',
        action: 'post'
      },
      {
        label: 'Digital Tithing',
        action: 'post'
      },
      {
        label: 'Share Wisdom',
        action: 'post'
      }
    ],
    postUrl: 'https://biblefi.base.eth/api/frame-handler'
  }
};

export const APP_CONFIG = {
  name: 'BibleFi',
  description: 'Biblical wisdom for your financial journey',
  icon: 'https://biblefi.base.eth/api/generate-image?type=default',
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
    rpcUrl: 'https://base.rpc.subquery.network/public',
    explorerUrl: 'https://basescan.org',
    iconUrl: '/lovable-uploads/922260ef-cba9-4437-9d77-07bcba6560aa.png'
  },
  // Treasury configuration for $BIBLE token
  treasury: {
    // biblefi.base.eth ENS address on Base chain
    address: '0x7bEda57074AA917FF0993fb329E16C2c188baF08',
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
