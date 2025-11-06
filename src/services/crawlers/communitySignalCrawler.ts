import { supabase } from '@/integrations/supabase/client';

interface CommunitySignal {
  platform: 'farcaster' | 'discord' | 'twitter';
  author: string;
  content: string;
  timestamp: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  financialKeywords: string[];
  questions: string[];
  engagement: {
    likes: number;
    replies: number;
    shares: number;
  };
}

interface EmergingTopic {
  topic: string;
  mentions: number;
  sentiment: number;
  relatedQuestions: string[];
  biblicalRelevance: string[];
}

/**
 * Community Signal Crawler
 * Monitors Farcaster, Discord, and social channels for:
 * - User questions
 * - Sentiment analysis
 * - Emerging stewardship topics
 * Feeds signals into AI-driven Biblical Wisdom Synthesis
 */
export class CommunitySignalCrawler {
  private farcasterApiKey: string;
  private isMonitoring = false;
  private signalBuffer: CommunitySignal[] = [];

  constructor() {
    this.farcasterApiKey = import.meta.env.VITE_FARCASTER_API_KEY || '';
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('Community monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting community signal monitoring...');

    // Monitor Farcaster
    this.monitorFarcaster();

    // Process signals every 2 minutes
    setInterval(() => {
      this.processSignalBuffer();
    }, 120000);
  }

  private async monitorFarcaster(): Promise<void> {
    console.log('Monitoring Farcaster for Bible.fi signals...');

    setInterval(async () => {
      try {
        await this.crawlFarcasterCasts();
      } catch (error) {
        console.error('Farcaster crawl error:', error);
      }
    }, 60000); // Check every minute
  }

  private async crawlFarcasterCasts(): Promise<void> {
    // Search for Bible, finance, DeFi, and stewardship related casts
    const keywords = ['bible', 'faith', 'tithe', 'stewardship', 'defi', 'crypto giving'];

    for (const keyword of keywords) {
      try {
        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/cast/search?q=${encodeURIComponent(keyword)}&limit=25`,
          {
            headers: {
              'api_key': this.farcasterApiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) continue;

        const data = await response.json();

        for (const cast of data.result?.casts || []) {
          const signal = this.parseFarcasterCast(cast);
          this.signalBuffer.push(signal);
        }
      } catch (error) {
        console.error(`Error crawling Farcaster for "${keyword}":`, error);
      }
    }
  }

  private parseFarcasterCast(cast: any): CommunitySignal {
    const content = cast.text || '';
    
    return {
      platform: 'farcaster',
      author: cast.author?.username || 'anonymous',
      content: content,
      timestamp: new Date(cast.timestamp).getTime(),
      sentiment: this.analyzeSentiment(content),
      topics: this.extractTopics(content),
      financialKeywords: this.extractFinancialKeywords(content),
      questions: this.extractQuestions(content),
      engagement: {
        likes: cast.reactions?.likes_count || 0,
        replies: cast.replies?.count || 0,
        shares: cast.recasts?.count || 0
      }
    };
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['blessed', 'grateful', 'amazing', 'love', 'faithful', 'generous'];
    const negativeWords = ['worried', 'struggling', 'confused', 'frustrated', 'difficult'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score--;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const topicKeywords = {
      'tithing': ['tithe', 'giving', 'offering', 'donation'],
      'debt': ['debt', 'loan', 'owe', 'borrowed'],
      'investing': ['invest', 'portfolio', 'stake', 'yield'],
      'budgeting': ['budget', 'spending', 'save', 'expense'],
      'generosity': ['generous', 'charity', 'help', 'support'],
      'defi': ['defi', 'dex', 'liquidity', 'protocol', 'smart contract']
    };

    const lowerText = text.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private extractFinancialKeywords(text: string): string[] {
    const keywords = [
      'money', 'crypto', 'token', 'usdc', 'eth', 'bitcoin',
      'wallet', 'transaction', 'fee', 'price', 'apy', 'apr',
      'staking', 'farming', 'liquidity', 'swap', 'trade'
    ];

    const lowerText = text.toLowerCase();
    return keywords.filter(keyword => lowerText.includes(keyword));
  }

  private extractQuestions(text: string): string[] {
    const questions: string[] = [];
    
    // Split by sentence
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.includes('?') || 
          trimmed.toLowerCase().startsWith('how') ||
          trimmed.toLowerCase().startsWith('what') ||
          trimmed.toLowerCase().startsWith('why') ||
          trimmed.toLowerCase().startsWith('when') ||
          trimmed.toLowerCase().startsWith('should')) {
        questions.push(trimmed);
      }
    });

    return questions;
  }

  private async processSignalBuffer(): Promise<void> {
    if (this.signalBuffer.length === 0) return;

    console.log(`Processing ${this.signalBuffer.length} community signals...`);

    // Aggregate signals by topic
    const emergingTopics = this.aggregateTopics(this.signalBuffer);

    // Store emerging topics
    for (const topic of emergingTopics) {
      await this.storeEmergingTopic(topic);
    }

    // Store individual signals for AI training
    for (const signal of this.signalBuffer) {
      await this.storeSignal(signal);
    }

    this.signalBuffer = [];
  }

  private aggregateTopics(signals: CommunitySignal[]): EmergingTopic[] {
    const topicMap = new Map<string, EmergingTopic>();

    signals.forEach(signal => {
      signal.topics.forEach(topic => {
        if (!topicMap.has(topic)) {
          topicMap.set(topic, {
            topic,
            mentions: 0,
            sentiment: 0,
            relatedQuestions: [],
            biblicalRelevance: []
          });
        }

        const topicData = topicMap.get(topic)!;
        topicData.mentions++;
        topicData.sentiment += signal.sentiment === 'positive' ? 1 : signal.sentiment === 'negative' ? -1 : 0;
        topicData.relatedQuestions.push(...signal.questions);
      });
    });

    return Array.from(topicMap.values())
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);
  }

  private async storeEmergingTopic(topic: EmergingTopic): Promise<void> {
    // Log emerging topic for now
    console.log('Emerging topic:', topic);
    // In production, create emerging_topics table via migration
  }

  private async storeSignal(signal: CommunitySignal): Promise<void> {
    // Log community signal for now
    console.log('Community signal:', {
      platform: signal.platform,
      topics: signal.topics,
      sentiment: signal.sentiment
    });
    // In production, create community_signals table via migration
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Stopped community monitoring');
  }

  getBufferSize(): number {
    return this.signalBuffer.length;
  }
}

export const communitySignalCrawler = new CommunitySignalCrawler();
