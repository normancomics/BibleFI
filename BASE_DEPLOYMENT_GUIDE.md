# Bible.fi Base Chain Deployment Guide

## Overview
This guide walks through deploying Bible.fi to Base mainnet with full contract verification and production optimization.

## Prerequisites

### Required Accounts & Setup
- [ ] **Base Wallet**: Coinbase Wallet or compatible with Base ETH for gas
- [ ] **BaseScan Account**: For contract verification
- [ ] **Alchemy/Infura**: Base mainnet RPC endpoint (optional, using public RPC)
- [ ] **ENS Domain**: biblefi.base.eth configured

### Required Funds
- **0.01 ETH** minimum on Base for contract deployment gas
- **0.001 ETH** for contract verification
- **Initial Liquidity**: $1,000+ for DEX pool creation (optional)

## Step 1: Contract Deployment to Base Mainnet

### Deploy BibleToken Contract
```solidity
// src/contracts/BibleToken.sol
contract BibleToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    uint256 public constant TREASURY_FEE = 10; // 10% fee
    address public treasuryAddress;
    
    constructor(address _treasury) ERC20("Bible Token", "BIBLE") {
        treasuryAddress = _treasury;
        _mint(msg.sender, TOTAL_SUPPLY);
    }
}
```

### Deployment Commands
```bash
# 1. Install Hardhat (if not installed)
npm install --save-dev hardhat @nomiclabs/hardhat-ethers

# 2. Configure hardhat.config.js for Base
networks: {
  base: {
    url: "https://mainnet.base.org",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 8453
  }
}

# 3. Deploy to Base mainnet
npx hardhat run scripts/deploy.js --network base

# 4. Verify on BaseScan
npx hardhat verify --network base CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"
```

### Expected Contract Addresses (after deployment)
- **BibleToken**: `0x...` (will be generated)
- **WisdomRewardsPool**: `0x...` (will be generated)
- **Treasury**: `biblefi.base.eth` (ENS resolved)

## Step 2: Frontend Production Deployment

### Lovable Production Build
```bash
# 1. In Lovable interface
# Click "Publish" -> "Deploy to Production"

# 2. Configure custom domain
# Project Settings -> Domains -> Connect Domain
# Domain: bible.fi
# Subdomain: app.bible.fi (optional)
```

### Environment Configuration
```typescript
// src/config/deployment.ts - Production settings
export const DEPLOYMENT_CONFIG = {
  environment: {
    isProduction: true,
    domain: 'bible.fi',
    baseUrl: 'https://bible.fi',
  },
  
  endpoints: {
    base: 'https://mainnet.base.org',
    supabase: 'https://ojiipppypzigjnjblbzn.supabase.co',
    farcaster: 'https://api.farcaster.xyz',
  },
  
  contracts: {
    bibleToken: '0x...', // Update after deployment
    wisdomRewards: '0x...', // Update after deployment
    treasury: 'biblefi.base.eth',
  }
};
```

## Step 3: Supabase Edge Functions Deployment

### Deploy Biblical Advisor Function
```bash
# Deploy edge functions to production
supabase functions deploy biblical-advisor --project-ref ojiipppypzigjnjblbzn
supabase functions deploy farcaster-api --project-ref ojiipppypzigjnjblbzn
supabase functions deploy frame-handler --project-ref ojiipppypzigjnjblbzn
```

### Configure Production Secrets
```bash
# Add API keys to Supabase secrets
supabase secrets set FARCASTER_API_KEY=your_key --project-ref ojiipppypzigjnjblbzn
supabase secrets set COINGECKO_API_KEY=your_key --project-ref ojiipppypzigjnjblbzn
supabase secrets set NEYNAR_API_KEY=your_key --project-ref ojiipppypzigjnjblbzn
```

## Step 4: Base Chain Integration Verification

### Verify Base Chain Features
```typescript
// Test Base Chain connectivity
const baseProvider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
const chainId = await baseProvider.getNetwork();
console.log('Base Chain ID:', chainId.chainId); // Should be 8453

// Test wallet connections
const { connect } = useConnect();
await connect({ connector: coinbaseWallet });

// Test DeFi functions
const swapResult = await executeSwap(fromToken, toToken, amount);
const stakeResult = await stakeTokens(amount, duration);
```

### Test Core Features on Base
- [ ] **Wallet Connection**: Coinbase Wallet, Rainbow, WalletConnect
- [ ] **Token Swaps**: USDC/ETH/WETH/DAI on Base DEXs
- [ ] **Staking**: Native staking contracts
- [ ] **Tithing**: Church payment processing
- [ ] **Analytics**: Real-time transaction tracking

## Step 5: Farcaster Mini-App Integration

### Frame Deployment Verification
```html
<!-- public/frame.html - Production frame -->
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://bible.fi/bible-fi-preview.png" />
<meta property="fc:frame:button:1" content="Open Bible.fi" />
<meta property="fc:frame:post_url" content="https://bible.fi/api/frame" />
```

### Test Farcaster Integration
- [ ] **Frame Loading**: Verify frame displays in Farcaster
- [ ] **Mini-App Launch**: Test direct launch from Farcaster
- [ ] **Wallet Integration**: Farcaster wallet compatibility
- [ ] **Sharing**: Wisdom sharing to Farcaster feeds

## Step 6: Security & Performance Optimization

### Security Checklist
- [ ] **SSL Certificate**: HTTPS enabled
- [ ] **API Rate Limiting**: Supabase RLS policies active
- [ ] **Wallet Security**: Secure connection handling
- [ ] **Contract Auditing**: Smart contract security review

### Performance Optimization
- [ ] **CDN**: Static assets optimized
- [ ] **Image Optimization**: WebP format, compression
- [ ] **Code Splitting**: Lazy loading implemented
- [ ] **Caching**: Browser and API caching configured

## Step 7: Analytics & Monitoring Setup

### Production Analytics
```typescript
// Real-time metrics tracking
const trackUserActivity = (action: string, data: any) => {
  analytics.track(action, {
    ...data,
    timestamp: Date.now(),
    chainId: 8453, // Base Chain
    version: '1.0.0'
  });
};

// Track key metrics
trackUserActivity('wallet_connected', { walletType });
trackUserActivity('defi_transaction', { type, amount, token });
trackUserActivity('tithe_sent', { church, amount, method });
```

### Monitoring Dashboard
- [ ] **Uptime Monitoring**: 99.9% availability target
- [ ] **Error Tracking**: Real-time error alerts
- [ ] **Performance Metrics**: Page load times, transaction speeds
- [ ] **User Analytics**: DAU, retention, conversion rates

## Post-Deployment Verification Checklist

### Frontend Verification
- [ ] Domain resolves to production app
- [ ] All pages load under 3 seconds
- [ ] Responsive design works on mobile
- [ ] Sound and animations function properly

### Backend Verification
- [ ] Supabase edge functions respond
- [ ] Database queries execute successfully
- [ ] API integrations return valid data
- [ ] Security policies enforce correctly

### Blockchain Verification
- [ ] Smart contracts verified on BaseScan
- [ ] Token transfers work correctly
- [ ] DeFi integrations function properly
- [ ] Gas optimizations reduce costs

### User Experience Verification
- [ ] Wallet connections are seamless
- [ ] Transaction flows are intuitive
- [ ] Error handling provides clear feedback
- [ ] Help documentation is accessible

## Launch Day Protocol

### Pre-Launch (T-24 hours)
- [ ] Final security audit
- [ ] Performance testing
- [ ] Backup systems verified
- [ ] Team coordination briefing

### Launch Day (T-0)
- [ ] DNS cutover to production
- [ ] Monitor error rates and performance
- [ ] Track user onboarding success
- [ ] Prepare for user feedback

### Post-Launch (T+24 hours)
- [ ] Review analytics data
- [ ] Address any critical issues
- [ ] Plan feature iterations
- [ ] Community feedback integration

## Success Metrics & KPIs

### Technical Metrics
- **Uptime**: 99.9%+ availability
- **Performance**: <3s page load times
- **Security**: Zero critical vulnerabilities
- **Scalability**: Support 1000+ concurrent users

### Business Metrics
- **User Adoption**: 100+ wallets connected in 7 days
- **Transaction Volume**: $10,000+ DeFi volume in 30 days
- **Community Growth**: 50+ Farcaster interactions weekly
- **Church Partnerships**: 10+ verified churches integrated

---

## Support & Resources

### Technical Support
- **Documentation**: https://docs.bible.fi
- **Discord**: Bible.fi Community Server
- **GitHub**: Repository with full source code
- **Email**: support@bible.fi

### Base Chain Resources
- **BaseScan**: https://basescan.org
- **Base Docs**: https://docs.base.org
- **Base Discord**: Base Chain community
- **Coinbase Wallet**: Official Base wallet

**🚀 Ready for Base Chain Deployment!**