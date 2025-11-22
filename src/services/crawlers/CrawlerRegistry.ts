import { BaseCrawler, CrawlerConfig } from './BaseCrawler';
import { scriptureTranslationCrawler } from './scriptureTranslationCrawler';
import { commentaryTheologyCrawler } from './commentaryTheologyCrawler';
import { defiProtocolCrawler } from './defiProtocolCrawler';
import { superfluidEventCrawler } from './superfluidEventCrawler';
import { communitySignalCrawler } from './communitySignalCrawler';
import { taxRegulatoryKnowledgeCrawler } from './taxRegulatoryKnowledgeCrawler';
import { churchPaymentProcessorCrawler } from './churchPaymentProcessorCrawler';
import { biblicalFinanceNewsCrawler } from './biblicalFinanceNewsCrawler';
import { smartContractAuditCrawler } from './smartContractAuditCrawler';
import { grantFundingCrawler } from './grantFundingCrawler';
import { historicalEconomicEventsCrawler } from './historicalEconomicEventsCrawler';
import { denominationTeachingCrawler } from './denominationTeachingCrawler';
import { yieldAggregatorCrawler } from './yieldAggregatorCrawler';
import { nftDigitalAssetCrawler } from './nftDigitalAssetCrawler';
import { macroEconomicIndicatorCrawler } from './macroEconomicIndicatorCrawler';

export interface CrawlerInstance {
  id: string;
  config: CrawlerConfig;
  instance: any; // The actual crawler instance
}

class CrawlerRegistryClass {
  private crawlers: Map<string, CrawlerInstance> = new Map();

  constructor() {
    this.registerDefaultCrawlers();
  }

  private registerDefaultCrawlers(): void {
    // Biblical crawlers
    this.register('scripture-translation', {
      id: 'scripture-translation',
      name: 'Scripture Translation Crawler',
      description: 'Hebrew, Greek, Aramaic, KJV financial texts',
      category: 'biblical',
      icon: '📜',
      estimatedDuration: '~15 min'
    }, scriptureTranslationCrawler);

    this.register('commentary-theology', {
      id: 'commentary-theology',
      name: 'Commentary & Theology Crawler',
      description: 'Theological interpretations & financial wisdom',
      category: 'biblical',
      icon: '📖',
      estimatedDuration: '~10 min'
    }, commentaryTheologyCrawler);

    this.register('denomination-teaching', {
      id: 'denomination-teaching',
      name: 'Denomination Teaching Crawler',
      description: 'Stewardship teachings across denominations',
      category: 'biblical',
      icon: '⛪',
      estimatedDuration: '~8 min'
    }, denominationTeachingCrawler);

    // Church crawlers
    this.register('church-payment-processor', {
      id: 'church-payment-processor',
      name: 'Church Payment Processor Crawler',
      description: 'Churches accepting crypto & payment processors',
      category: 'church',
      icon: '💳',
      estimatedDuration: '~12 min'
    }, churchPaymentProcessorCrawler);

    // DeFi crawlers
    this.register('defi-protocol', {
      id: 'defi-protocol',
      name: 'DeFi Protocol Crawler',
      description: 'Base chain protocols, TVL, APY data',
      category: 'defi',
      icon: '🏦',
      estimatedDuration: '~5 min'
    }, defiProtocolCrawler);

    this.register('superfluid-event', {
      id: 'superfluid-event',
      name: 'Superfluid Event Crawler',
      description: 'Real-time streaming payment events',
      category: 'defi',
      icon: '💧',
      estimatedDuration: '~3 min'
    }, superfluidEventCrawler);

    this.register('yield-aggregator', {
      id: 'yield-aggregator',
      name: 'Yield Aggregator Crawler',
      description: 'Best yields across DeFi protocols',
      category: 'defi',
      icon: '🌾',
      estimatedDuration: '~6 min'
    }, yieldAggregatorCrawler);

    this.register('smart-contract-audit', {
      id: 'smart-contract-audit',
      name: 'Smart Contract Audit Crawler',
      description: 'Security audits & vulnerability reports',
      category: 'defi',
      icon: '🔒',
      estimatedDuration: '~7 min'
    }, smartContractAuditCrawler);

    this.register('nft-digital-asset', {
      id: 'nft-digital-asset',
      name: 'NFT & Digital Asset Crawler',
      description: 'Faith-based NFTs & digital collectibles',
      category: 'defi',
      icon: '🖼️',
      estimatedDuration: '~5 min'
    }, nftDigitalAssetCrawler);

    // Regulatory & News crawlers
    this.register('tax-regulatory', {
      id: 'tax-regulatory',
      name: 'Tax & Regulatory Crawler',
      description: 'IRS crypto guidance & international regulations',
      category: 'regulatory',
      icon: '⚖️',
      estimatedDuration: '~8 min'
    }, taxRegulatoryKnowledgeCrawler);

    this.register('biblical-finance-news', {
      id: 'biblical-finance-news',
      name: 'Biblical Finance News Crawler',
      description: 'Christian financial media & insights',
      category: 'news',
      icon: '📰',
      estimatedDuration: '~6 min'
    }, biblicalFinanceNewsCrawler);

    this.register('grant-funding', {
      id: 'grant-funding',
      name: 'Grant & Funding Crawler',
      description: 'Faith-based & Web3 grant opportunities',
      category: 'news',
      icon: '💰',
      estimatedDuration: '~7 min'
    }, grantFundingCrawler);

    // Economic crawlers
    this.register('historical-economic', {
      id: 'historical-economic',
      name: 'Historical Economic Events Crawler',
      description: 'Biblical economic patterns & cycles',
      category: 'economics',
      icon: '📊',
      estimatedDuration: '~10 min'
    }, historicalEconomicEventsCrawler);

    this.register('macro-economic', {
      id: 'macro-economic',
      name: 'Macro Economic Indicator Crawler',
      description: 'Real-time economic data & biblical correlations',
      category: 'economics',
      icon: '📈',
      estimatedDuration: '~4 min'
    }, macroEconomicIndicatorCrawler);

    // Community crawler
    this.register('community-signal', {
      id: 'community-signal',
      name: 'Community Signal Crawler',
      description: 'Farcaster sentiment & community insights',
      category: 'news',
      icon: '🗣️',
      estimatedDuration: '~4 min'
    }, communitySignalCrawler);
  }

  register(id: string, config: CrawlerConfig, instance: any): void {
    this.crawlers.set(id, { id, config, instance });
  }

  get(id: string): CrawlerInstance | undefined {
    return this.crawlers.get(id);
  }

  getAll(): CrawlerInstance[] {
    return Array.from(this.crawlers.values());
  }

  getByCategory(category: CrawlerConfig['category']): CrawlerInstance[] {
    return this.getAll().filter(c => c.config.category === category);
  }

  async runCrawler(id: string, onProgress?: (progress: number) => void): Promise<any[]> {
    const crawler = this.get(id);
    if (!crawler) {
      throw new Error(`Crawler ${id} not found`);
    }
    return await crawler.instance.crawl(onProgress);
  }

  async runAll(onProgress?: (crawlerId: string, progress: number) => void): Promise<void> {
    const results = await Promise.allSettled(
      this.getAll().map(async (crawler) => {
        const progressCallback = onProgress 
          ? (p: number) => onProgress(crawler.id, p)
          : undefined;
        return await crawler.instance.crawl(progressCallback);
      })
    );

    console.log('🎯 All crawlers completed:', {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    });
  }
}

export const CrawlerRegistry = new CrawlerRegistryClass();
