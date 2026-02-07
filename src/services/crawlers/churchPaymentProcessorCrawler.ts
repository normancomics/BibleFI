import { supabaseApi } from '@/integrations/supabase/apiClient';

interface ChurchPaymentData {
  churchId: string;
  churchName: string;
  processors: ProcessorInfo[];
  cryptoEnabled: boolean;
  onboardingStatus: string;
  techSupport: TechSupportInfo;
}

interface ProcessorInfo {
  processorName: string;
  processorType: string;
  supportedNetworks: string[];
  supportedCurrencies: string[];
  conversionToFiat: boolean;
}

interface TechSupportInfo {
  available: boolean;
  contactName?: string;
  contactEmail?: string;
  hours?: string;
  languages?: string[];
}

class ChurchPaymentProcessorCrawler {
  private progress: { total: number; processed: number; status: 'idle' | 'running' | 'completed' | 'error' } = { total: 0, processed: 0, status: 'idle' };

  async crawlAllChurchProcessors(onProgress?: (progress: number) => void): Promise<ChurchPaymentData[]> {
    console.log('⛪ Starting Church Payment Processor Crawler...');
    this.progress.status = 'running';
    
    // Fetch churches from database
    const { data: churches } = await supabaseApi
      .from('global_churches')
      .select('*')
      .eq('accepts_crypto', true)
      .limit(100);
    
    if (!churches) return [];
    
    this.progress.total = churches.length;
    const allProcessorData: ChurchPaymentData[] = [];
    
    for (let i = 0; i < churches.length; i++) {
      if (onProgress) {
        onProgress((i / churches.length) * 100);
      }
      
      const processorData = await this.analyzeChurchProcessor(churches[i]);
      allProcessorData.push(processorData);
      
      await this.storeProcessorData(processorData);
      
      this.progress.processed = i + 1;
    }
    
    this.progress.status = 'completed';
    if (onProgress) onProgress(100);
    
    console.log(`✅ Church processor crawler completed: ${allProcessorData.length} churches analyzed`);
    return allProcessorData;
  }

  private async analyzeChurchProcessor(church: any): Promise<ChurchPaymentData> {
    // Check existing processor data
    const { data: existingProcessor } = await supabaseApi
      .from('church_payment_processors')
      .select('*')
      .eq('church_id', church.id)
      .single();
    
    return {
      churchId: church.id,
      churchName: church.name,
      processors: existingProcessor ? [{
        processorName: existingProcessor.processor_name,
        processorType: existingProcessor.processor_type,
        supportedNetworks: existingProcessor.supported_networks || [],
        supportedCurrencies: existingProcessor.supported_currencies || [],
        conversionToFiat: existingProcessor.conversion_to_fiat || false
      }] : [],
      cryptoEnabled: church.accepts_crypto,
      onboardingStatus: existingProcessor?.onboarding_status || 'not_started',
      techSupport: {
        available: !!existingProcessor?.tech_contact_email,
        contactName: existingProcessor?.tech_contact_name,
        contactEmail: existingProcessor?.tech_contact_email,
        hours: existingProcessor?.it_department_hours,
        languages: existingProcessor ? church.assistance_languages : ['English']
      }
    };
  }

  private async storeProcessorData(data: ChurchPaymentData): Promise<void> {
    console.log(`💾 Church: ${data.churchName} - ${data.processors.length} processor(s)`);
  }

  getProgress() {
    return this.progress;
  }
}

export const churchPaymentProcessorCrawler = new ChurchPaymentProcessorCrawler();
