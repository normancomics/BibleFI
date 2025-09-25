# GitHub Pages Deployment Guide for Bible.fi

## Prerequisites
1. GitHub account
2. Repository with your Bible.fi code
3. Custom domain (optional: bible.fi or biblefi.eth)

## Step 1: Repository Setup

### Create Repository
```bash
# Create new repository on GitHub
# Repository name: biblefi-app
# Make it public for free GitHub Pages
```

### Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial Bible.fi mini-app commit"
git branch -M main
git remote add origin https://github.com/[USERNAME]/biblefi-app.git
git push -u origin main
```

## Step 2: Configure Build for GitHub Pages

### Update vite.config.ts
```typescript
export default defineConfig({
  base: '/biblefi-app/', // Add repository name as base
  // ... rest of config
})
```

### Add GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        NODE_ENV: production

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: bible.fi # Optional: your custom domain
```

## Step 3: GitHub Pages Configuration

### Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: "gh-pages"
5. Folder: "/ (root)"

### Custom Domain Setup (Optional)
1. In Pages settings, add custom domain: `bible.fi`
2. Enable "Enforce HTTPS"
3. Configure DNS at your domain registrar:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: [username].github.io
   ```

## Step 4: Update Frame Configuration

### Update Frame URLs
Replace all frame URLs to point to GitHub Pages:
```html
<!-- In public/frame.html -->
<meta property="fc:frame:button:1:target" content="https://bible.fi" />
<meta property="fc:frame:button:2:target" content="https://bible.fi/wisdom" />
<meta property="fc:frame:button:3:target" content="https://bible.fi/defi" />
<meta property="fc:frame:button:4:target" content="https://bible.fi/tithe" />
```

### Update Supabase Edge Functions
Update frame-handler to use new domain:
```typescript
// In frame generation functions
target: 'https://bible.fi/wisdom'
```

## Step 5: DNS Configuration

### For bible.fi domain:
```
Type: CNAME
Name: @
Value: [username].github.io
TTL: 3600

Type: CNAME  
Name: www
Value: [username].github.io
TTL: 3600
```

### For biblefi.base.eth (ENS):
1. Configure ENS resolver to point to GitHub Pages IP
2. Set A record: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

## Step 6: Environment Variables

### GitHub Secrets
Add these secrets in repository settings:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `FARCASTER_API_KEY`

### Update Build Environment
```javascript
// In build process
const GITHUB_PAGES_ENV = {
  VITE_SUPABASE_URL: process.env.SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  VITE_DOMAIN: 'https://bible.fi'
}
```

## Step 7: Verification

### Test Checklist
- [ ] Site loads at GitHub Pages URL
- [ ] Custom domain resolves correctly
- [ ] HTTPS is enforced
- [ ] Farcaster frame works
- [ ] Wallet connections function
- [ ] Supabase integration works
- [ ] All routes are accessible

### Frame Validation
Test frame at:
- Warpcast frame validator
- Frame.dev validator
- Manual testing in Warpcast

## Benefits of GitHub Pages
- ✅ **Free hosting** for public repositories
- ✅ **Automatic deployments** via GitHub Actions
- ✅ **Custom domain support** with SSL
- ✅ **Global CDN** for fast loading
- ✅ **99.9% uptime** guarantee
- ✅ **Easy rollbacks** via Git history

## Cost Comparison
| Service | Monthly Cost | Features |
|---------|--------------|----------|
| GitHub Pages | $0 | Hosting, SSL, CDN |
| Vercel | $0-20 | Hosting, edge functions |
| Netlify | $0-19 | Hosting, forms, functions |
| AWS S3 + CloudFront | $1-5 | Storage, CDN |

GitHub Pages is the most cost-effective solution for static site hosting with excellent performance and reliability.