export interface CrawlerProgress {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  itemsFound: number;
  errors?: string[];
}

export interface CrawlerConfig {
  id: string;
  name: string;
  description: string;
  category: 'biblical' | 'church' | 'defi' | 'regulatory' | 'news' | 'economics';
  icon: string;
  estimatedDuration?: string;
}

export abstract class BaseCrawler<T = any> {
  protected config: CrawlerConfig;
  protected onProgressUpdate?: (progress: CrawlerProgress) => void;

  constructor(config: CrawlerConfig) {
    this.config = config;
  }

  abstract crawl(onProgress?: (progress: number) => void): Promise<T[]>;

  getConfig(): CrawlerConfig {
    return this.config;
  }

  setProgressCallback(callback: (progress: CrawlerProgress) => void): void {
    this.onProgressUpdate = callback;
  }

  protected updateProgress(progress: Partial<CrawlerProgress>): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        status: 'running',
        progress: 0,
        message: '',
        itemsFound: 0,
        ...progress,
      } as CrawlerProgress);
    }
  }

  protected async storeData(data: T[]): Promise<void> {
    console.log(`💾 Storing ${data.length} items for ${this.config.name}...`);
    // Override in subclasses to implement actual storage
  }
}
