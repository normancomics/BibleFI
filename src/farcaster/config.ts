
// Configuration for Farcaster integration
export const FARCASTER_CONFIG = {
  domain: window.location.host,
  siweUri: `https://${window.location.host}/api/auth/callback`,
  rpcUrl: process.env.VITE_FARCASTER_RPC_URL || 'https://mainnet.optimism.io',
  relay: process.env.VITE_FARCASTER_RELAY_URL || 'https://relay.farcaster.xyz',
  version: 'vNext',
  
  // For Farcaster Mini-App (Frames)
  frameConfig: {
    imageUrl: `${window.location.protocol}//${window.location.host}/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png`,
    aspectRatio: '1.91:1',
    buttons: [
      {
        label: 'Biblical Wisdom',
        action: 'link',
        target: `/wisdom`
      },
      {
        label: 'DeFi Swaps',
        action: 'link',
        target: `/defi`
      },
      {
        label: 'Share Wisdom',
        action: 'post'
      }
    ],
    postUrl: `/api/frame`
  }
};

export const APP_CONFIG = {
  name: 'biblefi.base.eth',
  description: 'Biblical wisdom for your financial journey',
  icon: '/lovable-uploads/b2a5ac39-70d2-41c8-8526-8e54375b1c1f.png',
  canonical: typeof window !== 'undefined' ? window.location.origin : 'https://biblefi.base.eth',
  // Add Farcaster API key configuration
  farcasterApi: {
    enabled: true,
    apiKey: '425081D4-0BD4-4365-910D-8876E1E1BD00'
  }
};
