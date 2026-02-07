import { supabase } from '@/integrations/supabase/client';
import { supabaseApi } from '@/integrations/supabase/apiClient';

interface LiveStats {
  totalUsers: number;
  activeStreams: number;
  totalTithed: number;
  churchesRegistered: number;
  wisdomScoreAvg: number;
  biblicalVersesAnalyzed: number;
  defiProtocolsIntegrated: number;
  lastUpdated: string;
}

interface ChurchGrowthData {
  month: string;
  churches: number;
  cryptoEnabled: number;
  verified: number;
}

interface WisdomTrend {
  date: string;
  averageScore: number;
  totalScores: number;
  topCategory: string;
}

export class RealTimeDataService {
  private static instance: RealTimeDataService;
  private statsCache: LiveStats | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): RealTimeDataService {
    if (!this.instance) {
      this.instance = new RealTimeDataService();
    }
    return this.instance;
  }

  // Get live platform statistics
  async getLiveStats(): Promise<LiveStats> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.statsCache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.statsCache;
    }

    try {
      // Fetch real data from multiple tables
      const [
        churchesResult,
        streamsResult,
        wisdomResult,
        versesResult
      ] = await Promise.allSettled([
        supabaseApi.from('global_churches').select('id, accepts_crypto', { count: 'exact' }),
        supabase.from('superfluid_streams').select('id, status', { count: 'exact' }),
        supabase.from('wisdom_scores').select('score'),
        supabase.from('bible_verses').select('financial_relevance').gt('financial_relevance', 0)
      ]);

      const churches = churchesResult.status === 'fulfilled' ? churchesResult.value : { data: [], count: 0 };
      const streams = streamsResult.status === 'fulfilled' ? streamsResult.value : { data: [], count: 0 };
      const wisdom = wisdomResult.status === 'fulfilled' ? wisdomResult.value : { data: [] };
      const verses = versesResult.status === 'fulfilled' ? versesResult.value : { data: [] };

      // Calculate active streams
      const activeStreams = streams.data?.filter(s => s.status === 'active').length || 0;

      // Calculate average wisdom score
      const wisdomScores = wisdom.data?.map(w => w.score) || [];
      const avgWisdom = wisdomScores.length > 0 
        ? wisdomScores.reduce((a, b) => a + b, 0) / wisdomScores.length 
        : 0;

      // Mock some additional data that would come from other sources
      const stats: LiveStats = {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        activeStreams,
        totalTithed: Math.floor(Math.random() * 50000) + 25000,
        churchesRegistered: churches.count || 0,
        wisdomScoreAvg: Math.round(avgWisdom * 10) / 10,
        biblicalVersesAnalyzed: verses.data?.length || 0,
        defiProtocolsIntegrated: 12, // Static for now
        lastUpdated: new Date().toISOString()
      };

      this.statsCache = stats;
      this.lastFetch = now;
      
      return stats;

    } catch (error) {
      console.error('Error fetching live stats:', error);
      
      // Return fallback data
      return {
        totalUsers: 0,
        activeStreams: 0,
        totalTithed: 0,
        churchesRegistered: 0,
        wisdomScoreAvg: 0,
        biblicalVersesAnalyzed: 0,
        defiProtocolsIntegrated: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Get church growth data over time
  async getChurchGrowthData(): Promise<ChurchGrowthData[]> {
    try {
      const { data: churches, error } = await supabaseApi
        .from('global_churches')
        .select('created_at, accepts_crypto, verified')
        .order('created_at');

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: ChurchGrowthData } = {};
      
      churches?.forEach(church => {
        const date = new Date(church.created_at);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            churches: 0,
            cryptoEnabled: 0,
            verified: 0
          };
        }
        
        monthlyData[monthKey].churches++;
        if (church.accepts_crypto) monthlyData[monthKey].cryptoEnabled++;
        if (church.verified) monthlyData[monthKey].verified++;
      });

      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    } catch (error) {
      console.error('Error fetching church growth data:', error);
      return [];
    }
  }

  // Get wisdom score trends
  async getWisdomTrends(): Promise<WisdomTrend[]> {
    try {
      const { data: scores, error } = await supabase
        .from('wisdom_scores')
        .select('score, calculation_date, factors')
        .order('calculation_date');

      if (error) throw error;

      // Group by day
      const dailyData: { [key: string]: { scores: number[], categories: string[] } } = {};
      
      scores?.forEach(score => {
        const date = new Date(score.calculation_date).toISOString().split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = { scores: [], categories: [] };
        }
        
        dailyData[date].scores.push(score.score);
        
        // Extract categories from factors if available
        if (score.factors && typeof score.factors === 'object') {
          const factors = score.factors as any;
          if (factors.categories) {
            dailyData[date].categories.push(...factors.categories);
          }
        }
      });

      return Object.entries(dailyData).map(([date, data]) => {
        const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        const topCategory = this.findMostCommon(data.categories) || 'stewardship';
        
        return {
          date,
          averageScore: Math.round(avgScore * 10) / 10,
          totalScores: data.scores.length,
          topCategory
        };
      }).sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
      console.error('Error fetching wisdom trends:', error);
      return [];
    }
  }

  // Setup real-time subscriptions
  setupRealTimeSubscriptions(onDataUpdate: (stats: LiveStats) => void) {
    // Subscribe to church updates
    const churchChannel = supabase
      .channel('churches-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'global_churches' },
        () => this.invalidateCache()
      )
      .subscribe();

    // Subscribe to streams updates  
    const streamsChannel = supabase
      .channel('streams-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'superfluid_streams' },
        () => this.invalidateCache()
      )
      .subscribe();

    // Subscribe to wisdom scores
    const wisdomChannel = supabase
      .channel('wisdom-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wisdom_scores' },
        () => this.invalidateCache()
      )
      .subscribe();

    // Auto-refresh every minute
    const interval = setInterval(async () => {
      const freshStats = await this.getLiveStats();
      onDataUpdate(freshStats);
    }, 60000);

    return () => {
      supabase.removeChannel(churchChannel);
      supabase.removeChannel(streamsChannel);
      supabase.removeChannel(wisdomChannel);
      clearInterval(interval);
    };
  }

  private invalidateCache() {
    this.statsCache = null;
    this.lastFetch = 0;
  }

  private findMostCommon(arr: string[]): string | null {
    if (arr.length === 0) return null;
    
    const counts: { [key: string]: number } = {};
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    )[0];
  }
}

export const realTimeDataService = RealTimeDataService.getInstance();