
// Deployment configuration for Bible.fi
export const DEPLOYMENT_CONFIG = {
  // App metadata
  app: {
    name: 'Bible.fi',
    version: '1.0.0',
    description: 'Biblical wisdom for your financial journey on Base Chain',
    author: 'Bible.fi Team',
    keywords: ['defi', 'biblical', 'finance', 'base', 'farcaster'],
  },
  
  // Environment detection
  environment: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    domain: typeof window !== 'undefined' ? window.location.host : 'bible.fi',
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://bible.fi',
  },
  
  // Feature flags for deployment
  features: {
    farcasterIntegration: true,
    walletConnect: true,
    daimoPayments: true,
    superfluidStreams: true,
    odosSwaps: true,
    taxCalculations: true,
    cbdcEducation: true,
    ragAiAdvisor: true,
    soundEffects: true,
    pixelAnimations: true,
  },
  
  // Performance optimizations
  performance: {
    enableServiceWorker: true,
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enablePreloading: true,
  },
  
  // SEO and social sharing
  seo: {
    title: 'Bible.fi - Biblical DeFi on Base Chain',
    description: 'Apply biblical wisdom to your financial journey with DeFi, tithing, and tax management on Base Chain.',
    image: '/lovable-uploads/cc7f6bb4-ec25-48d5-84c4-78292783c823.png',
    twitterHandle: '@biblefi',
  },
  
  // Deployment endpoints
  endpoints: {
    api: typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://bible.fi/api',
    supabase: 'https://ojiipppypzigjnjblbzn.supabase.co',
    farcaster: 'https://api.farcaster.xyz',
    base: 'https://mainnet.base.org',
  },
};

// Environment validation
export const validateDeployment = () => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check critical configurations
  if (!DEPLOYMENT_CONFIG.endpoints.supabase) {
    errors.push('Supabase URL not configured');
  }
  
  if (DEPLOYMENT_CONFIG.environment.isProduction && DEPLOYMENT_CONFIG.environment.domain.includes('localhost')) {
    warnings.push('Production build detected but running on localhost');
  }
  
  // Check feature dependencies
  if (DEPLOYMENT_CONFIG.features.farcasterIntegration && !DEPLOYMENT_CONFIG.endpoints.farcaster) {
    warnings.push('Farcaster integration enabled but API endpoint not configured');
  }
  
  return { warnings, errors, isValid: errors.length === 0 };
};

// Runtime configuration helper
export const getRuntimeConfig = () => {
  const validation = validateDeployment();
  
  return {
    ...DEPLOYMENT_CONFIG,
    validation,
    timestamp: new Date().toISOString(),
  };
};
