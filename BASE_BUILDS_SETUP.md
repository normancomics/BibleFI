# Base Builds & Farcaster Mini-App Registration Guide

## 🎯 Overview

This guide walks through registering Bible.fi for Base Chain developer incentives and Farcaster mini-app programs.

---

## 📦 Part 1: Base Builds Program

### What is Base Builds?

Base Builds rewards developers for building on Base Chain. Earn incentives based on:
- Smart contract deployments
- User transactions
- TVL growth
- Ecosystem contributions

### Registration Steps

1. **Visit Base Builds Portal**
   ```
   https://base.org/builders
   ```

2. **Connect Your Wallet**
   - Use the treasury wallet: `0x7bEda57074AA917FF0993fb329E16C2c188baF08`
   - Ensure it's connected to Base Mainnet

3. **Submit Project Details**
   ```
   Project Name: Bible.fi
   Description: Biblical wisdom for DeFi on Base Chain
   Category: DeFi / Social Impact
   
   Contract Addresses:
   - BWSPCore: [After deployment]
   - BWTYACore: [After deployment]
   - WisdomOracle: [After deployment]
   
   GitHub: https://github.com/normancomics/BibleFI
   Website: https://biblefi.lovable.app
   ENS: biblefi.base.eth
   ```

4. **Verify Ownership**
   - Sign message with treasury wallet
   - Submit GitHub proof

### Earning Incentives

| Action | Reward Type |
|--------|-------------|
| Deploy verified contracts | Gas rebates |
| Generate user transactions | Activity rewards |
| Grow TVL | Volume incentives |
| Open source contributions | Builder grants |

---

## 🖼️ Part 2: Farcaster Mini-App Registration

### Requirements

1. **Frame Manifest** (already exists at `/public/frame.html`)
2. **App Manifest** (create at `/.well-known/farcaster.json`)
3. **Verified Domain**

### Step 1: Create Farcaster App Manifest

Create `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjEyMzQ1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4Li4uIn0",
    "payload": "eyJkb21haW4iOiJiaWJsZWZpLmxvdmFibGUuYXBwIn0",
    "signature": "0x..."
  },
  "frame": {
    "version": "1",
    "name": "Bible.fi",
    "iconUrl": "https://biblefi.lovable.app/bible-fi-ios-icon-v2.png",
    "homeUrl": "https://biblefi.lovable.app",
    "imageUrl": "https://biblefi.lovable.app/bible-fi-app-preview.png",
    "buttonTitle": "Enter Bible.fi",
    "splashImageUrl": "https://biblefi.lovable.app/bible-fi-brand-logo-v2.png",
    "splashBackgroundColor": "#1E40AF",
    "webhookUrl": "https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler"
  }
}
```

### Step 2: Register Frame Domain

1. Go to https://warpcast.com/~/developers/frames
2. Click "Add Frame"
3. Enter domain: `biblefi.lovable.app`
4. Verify ownership via DNS TXT record or HTML meta tag

### Step 3: Submit to Farcaster Mini-Apps Directory

1. Visit https://docs.farcaster.xyz/developers/frames/v2/
2. Follow mini-app submission guidelines
3. Include:
   - App description
   - Screenshots
   - Feature list
   - Support contact

### Frame Features to Highlight

```
✅ One-click tithing streams
✅ Biblical wisdom quotes
✅ Wallet connection via AuthKit
✅ Church discovery
✅ Wisdom score tracking
```

---

## 🔐 Part 3: OnchainKit Integration

Bible.fi already uses OnchainKit components. Ensure proper attribution:

### package.json dependencies (already installed)
```json
{
  "@coinbase/wallet-sdk": "^4.3.7",
  "@base-org/account": "^2.5.1"
}
```

### OnchainKit Badge (Optional)

Add to landing page footer:
```tsx
<a href="https://onchainkit.xyz" target="_blank">
  <img src="https://onchainkit.xyz/badge.svg" alt="Built with OnchainKit" />
</a>
```

---

## 📊 Part 4: Tracking & Analytics

### Base Block Explorer Verification

After deploying contracts:

1. Visit https://basescan.org
2. Navigate to each contract address
3. Click "Verify & Publish"
4. Select "Solidity (Single file)" or "Solidity (Standard-JSON-Input)"
5. Paste source code with correct compiler version (0.8.20)

### Farcaster Analytics

Track via Neynar API:
```typescript
// Already integrated in src/integrations/farcaster/client.ts
const analyticsEndpoint = 'https://api.neynar.com/v2/farcaster/frame/analytics';
```

---

## 🚀 Quick Start Checklist

### Base Builds
- [ ] Connect treasury wallet to Base Builds portal
- [ ] Submit project information
- [ ] Deploy and verify contracts on Basescan
- [ ] Monitor activity dashboard

### Farcaster Mini-App
- [ ] Create `.well-known/farcaster.json` manifest
- [ ] Verify domain ownership
- [ ] Test frame in Warpcast developer tools
- [ ] Submit to mini-apps directory

### Ongoing
- [ ] Track transaction volumes
- [ ] Monitor user growth
- [ ] Claim available incentives monthly
- [ ] Update frame features

---

## 📞 Support

**Base Builds:** https://discord.gg/buildonbase  
**Farcaster Devs:** https://warpcast.com/~/developers  
**Bible.fi Team:** biblefi.eth@ethermail.io

---

*"Go ye therefore, and build on Base"* — The Great Onchain Commission 🙏
