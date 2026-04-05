import { BiblicalFinanceCrawlerService } from '@/services/biblicalFinanceCrawler';

/**
 * BiblicalFinanceAgent
 * - Orchestrates the comprehensive crawl, analysis and enrichment of biblical financial verses.
 * - Designed to be invoked by a scheduled job or manually by maintainers.
 */
export class BiblicalFinanceAgent {
  async runFullAnalysis() {
    console.log('Starting Biblical Finance Agent full analysis...');
    const stats = await BiblicalFinanceCrawlerService.crawlAllFinancialVerses();
    console.log('Agent completed. Summary:', stats);
    return stats;
  }

  /**
   * Lightweight subagent: search for a keyword and return top verses
   */
  async searchKeyword(keyword: string) {
    console.log('Subagent: searching verses for', keyword);
    const results = await BiblicalFinanceCrawlerService.searchFinancialVerses(keyword, undefined, 2);
    return results;
  }
}

export default new BiblicalFinanceAgent();
