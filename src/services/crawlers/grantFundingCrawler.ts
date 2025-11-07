import { supabase } from '@/integrations/supabase/client';

interface Grant {
  id: string;
  name: string;
  organization: string;
  category: string;
  amount: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  eligibility: string[];
  applicationUrl: string;
  description: string;
  focusAreas: string[];
  matchesBibleFi: boolean;
  matchReason?: string;
}

class GrantFundingCrawler {
  private sources = [
    { name: 'Gitcoin Grants', url: 'https://grants.gitcoin.co', type: 'web3' },
    { name: 'Optimism RetroPGF', url: 'https://optimism.io/retropgf', type: 'web3' },
    { name: 'Base Ecosystem Fund', url: 'https://base.org/ecosystem-fund', type: 'web3' },
    { name: 'Templeton Religion Trust', url: 'https://templetonreligiontrust.org', type: 'faith' },
    { name: 'Lilly Endowment', url: 'https://www.lillyendowment.org', type: 'faith' },
    { name: 'Christianity Today Grants', url: 'https://www.christianitytoday.org/grants', type: 'faith' }
  ];

  async crawlAllGrants(onProgress?: (progress: number) => void): Promise<Grant[]> {
    console.log('💰 Starting Grant & Funding Crawler...');
    
    const allGrants: Grant[] = [];
    
    for (let i = 0; i < this.sources.length; i++) {
      if (onProgress) {
        onProgress((i / this.sources.length) * 100);
      }
      
      const grants = await this.crawlGrantSource(this.sources[i]);
      allGrants.push(...grants);
      
      await this.storeGrants(grants);
    }
    
    if (onProgress) onProgress(100);
    
    console.log(`✅ Grant crawler completed: ${allGrants.length} opportunities found`);
    return allGrants;
  }

  private async crawlGrantSource(source: any): Promise<Grant[]> {
    // Mock data - in production, scrape grant websites or use APIs
    const mockGrant: Grant = {
      id: `${source.name}-${Date.now()}`,
      name: source.type === 'web3' ? 'Faith & Finance DApp Grant' : 'Digital Ministry Innovation Grant',
      organization: source.name,
      category: source.type,
      amount: {
        min: source.type === 'web3' ? 10000 : 25000,
        max: source.type === 'web3' ? 100000 : 250000,
        currency: source.type === 'web3' ? 'USDC' : 'USD'
      },
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      eligibility: ['Open source', 'Public good', 'Faith-based organizations'],
      applicationUrl: `${source.url}/apply`,
      description: 'Supporting innovative projects at the intersection of faith and technology',
      focusAreas: ['blockchain', 'defi', 'religious organizations', 'financial education'],
      matchesBibleFi: true,
      matchReason: 'Perfect alignment with biblical financial education and DeFi integration'
    };
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return [mockGrant];
  }

  private async storeGrants(grants: Grant[]): Promise<void> {
    console.log(`💾 Storing ${grants.length} grant opportunities...`);
    for (const grant of grants) {
      console.log(`  - ${grant.organization}: ${grant.name} ($${grant.amount.min}-$${grant.amount.max})`);
    }
  }
}

export const grantFundingCrawler = new GrantFundingCrawler();
