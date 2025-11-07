import { supabase } from '@/integrations/supabase/client';

interface EconomicIndicator {
  id: string;
  indicator: string;
  category: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
  region: string;
  trend: 'up' | 'down' | 'stable';
  biblicalContext?: {
    relatedScriptures: string[];
    wisdomApplication: string;
    defiImplication: string;
  };
}

class MacroEconomicIndicatorCrawler {
  private indicators = [
    { name: 'Federal Funds Rate', category: 'Interest Rates', source: 'Federal Reserve' },
    { name: 'CPI Inflation', category: 'Inflation', source: 'Bureau of Labor Statistics' },
    { name: 'Unemployment Rate', category: 'Employment', source: 'Bureau of Labor Statistics' },
    { name: 'GDP Growth', category: 'Economic Growth', source: 'Bureau of Economic Analysis' },
    { name: 'M2 Money Supply', category: 'Monetary Policy', source: 'Federal Reserve' },
    { name: 'Consumer Confidence', category: 'Sentiment', source: 'Conference Board' }
  ];

  private regions = ['United States', 'European Union', 'United Kingdom', 'Global'];

  async crawlAllIndicators(onProgress?: (progress: number) => void): Promise<EconomicIndicator[]> {
    console.log('📊 Starting Macro Economic Indicator Crawler...');
    
    const allIndicators: EconomicIndicator[] = [];
    
    for (let i = 0; i < this.indicators.length; i++) {
      if (onProgress) {
        onProgress((i / this.indicators.length) * 100);
      }
      
      const data = await this.crawlIndicator(this.indicators[i]);
      allIndicators.push(...data);
      
      await this.storeIndicators(data);
    }
    
    if (onProgress) onProgress(100);
    
    console.log(`✅ Macro indicator crawler completed: ${allIndicators.length} data points collected`);
    return allIndicators;
  }

  private async crawlIndicator(indicator: any): Promise<EconomicIndicator[]> {
    // Mock data - in production, use FRED API, World Bank API, etc.
    const data: EconomicIndicator[] = this.regions.slice(0, 2).map(region => ({
      id: `${indicator.name}-${region}-${Date.now()}`,
      indicator: indicator.name,
      category: indicator.category,
      value: this.generateMockValue(indicator.category),
      unit: this.getUnit(indicator.category),
      timestamp: new Date().toISOString(),
      source: indicator.source,
      region,
      trend: this.calculateTrend(),
      biblicalContext: this.getBiblicalContext(indicator.name)
    }));
    
    await new Promise(resolve => setTimeout(resolve, 400));
    return data;
  }

  private generateMockValue(category: string): number {
    const values: Record<string, number> = {
      'Interest Rates': 4.5 + Math.random() * 2,
      'Inflation': 2.5 + Math.random() * 3,
      'Employment': 3.5 + Math.random() * 2,
      'Economic Growth': 1.5 + Math.random() * 3,
      'Monetary Policy': 18000 + Math.random() * 2000,
      'Sentiment': 90 + Math.random() * 20
    };
    
    return Number((values[category] || 50).toFixed(2));
  }

  private getUnit(category: string): string {
    const units: Record<string, string> = {
      'Interest Rates': '%',
      'Inflation': '%',
      'Employment': '%',
      'Economic Growth': '%',
      'Monetary Policy': 'Billion USD',
      'Sentiment': 'Index'
    };
    
    return units[category] || 'units';
  }

  private calculateTrend(): 'up' | 'down' | 'stable' {
    const rand = Math.random();
    if (rand < 0.33) return 'up';
    if (rand < 0.66) return 'down';
    return 'stable';
  }

  private getBiblicalContext(indicator: string): {
    relatedScriptures: string[];
    wisdomApplication: string;
    defiImplication: string;
  } {
    const contexts: Record<string, any> = {
      'Federal Funds Rate': {
        relatedScriptures: ['Proverbs 22:7', 'Romans 13:8'],
        wisdomApplication: 'High interest rates favor savers (Proverbs 21:5), low rates favor borrowers but increase debt temptation',
        defiImplication: 'Higher rates = lower DeFi yields competitiveness; lower rates = DeFi more attractive'
      },
      'CPI Inflation': {
        relatedScriptures: ['Proverbs 11:1', 'Leviticus 19:36'],
        wisdomApplication: 'Inflation erodes purchasing power - biblical principles favor honest weights and measures',
        defiImplication: 'High inflation drives demand for inflation-resistant assets like crypto and DeFi stablecoins'
      },
      'GDP Growth': {
        relatedScriptures: ['Proverbs 14:23', 'Ecclesiastes 11:6'],
        wisdomApplication: 'Economic growth reflects productive labor; recession requires wisdom in resource allocation',
        defiImplication: 'Strong growth = risk-on sentiment; recession = flight to stablecoins'
      }
    };
    
    return contexts[indicator] || {
      relatedScriptures: ['Proverbs 21:5'],
      wisdomApplication: 'Monitor economic conditions with wisdom',
      defiImplication: 'Market conditions affect DeFi strategies'
    };
  }

  private async storeIndicators(indicators: EconomicIndicator[]): Promise<void> {
    console.log(`💾 Storing ${indicators.length} economic indicators...`);
    for (const ind of indicators) {
      console.log(`  - ${ind.indicator} (${ind.region}): ${ind.value}${ind.unit} [${ind.trend}]`);
    }
  }
}

export const macroEconomicIndicatorCrawler = new MacroEconomicIndicatorCrawler();
