import { supabase } from '@/integrations/supabase/client';

interface CommentarySource {
  author: string;
  title: string;
  url: string;
  type: 'classic' | 'modern' | 'academic';
  topics: string[];
}

interface Commentary {
  reference: string;
  author: string;
  source: string;
  commentary_text: string;
  themes: string[];
  financial_insights: string[];
  defi_applications: string[];
}

/**
 * Commentary & Theology Crawler
 * Scrapes classic exegesis, modern Christian finance literature,
 * and academic papers on biblical economics
 */
export class CommentaryTheologyCrawler {
  private sources: CommentarySource[] = [
    // Classic Commentary
    {
      author: 'Matthew Henry',
      title: 'Matthew Henry Complete Commentary',
      url: 'https://www.biblestudytools.com/commentaries/matthew-henry-complete/',
      type: 'classic',
      topics: ['exegesis', 'theology', 'practical application']
    },
    {
      author: 'John MacArthur',
      title: 'MacArthur Study Bible Commentary',
      url: 'https://www.gty.org/library/bible-commentaries',
      type: 'classic',
      topics: ['systematic theology', 'biblical interpretation']
    },
    
    // Modern Christian Finance
    {
      author: 'Crown Financial Ministries',
      title: 'Biblical Financial Principles',
      url: 'https://www.crown.org/library/',
      type: 'modern',
      topics: ['stewardship', 'budgeting', 'debt freedom', 'giving']
    },
    {
      author: 'Dave Ramsey',
      title: 'Financial Peace University',
      url: 'https://www.ramseysolutions.com/ramseyplus/financial-peace',
      type: 'modern',
      topics: ['debt elimination', 'emergency fund', 'investing']
    },
    {
      author: 'Randy Alcorn',
      title: 'Money, Possessions, and Eternity',
      url: 'https://www.epm.org/resources/money-possessions-eternity/',
      type: 'modern',
      topics: ['eternal perspective', 'generosity', 'treasure in heaven']
    },
    
    // Academic Papers
    {
      author: 'Various',
      title: 'Journal of Biblical Economics',
      url: 'https://scholar.google.com/scholar?q=biblical+economics',
      type: 'academic',
      topics: ['economic theory', 'biblical law', 'Jubilee', 'sabbath economics']
    }
  ];

  async crawlAllCommentaries(onProgress?: (progress: number) => void): Promise<Commentary[]> {
    const commentaries: Commentary[] = [];
    let processed = 0;

    console.log('Starting commentary crawl...');

    for (const source of this.sources) {
      try {
        const sourceCommentaries = await this.crawlSource(source);
        commentaries.push(...sourceCommentaries);
        
        processed++;
        if (onProgress) {
          onProgress((processed / this.sources.length) * 100);
        }
      } catch (error) {
        console.error(`Error crawling ${source.title}:`, error);
      }
    }

    // Store all commentaries
    await this.storeCommentaries(commentaries);

    console.log(`Crawled ${commentaries.length} commentaries from ${this.sources.length} sources`);
    return commentaries;
  }

  private async crawlSource(source: CommentarySource): Promise<Commentary[]> {
    console.log(`Crawling ${source.title} by ${source.author}...`);

    // For now, return structured mock data
    // In production, this would fetch from actual APIs or scrape websites
    return this.getMockCommentaries(source);
  }

  private getMockCommentaries(source: CommentarySource): Commentary[] {
    const financialVerses = [
      'Proverbs 22:7', 'Matthew 6:24', 'Luke 14:28', 'Malachi 3:10',
      'Proverbs 21:5', '1 Timothy 6:10', 'Ecclesiastes 5:10',
      'Proverbs 13:11', 'Matthew 25:14-30', 'Luke 16:10-12'
    ];

    return financialVerses.map(reference => ({
      reference,
      author: source.author,
      source: source.title,
      commentary_text: this.generateCommentary(reference, source.type),
      themes: this.extractThemes(reference),
      financial_insights: this.extractFinancialInsights(reference),
      defi_applications: this.mapToDeFi(reference)
    }));
  }

  private generateCommentary(reference: string, type: string): string {
    const templates = {
      classic: `Classical exegetical interpretation focusing on the original Greek/Hebrew context and historical application.`,
      modern: `Modern practical application emphasizing biblical stewardship principles for contemporary financial decisions.`,
      academic: `Scholarly analysis examining economic structures, covenantal law, and systemic implications for community wealth.`
    };

    return `${templates[type as keyof typeof templates]} [Full commentary text would be crawled from source]`;
  }

  private extractThemes(reference: string): string[] {
    const themeMap: Record<string, string[]> = {
      'Proverbs 22:7': ['debt slavery', 'financial bondage', 'wisdom'],
      'Matthew 6:24': ['divided loyalty', 'mammon', 'priority setting'],
      'Luke 14:28': ['planning', 'counting cost', 'wisdom in projects'],
      'Malachi 3:10': ['tithing', 'testing God', 'provision', 'blessing'],
      'Proverbs 21:5': ['planning', 'diligence', 'avoiding haste'],
      '1 Timothy 6:10': ['love of money', 'root of evil', 'contentment'],
      'Ecclesiastes 5:10': ['never satisfied', 'vanity of wealth'],
      'Proverbs 13:11': ['steady growth', 'dishonest gain', 'patience'],
      'Matthew 25:14-30': ['stewardship', 'multiplication', 'accountability'],
      'Luke 16:10-12': ['faithfulness', 'small things', 'true riches']
    };

    return themeMap[reference] || ['general wisdom'];
  }

  private extractFinancialInsights(reference: string): string[] {
    const insightMap: Record<string, string[]> = {
      'Proverbs 22:7': ['Avoid debt when possible', 'Debt creates dependency', 'Financial freedom through debt elimination'],
      'Matthew 6:24': ['Money can become an idol', 'Serve God, not wealth', 'Examine financial priorities'],
      'Luke 14:28': ['Budget before committing', 'Plan for full cost', 'Avoid incomplete projects'],
      'Malachi 3:10': ['Tithe faithfully', 'God provides for givers', 'Test through obedience'],
      'Proverbs 21:5': ['Plan leads to profit', 'Haste leads to poverty', 'Steady planning wins'],
      '1 Timothy 6:10': ['Money is neutral, love is the issue', 'Contentment protects', 'Greed destroys'],
      'Ecclesiastes 5:10': ['More money, more problems', 'Satisfaction comes from God', 'Vanity of accumulation'],
      'Proverbs 13:11': ['Get rich slowly', 'Quick schemes fail', 'Steady accumulation wins'],
      'Matthew 25:14-30': ['Multiply what God gives', 'Stewards will give account', 'Use or lose principle'],
      'Luke 16:10-12': ['Small faithfulness matters', 'Money is a test', 'Eternal riches follow earthly faithfulness']
    };

    return insightMap[reference] || ['General financial wisdom'];
  }

  private mapToDeFi(reference: string): string[] {
    const defiMap: Record<string, string[]> = {
      'Proverbs 22:7': ['Avoid over-leveraged positions', 'Understand liquidation risks', 'Flash loan caution'],
      'Matthew 6:24': ['Diversify, don\'t idolize one token', 'Balance crypto with real-world needs'],
      'Luke 14:28': ['Calculate gas fees before transactions', 'Understand smart contract risks', 'DCA planning'],
      'Malachi 3:10': ['Continuous streaming tithes via Superfluid', 'Automated giving', 'On-chain transparency'],
      'Proverbs 21:5': ['DCA over lump sum', 'Research before aping', 'Long-term yield farming'],
      '1 Timothy 6:10': ['Don\'t chase hype coins', 'FOMO is dangerous', 'Greed leads to rug pulls'],
      'Ecclesiastes 5:10': ['More tokens, more complexity', 'Simplify portfolio', 'Chasing APY is vanity'],
      'Proverbs 13:11': ['Compound interest in staking', 'Avoid get-rich-quick schemes', 'Steady DeFi yields'],
      'Matthew 25:14-30': ['Stake idle assets', 'Provide liquidity', 'Actively manage portfolio'],
      'Luke 16:10-12': ['Start with small amounts', 'Test protocols carefully', 'Build trust in DeFi slowly']
    };

    return defiMap[reference] || ['General DeFi wisdom'];
  }

  private async storeCommentaries(commentaries: Commentary[]): Promise<void> {
    // Store in biblical_knowledge_base for now since biblical_commentaries table doesn't exist
    for (const commentary of commentaries) {
      const { error } = await supabase
        .from('biblical_knowledge_base')
        .upsert({
          reference: commentary.reference,
          verse_text: commentary.commentary_text,
          category: 'commentary',
          principle: commentary.financial_insights.join('; '),
          application: commentary.defi_applications.join('; '),
          defi_relevance: `${commentary.author}: ${commentary.source}`,
          financial_keywords: commentary.themes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'reference'
        });

      if (error) {
        console.warn('Commentary storage error:', error.message);
      }
    }
  }
}

export const commentaryTheologyCrawler = new CommentaryTheologyCrawler();
